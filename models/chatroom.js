module.exports =  function(sequelize, DataTypes){

    const Members = require ('./members.js')(sequelize, DataTypes);
    const Messages = require ('./chatMessages.js')(sequelize, DataTypes);

    var ChatRooms = sequelize.define("chatrooms", {
        chat_room_id: {
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        chat_room_name: {
            type: DataTypes.STRING, 
            allowNull: false,
            unique: true,
            validate: {
                len: [1, 255],
                notEmpty: true
            }
        },
        chat_room_description: {
            type: DataTypes.STRING, 
            allowNull: true,
            unique: false,
            validate: {
                len: [1, 255],
                notEmpty: false
            }
        }
    });

    ChatRooms.hasOne(Member, {as: "chat_room_creator"});
    ChatRooms.belongToMany(Members, {through: "chatroom_members", as: "members"});
    ChatRooms.hasMany(Messages, {as: "messages"});
    Members.belongToMany(ChatRooms, {through: "chatroom_members", as: "chatrooms"});

    return ChatRooms;
}