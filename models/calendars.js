module.exports = function (sequelize, DataTypes) {
    var Calendars = sequelize.define("calendars", {
        Event_Name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 40]
            }
        },
        Start_Date: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 10]
            }
        },
        Event_Info: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1, 140]
            }
        },
        Location: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 40]
            }
        }
    });
    Calendars.associate = function (models) {
        Calendars.belongsTo(models.users, {
            foreignKey: {
                allowNull: false
            }
        });
        Calendars.belongsTo(models.event_types, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    return Calendars;
};