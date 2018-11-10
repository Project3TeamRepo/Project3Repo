module.exports = function (sequelize, DataTypes) {
    var ShoppingItems = sequelize.define("shopping_items", {
        List_Name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        List_Quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        List_Location: {
            type: DataTypes.STRING,
            validate: {
                len: [1, 255]
            }
        },
        List_Status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        User_Id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return ShoppingItems;
};