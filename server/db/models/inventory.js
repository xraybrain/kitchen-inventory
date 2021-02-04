module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );

  // Inventory.associate = (models) => {
  //   models.Inventory.belongsTo(models.User, {
  //     foreignKey: 'userId',
  //     model: 'users',
  //   });
  // };

  return Inventory;
};
