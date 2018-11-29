module.exports = function() {

    var db = require("../models");

    const ChatRooms = db.chatrooms;
    const Users = db.users;    
    const Messages = db.chat_messages; 
    
    const ChatModel = {
        chatRooms: ChatRooms,
        members: Users,
        messages: Messages
    };

    return ChatModel;
};