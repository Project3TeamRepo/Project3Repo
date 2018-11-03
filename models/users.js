module.exports = function (sequelize, DataTypes) {
  var Users = sequelize.define("users", {
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
      validate: {
        len: [1, 60]
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
