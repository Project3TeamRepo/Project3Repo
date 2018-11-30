const chatPersistence = require('./chatPersistenceService.js');
    
const Members = chatPersistence.members;
const ChatRooms = chatPersistence.chatRooms;

function listAllMembers() {
    return Members.findAll({attributes: ['user_id', 'User_Name'], where: { Active: true }, raw: true}).then(
            members => {
                console.log("Members found");
                return (members || []);
            }).catch(
            error => {
                console.log("Errors finding members");
                return error;
            });
}

function findMember(userId) {
    return Members.findOne({where: {user_id: userId }}).then(
        member => {
            if(member) {
                return member;
            } else {
                return {error: "Member with id " + userId + " not found"};
            }
        }).catch( 
        error => {
            return error;
        }
    );
}

function listAllChatRooms(userId) {
    return findMember(userId).then(
        member => {
            return member.getChatRooms({attributes: ['chat_room_id', 'chat_room_name', 'chat_room_description'], raw: true}).then(
                chatRooms => {
                    return chatRooms || [];
                }).catch(
                error => {
                    return error;
                }
            );
        },
        error => {
            return error;
        }
    );
}

function findChatRoomByName(name) {
    return ChatRooms.findOne({
        where: {chat_room_name: name}, 
        include: [{
            model: Members,
            as: 'creator'
        }]
      });
}


function createChatRoom(userId, name, description, members) {
    try {
        console.log("Attempting to create chat room");
        return findMember(userId).then(
        member => {
            console.log("Member found when creating chat room");
                return findChatRoomByName(name).then(
                    chatRoom => {
                        if(!chatRoom) { // No chat room found. Create one
                            return ChatRooms.create(
                                {chat_room_name: name, chat_room_description: description, creator: member},
                                {
                                    include: [{
                                    model: Members,
                                    as: 'creator'
                                }]            
                              }).then(
                                chatRoom => {
                                    return Promise.all([member.addChatroom(chatRoom), chatRoom.addMember(member)]).then(
                                        results => {
                                            if(members) {
                                                return updateChatRoomMembers(userId, chatRoom.chat_room_id, members).then(
                                                    () => {
                                                        return chatRoom.chat_room_id;
                                                    }).catch(
                                                    error => {
                                                        return chatRoom.chat_room_id;
                                                    }
                                                );
                                            } else {
                                                return chatRoom.chat_room_id;
                                            }
                                        }).catch(
                                        error => {
                                            return error;
                                        }
                                    );    
                                }
                              ).catch(
                                error => {
                                    console.error("Error while retrieving chat room members: " + error);
                                    return error;
                                }
                              );
                        } else { // Found chat room. Check if user is member
                            chatRoom.getMembers().then(
                                members => {
                                    if(members && members.filter(m => m.user_id === userId).length > 0) {
                                        return chatRoom.chat_room_id;
                                    } else {
                                        return {error: "User " + userId + " does not belong to chat room " + chatRoom.chat_room_id};
                                    }
                            }).catch(
                                error => {
                                    console.error("Error while retrieving chat room members: " + error);
                                    return error;
                            });
                        }
                    }
                ).catch(error => {
                    console.error("Error while retrieving chat room: " + error);
                    return error;
                });
            }).catch(
            error => {
                console.error("Error while retrieving chat room: " + error);
                return error;
            });
    } catch(e) {
        console.log("Error while creating chat room: " + e);
        console.log(e.stack);
        return {error: "Error while creating chat room: " + e};            
    }
}

function getChatRoomForCreator(userId, chatRoomId) {
    return ChatRooms.findbyId(chatRoomId).then(
        chatRoom => {
            if(chatRoom) {
                return chatRoom.getCreator().then(
                    creator => {
                        if(creator.user_id === userId) {
                            return resolve(chatRoom);
                        } 
                        else {
                            return reject({error: "Chat Room " + chatRoomId + " does not belong to user " + userId});
                        }
                    }).catch(
                    error => {
                        return reject(error);
                    }
                );
            } else {
                return reject({error: "Chat Room with id " + chatRoomId + " not found", fields: ['chat_room_id']});
            }
        }).catch(
        error => {
            return reject(error);
        }
    );
}

function closeChatRoom(userId, chatRoomId) {
    return getChatRoomForCreator(userId, chatRoomId).then(
        chatRoom => {
            return ChatRooms.destroy({where: {chat_room_id: chatRoomId}}).then(
                () => {
                    return resolve();
                }).catch(
                error => {
                    return reject(error);
                });
        }).catch(
        error => {
            return reject(error);
        }
    );
}

