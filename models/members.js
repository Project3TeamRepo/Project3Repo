module.exports = function(sequelize, DataTypes) {

    var Members = sequelize.define("members", {
        member_id: {
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        member_name: {
            type: DataTypes.STRING, 
            allowNull: false,
            unique: true,
            validate: {
                len: [1, 255],
                notEmpty: true
            }
        }
    });

    return Members;

};