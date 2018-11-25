module.exports =  function(sequelize, DataTypes){

    const Members = require ('./members.js')(sequelize, DataTypes);
    const ChatRooms = require ('./chatroom.js')(sequelize, DataTypes);

    var ChatMessage = sequelize.define("chat_messages", {
        message_id: {
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        message_text: {
            type: DataTypes.STRING, 
            allowNull: false,
            unique: true,
            validate: {
                len: [1, 10000],
                notEmpty: true
            }
        },
        message_time_stamp: {
            type: DataTypes.DATE, 
            allowNull: false,
            unique: false
        }
    });

    ChatMessage.hasOne(Members, {as: "author"});
    ChatMessage.hasOne(ChatRooms, {as: "audience"});

    return ChatMessage;
}