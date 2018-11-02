module.exports = function (sequelize, DataTypes) {
    var EventTypes = sequelize.define("event_types", {
        Type_Name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        }
    });
    
    return EventTypes;
};