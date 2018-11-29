module.exports = function (sequelize, DataTypes) {
  var Users = sequelize.define("users", {
    user_id: {
      type: DataTypes.INTEGER, 
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    User_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 40]
      }
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
        len: [3, 255]
      }
    },
    Cell_Phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 14]
      }
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 40]
      }
    },
    Active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
      timestamps: true,
      underscored: true,
      freezeTableName:true,
      tableName:'users',
      classMethods:{
        associate:function(db){
          Users.belongsToMany(db.chatrooms, {through: "chatroom_members", onDelete: 'cascade', as: { singular: 'chatroom', plural: 'chatrooms' }});
        }
      }
  });

  return Users;
};
