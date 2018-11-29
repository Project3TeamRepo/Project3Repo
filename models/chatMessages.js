module.exports =  function(sequelize, DataTypes){

    const ChatMessage = sequelize.define("chat_messages", {
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
    },
    {
        timestamps: true,
        underscored: true,
        freezeTableName:true,
        tableName:'chat_messages',
        classMethods:{
          associate:function(db){
            ChatMessage.belongsTo(db.users, {as: "author", onDelete: 'cascade'});
          }
        }
    });

    return ChatMessage;
}