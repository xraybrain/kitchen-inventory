module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      inventoryId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'inventories',
          key: 'id',
        },
      },
      userType: { type: DataTypes.STRING },
      surname: { type: DataTypes.STRING },
      othernames: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      gender: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      imageURL: { type: DataTypes.STRING },
    },
    {
      paranoid: true,
    }
  );

  User.associate = (models) => {
    models.User.belongsTo(models.Inventory, {
      model: 'inventories',
      foreignKey: 'inventoryId',
    });
  };

  return User;
};
