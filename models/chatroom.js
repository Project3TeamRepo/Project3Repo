module.exports =  function(sequelize, DataTypes){

    const ChatRooms = sequelize.define("chatrooms", {
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
    },
    {
        underscored: true,
        freezeTableName:true,
        tableName:'chatrooms',
        classMethods:{
          associate:function(db){
            ChatRooms.belongsTo(db.users, {as: "creator", onDelete: 'cascade'});
            ChatRooms.belongsToMany(db.users, {through: "chatroom_members", onDelete: 'cascade', as: { singular: 'member', plural: 'members' }});
            ChatRooms.hasMany(db.chat_messages, {as: { singular: 'message', plural: 'messages' }, onDelete: 'cascade'});        
          }
        }
    });

    return ChatRooms;
}