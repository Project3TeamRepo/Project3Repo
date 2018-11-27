module.exports = function() {

    const chatPersistence = require('./chatPersistenceService.js');
    
    const Members = chatPersistence.members;
    const ChatRooms = chatPersistence.chatRooms;

    function listAllMembers() {
        Members.findAll({attributes: ['user_id', 'User_Name'], where: { Active: true }, raw: true}).then(
            members => {
                return new Promise((resolve, reject) => resolve(members || []));
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            });
    }

    function findMember(userId) {
        Members.findbyId(userId).then(
            member => {
                if(member) {
                    return new Promise((resolve, reject) => resolve(member));
                } else {
                    return new Promise((resolve, reject) => reject({error: "Member with id " + userId + " not found"}));
                }
            }, 
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function listAllChatRooms(userId) {
        findMember(userId).then(
            member => {
                member.getChatRooms({attributes: ['chat_room_id', 'chat_room_name', 'chat_room_description'], raw: true}).then(
                    chatRooms => {
                        return new Promise((resolve, reject) => resolve(chatRooms || []));
                    },
                    error => {
                        return new Promise((resolve, reject) => reject(error));
                    }
                );
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function createChatRoom(userId, name, description, members) {
        findMember(userId).then(
            member => {
                ChatRooms.findOrCreate({where: {chat_room_name: name}, defaults: {chat_room_name: name, chat_room_description: description, creator: member}}, 
                    {
                        include: [{
                            model: Members,
                            as: 'creator'
                        }]
                }).spread(
                    (chatRoom, created) => {
                        if(created) {
                            Promise.all([member.addChatroom(chatRoom), chatRoom.addMember(member)]).then(
                                results => {
                                    if(members) {
                                        updateChatRoomMembers(userId, chatRoom.chat_room_id, members).then(
                                            () => {
                                                return new Promise((resolve, reject) => resolve(chatRoom.chat_room_id))
                                            },
                                            error => {
                                                return new Promise((resolve, reject) => resolve(chatRoom.chat_room_id))
                                            }
                                        );
                                    } else {
                                        return new Promise((resolve, reject) => resolve(chatRoom.chat_room_id));
                                    }
                                },
                                error => {
                                    return new Promise((resolve, reject) => reject(error));
                                }
                            );
                        } else {
                            chatRoom.getMembers().then(
                                members => {
                                    if(members && members.filter(m => m.user_id === userId).length > 0) {
                                        return new Promise((resolve, reject) => resolve(chatRoom.chat_room_id));
                                    } else {
                                        return new Promise((resolve, reject) => reject({error: "User " + userId + " does not belong to chat room " + chatRoom.chat_room_id}));
                                    }
                                },
                                error => {
                                    return new Promise((resolve, reject) => reject(error));
                                }
                            );
                        }
                    },
                    error => {
                        return new Promise((resolve, reject) => reject(error));
                    }
                );
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function getChatRoomForCreator(userId, chatRoomId) {
        ChatRooms.findbyId(chatRoomId).then(
            chatRoom => {
                if(chatRoom) {
                    chatRoom.getCreator().then(
                        creator => {
                            if(creator.user_id === userId) {
                                return new Promise((resolve, reject) => resolve(chatRoom));
                            } 
                            else {
                                return new Promise((resolve, reject) => reject({error: "Chat Room " + chatRoomId + " does not belong to user " + userId}));
                            }
                        },
                        error => {
                            return new Promise((resolve, reject) => reject(error));
                        }
                    );
                } else {
                    return new Promise((resolve, reject) => reject({error: "Chat Room with id " + chatRoomId + " not found", fields: ['chat_room_id']}));
                }
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function closeChatRoom(userId, chatRoomId) {
        getChatRoomForCreator(userId, chatRoomId).then(
            chatRoom => {
                ChatRooms.destroy({where: {chat_room_id: chatRoomId}}).then(
                    () => {
                        return new Promise((resolve, reject) => resolve());
                    },
                    error => {
                        return new Promise((resolve, reject) => reject(error));
                    });
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function getMessages(userId, chatRoomId, messageCount) {
        getChatRoomForMember(userId, chatRoomId).then(
            chatRoomWithMember => {
                chatRoomWithMember.chatRoom.getMessages(
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
                                return new Promise((resolve, reject) => resolve(messages.slice().reverse().slice(0, messagesToReturn).reverse()));
                            } else {
                                return new Promise((resolve, reject) => resolve(messages));
                            }
                        },
                        error => {
                            return new Promise((resolve, reject) => reject(error));
                        }
                );
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function getChatRoomForMember(userId, chatRoomId) {
        ChatRooms.findById(chatRoomId).then(
            chatRoom => {
                chatRoom.getMembers({where: { user_id: userId }}).then(
                    members => {
                        if(members && members.length === 1) {
                            return new Promise((resolve, reject) => resolve({chatRoom: chatRoom, member: members[0]}));
                        } else {
                            return new Promise((resolve, reject) => reject({error: "User " + userId + " is not a member of Chat room " + chatRoomId}));
                        }
                    },
                    error => {
                        return new Promise((resolve, reject) => reject(error));
                    }
                );
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function postMessageInRoom(userId, chatRoomId, messageText) {
        getChatRoomForMember(userId, chatRoomId).then(
            chatRoomWithMember => {
                let currentDateTime = new Date();
                Messages.create({message_text: messageText, message_time_stamp: currentDateTime, author: chatRoomWithMember.member}, 
                    {
                        include: [{
                            model: Members,
                            as: 'author'
                        }]
                }).then(
                    message => {
                        return chatRoomWithMember.chatRoom.addMessage(message);
                    },
                    error => {
                        return new Promise((resolve, reject) => reject(error));
                    }
                );
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    //
    // {chatRoom: {name, description, creator}, members: {userId, name}}
    //
    function getChatRoomInformation(userId, chatRoomId) {
        getChatRoomForMember(userId, chatRoomId).then(
            chatRoomWithMember => {
                const chatRoomData = {chatRoomId: chatRoomWithMember.chatRoom.chat_room_id, 
                                      chatRoomName: chatRoomWithMember.chatRoom.chat_room_name,
                                      chatRoomDescription: chatRoomWithMember.chatRoom.chat_room_description };
                chatRoomWithMember.chatRoom.getMembers().then(
                    members => {
                        if(members) {
                            const memberData = members.map(m => { return {userId: m.user_id, userName: m.User_Name}; });
                            return new Promise((resolve, reject) => resolve({chatRoom: chatRoomData, members: memberData}));
                        } else {
                            return new Promise((resolve, reject) => reject({error: "Unable to retrieve room members"}));
                        }
                    },
                    error => {
                        return new Promise((resolve, reject) => reject(error));
                    }
                );
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    function isMemberPresent(userId, members) {
        return members && members.filter(m => m.user_id === userId).length !== 0;
    }

    function updateChatRoomMembers(userId, chatRoomId, members) {
        getChatRoomForCreator(userId, chatRoomId).then(
            chatRoomWithMember => {
                if(members && members.length > 0) {
                    const memberList = isMemberPresent(userId, members) ? members : members.concat(userId);
                    chatRoomWithMember.chatRoom.setMembers(memberList).then(
                        () => {
                            return new Promise((resolve, reject) => resolve());
                        },
                        error => {
                            return new Promise((resolve, reject) => reject(error));
                        }
                    );
                } else {
                    return new Promise((resolve, reject) => reject({error: "User " + userId + " is not the creator for the Chat Room " + chatRoomId}));
                }
            },
            error => {
                return new Promise((resolve, reject) => reject(error));
            }
        );
    }

    const ChatService = {
        listAllMembers: listAllMembers,
        listAllChatRooms: listAllChatRooms,
        createChatRoom: createChatRoom,
        closeChatRoom: closeChatRoom,
        getChatRoomInformation: getChatRoomInformation,
        updateChatRoomMembers: updateChatRoomMembers,
        getMessages: getMessages,
        postMessageInRoom: postMessageInRoom 
    };

    return ChatService;

};