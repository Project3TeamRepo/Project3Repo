var db = require("../models");

const ChatRooms = db.chatrooms;
const Users = db.users;    
const Messages = db.chat_messages; 

let ChatModel = {
    chatRooms: ChatRooms,
    members: Users,
    messages: Messages,
    sequelize: db.sequelize
};

module.exports = ChatModel;