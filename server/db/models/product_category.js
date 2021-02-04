module.exports = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define(
    'ProductCategory',
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
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      paranoid: true,
    }
  );

  ProductCategory.associate = (models) => {
    models.ProductCategory.belongsTo(models.Inventory, {
      foreignKey: 'inventoryId',
      model: 'inventories',
    });
  };

  return ProductCategory;
};
