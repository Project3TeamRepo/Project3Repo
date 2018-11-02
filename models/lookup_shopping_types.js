module.exports = function (sequelize, DataTypes) {
    var LookupShoppingTypes = sequelize.define("lookup_shopping_types", {
        Type_Name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        }
    });

    return LookupShoppingTypes;
};