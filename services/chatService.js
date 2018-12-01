const chatPersistence = require('./chatPersistenceService.js');
    
const Members = chatPersistence.members;
const ChatRooms = chatPersistence.chatRooms;
const sequelize = chatPersistence.sequelize;
const Messages = chatPersistence.messages;

async function listAllMembers() {
  try {
    const members = await Members.findAll({attributes: ['user_id', 'User_Name'], where: { Active: true }, raw: true});
    if(members) {
      console.log("Members found");
      return { members: members };
    } else {
      console.log("No members found");
      return { members: [] };
    }
  } catch (error) {
    console.error(error.stack);
    return { error: "Errors finding members: " + error };
  }
}

async function findMember(userId) {
  try {
    console.log("Looking for member " + userId);
    const member = await Members.findOne({ where: { user_id: userId } });
    if (member) {
      console.log("Member found");
      return { member: member };
    } else {
      return {};
    }
  } catch (e) {
    console.error(e.stack);
    return { error: "Unable to search for member: " + e };
  }
}

async function listAllChatRooms(userId) {
  try {
    const { member, error } = await findMember(userId);
    if(!error && member) {
      const chatRooms = await member.getChatrooms({attributes: ['chat_room_id', 'chat_room_name', 'chat_room_description'], raw: true});
      if(chatRooms) {
        return { chatRooms: chatRooms };
      } else {
        return { chatRooms: [] };
      }
    } else {
      const message = (error) ? error : "No member available";
      console.error("Error while processing request: " + message);
      return { error: message };
    }
  } catch (error) {
    console.error(error.stack);
    console.error("Error while processing request: " + error);
    return { error: error };
  }
}

async function findChatRoomByName(name) {
  try {
    const chatRoom = await ChatRooms.findOne({
      where: {chat_room_name: name},
      include: [{
        model: Members,
        as: 'creator'
      }]
    });
    return { chatRoom: chatRoom };
  } catch (error) {
      console.error(error.stack);
      return { error: "Error while processing the request: " + error };
  }
}

async function updateChatMembers(chatRoom, members) {
  try {
    return sequelize.transaction(async transaction => {
      await sequelize.query('DELETE FROM CHATROOM_MEMBERS WHERE chatroom_chat_room_id = ' + chatRoom.chat_room_id + ';', { transaction: transaction });
      return Promise.all(members.map(
        m => sequelize.query('INSERT INTO CHATROOM_MEMBERS(chatroom_chat_room_id, user_user_id) VALUES (' + chatRoom.chat_room_id + ', ' + m.member.user_id + ');', { transaction: transaction })));
    }).then(
      () => { return { chatRoom: chatRoom } })
      .catch( error => {
          console.error(error.stack);
          return { error: "Unable to update members in chat room: " + error };
      });
  } catch (error) {
    console.error(error.stack);
    return { error: "Unable to update members in chat room: " + error };
  }
}

async function createChatRoom(userId, name, description, members) {
  try {
    console.log("About to find member");
    const { member, error } = await findMember(userId);
    if(!error && member) {
      console.log("About to search for room by name");
      const { chatRoomByName, error } = await findChatRoomByName(name);
      console.log("Checking if room errored");
      if(!error) {
        console.log("Query was successful");
        if(!chatRoomByName) {
          console.log("Room name not found. About to create new room");
          const newChatRoom = await ChatRooms.create({chat_room_name: name, chat_room_description: description, creator_user_id: member.user_id});
          console.log("Room created");
          if(members) {
            console.log("Adding new members");
            const memberObjects = await Promise.all(members.map(mId => findMember(mId)));
            await updateChatMembers(newChatRoom, memberObjects);
            return { chatRoom: newChatRoom };
          }
        } else {
          console.log("Existing room found");
          const members = await chatRoomByName.getMembers();
          if(members.filter(m => m.user_id === userId).length > 0) {
            console.log("Requesting member belonged to chat room. Returning room");
            return { chatRoom: chatRoomByName };
          } else {
            return { error: "User doesn't belong to chat room" };
          }
        }
      } else {
        return { error: error };
      }
    } else {
      const message = (error) ? error : "Unable to process member request";
      console.error(message);
      return { error: message };
    }
  } catch(e) {
    console.error(e.stack);
    return { error: "Unable to create chat room: " + e };
  }

}

async function getChatRoomForCreator(userId, chatRoomId) {
  try {
    const chatRoom = await ChatRooms.findOne({where: {chat_room_id: chatRoomId, creator_user_id: userId}});
    if(chatRoom) {
      return { chatRoom: chatRoom };
    } else {
      console.error("Chat Room " + chatRoomId + " does not belong to user " + userId);
      return { error: "Chat Room " + chatRoomId + " does not belong to user " + userId };
    }
  } catch(error) {
    console.error(error.stack);
    return { error: error };
  }
}

