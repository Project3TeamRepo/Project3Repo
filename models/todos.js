module.exports = function (sequelize, DataTypes) {
    var Todos = sequelize.define("todos", {

        Todo_Name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        Todo_Date: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [1, 10]
            }
        },
        Todo_Info: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: [1, 1000]
            }
        },
        Todo_Location: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [1, 255]
            }
        },
        Todo_Status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        User_Id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    
    return Todos;

};