module.exports = function() {

    var db = require("../models");

    const ChatRooms = db.chatrooms;
    const Users = db.users;    
    const Messages = db.chat_messages; 
    
    ChatRooms.belongsTo(Users, {as: "creator", onDelete: 'cascade'});
    ChatRooms.belongsToMany(Users, {through: "chatroom_members", onDelete: 'cascade', as: { singular: 'member', plural: 'members' }});
    ChatRooms.hasMany(Messages, {as: { singular: 'message', plural: 'messages' }, onDelete: 'cascade'});
    Users.belongsToMany(ChatRooms, {through: "chatroom_members", onDelete: 'cascade', as: { singular: 'chatroom', plural: 'chatrooms' }});
    Messages.belongsTo(Users, {as: "author", onDelete: 'cascade'});

    const ChatModel = {
        chatRooms: ChatRooms,
        members: Users,
        messages: Messages
    };

    return ChatModel;
};