function getMessages(userId, chatRoomId, messageCount) {
    return getChatRoomForMember(userId, chatRoomId).then(
        chatRoomWithMember => {
            return chatRoomWithMember.chatRoom.getMessages(
                {
                    include: [{
                        model: Members,
                        as: 'author'
                    }],
                    attributes: ['message_id', 'message_text', 'message_time_stamp'],
                    joinTableAttributes: ['User_Name'], 
                    raw: true
                }).then(
                    messages => {
                        if(messageCount) {
                            const messagesToReturn = Math.min(messageCount, messages.length);
                            return resolve(messages.slice().reverse().slice(0, messagesToReturn).reverse());
                        } else {
                            return resolve(messages);
                        }
                    }).catch(
                    error => {
                        return reject(error);
                    }
            );
        }).catch(
        error => {
            return reject(error);
        }
    );
}

function getChatRoomForMember(userId, chatRoomId) {
    return ChatRooms.findById(chatRoomId).then(
        chatRoom => {
            return chatRoom.getMembers({where: { user_id: userId }}).then(
                members => {
                    if(members && members.length === 1) {
                        return resolve({chatRoom: chatRoom, member: members[0]});
                    } else {
                        return reject({error: "User " + userId + " is not a member of Chat room " + chatRoomId});
                    }
                }).catch(
                error => {
                    return reject(error);
                }
            );
        }).catch(
        error => {
            return reject(error);
        }
    );
}

function postMessageInRoom(userId, chatRoomId, messageText) {
    return getChatRoomForMember(userId, chatRoomId).then(
        chatRoomWithMember => {
            let currentDateTime = new Date();
            return Messages.create({message_text: messageText, message_time_stamp: currentDateTime, author: chatRoomWithMember.member}, 
                {
                    include: [{
                        model: Members,
                        as: 'author'
                    }]
            }).then(
                message => {
                    return chatRoomWithMember.chatRoom.addMessage(message);
                }).catch(
                error => {
                    return reject(error);
                }
            );
        }).catch(
        error => {
            return reject(error);
        }
    );
}

//
// {chatRoom: {name, description, creator}, members: {userId, name}}
//
function getChatRoomInformation(userId, chatRoomId) {
    return getChatRoomForMember(userId, chatRoomId).then(
        chatRoomWithMember => {
            const chatRoomData = {chatRoomId: chatRoomWithMember.chatRoom.chat_room_id, 
                                  chatRoomName: chatRoomWithMember.chatRoom.chat_room_name,
                                  chatRoomDescription: chatRoomWithMember.chatRoom.chat_room_description };
            return chatRoomWithMember.chatRoom.getMembers().then(
                members => {
                    if(members) {
                        const memberData = members.map(m => { return {userId: m.user_id, userName: m.User_Name}; });
                        return resolve({chatRoom: chatRoomData, members: memberData});
                    } else {
                        return reject({error: "Unable to retrieve room members"});
                    }
                }).catch(
                error => {
                    return reject(error);
                }
            );
        }).catch(
        error => {
            return reject(error);
        }
    );
}

function isMemberPresent(userId, members) {
    return members && members.filter(m => m.user_id === userId).length !== 0;
}

function updateChatRoomMembers(userId, chatRoomId, members) {
    return getChatRoomForCreator(userId, chatRoomId).then(
        chatRoomWithMember => {
            if(members && members.length > 0) {
                const memberList = isMemberPresent(userId, members) ? members : members.concat(userId);
                return chatRoomWithMember.chatRoom.setMembers(memberList).then(
                    () => {
                        return resolve();
                    }).catch(
                    error => {
                        return reject(error);
                    }
                );
            } else {
                return reject({error: "User " + userId + " is not the creator for the Chat Room " + chatRoomId});
            }
        }).catch(
        error => {
            return reject(error);
        }
    );
}

let ChatService = {
    listAllMembers: listAllMembers,
    listAllChatRooms: listAllChatRooms,
    createChatRoom: createChatRoom,
    closeChatRoom: closeChatRoom,
    getChatRoomInformation: getChatRoomInformation,
    updateChatRoomMembers: updateChatRoomMembers,
    getMessages: getMessages,
    postMessageInRoom: postMessageInRoom 
};

module.exports = ChatService; 