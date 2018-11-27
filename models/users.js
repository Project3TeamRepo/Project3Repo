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
    Active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  });

  return Users;
};