async function closeChatRoom(userId, chatRoomId) {
  try {
    await ChatRooms.destroy({where: {chat_room_id: chatRoomId}});
    return {};
  } catch(error) {
    console.error(error.stack);
    return { error: error };
  }
}

async function getMessages(userId, chatRoomId, messageCount) {

  try {
    const { chatRoom, error } = await getChatRoomForMember(userId, chatRoomId);
    if(!error && chatRoom) {
      const messages = await chatRoom.getMessages(
        {
          include: [{
            model: Members,
            as: 'author'
          }],
          attributes: ['message_id', 'message_text', 'message_time_stamp'],
          joinTableAttributes: ['User_Name'],
          raw: true
        });
      if(messages) {
        let messageResult = messages.map( m => { return {
          message_id: m.message_id,
          message_text: m.message_text,
          message_time_stamp: m.message_time_stamp,
          author: m["author.User_Name"] }
        });
        if(messageCount) {
          const messagesToReturn = Math.min(messageCount, messageResult.length);
          return { messages: messageResult.slice().reverse().slice(0, messagesToReturn).reverse() };
        } else {
          return { messages: messageResult };
        }
      } else {
        return { messages: [] };
      }
    } else {
      const message = "Unable to retrieve chat room";
      console.error(message);
      return { error: error };
    }
  } catch(error) {
    console.error(error.stack);
    return { error: error };
  }
}

async function getChatRoomForMember(userId, chatRoomId) {

  try {
    const chatRoom = await ChatRooms.findOne({where: {chat_room_id: chatRoomId}});
    if(chatRoom) {
      const members = await chatRoom.getMembers();
      if(members.filter(m => m.user_id === userId).length > 0) {
        return { chatRoom: chatRoom };
      } else {
        const message = "Member does not belong to chat room";
        console.error(message);
        return { error: message };
      }
    } else {
      const message = "Could not retrieve chat room information";
      console.error(message);
      return { error: message };
    }
  } catch(error) {
    console.error(error.stack);
    return {error: error};
  }
}

async function postMessageInRoom(userId, chatRoomId, messageText) {

  try {
    const { chatRoom, error } = await getChatRoomForMember(userId, chatRoomId);
    if(!error && chatRoom) {
      let currentDateTime = new Date();
      const message = await Messages.create(
        {
          message_text: messageText,
          message_time_stamp: currentDateTime,
          author_user_id: userId,
          chatroom_chat_room_id: chatRoomId
        });
      return { message: message };
    } else {
      const message = "Cannot post on a chat you're not a member of";
      return { error: message };
    }
  } catch(error) {
    console.error(error.stack);
    return { error: error };
  }
}

//
// {chatRoom: {name, description, creator}, members: {userId, name}}
//
async function getChatRoomInformation(userId, chatRoomId) {

  try {
    const { chatRoom, error } = await getChatRoomForMember(userId, chatRoomId);
    if(!error && chatRoom) {
      const chatRoomData = {
        chatRoomId: chatRoom.chat_room_id,
        chatRoomName: chatRoom.chat_room_name,
        chatRoomDescription: chatRoom.chat_room_description
      };

      const members = await chatRoom.getMembers();
      if(members) {
        const memberData = members.map(m => { return {userId: m.user_id, userName: m.User_Name}; });

        return {chatRoomInfo: { chatRoom: chatRoomData, members: memberData}};
      } else {
        const message = (error) ? error : "Unable to retrieve room members";
        console.error(message);
        return { error: message };
      }
    } else {
      const message = (error) ? error : "Unable to retrieve room by members";
      console.error(message);
      return { error: message };
    }
  } catch(error) {
    console.error(error.stack);
    return { error: error }
  }
}

function isMemberPresent(userId, members) {
    return members && members.filter(m => m === userId).length !== 0;
}

async function updateChatRoomMembers(userId, chatRoomId, members) {
  try {
    const { chatRoom, error } = await getChatRoomForCreator(userId, chatRoomId);
    if(!error && chatRoom) {
      let sanitizedMemberList = [userId];
      if(members && members.length > 0) {
        sanitizedMemberList = isMemberPresent(userId, members) ? members : members.concat(userId);
      }
      const memberObjects = await Promise.all(sanitizedMemberList.map(mId => findMember(mId)));
      await updateChatMembers(chatRoom, memberObjects);
      return { chatRoom: chatRoom };
    } else {
      const message = (error) ? error : "Unable to process request";
      console.error(message);
      return { error: message };
    }
  } catch(error) {
    console.error(error.stack);
    return { error: "Error while updating chat members: " + error };
  }
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