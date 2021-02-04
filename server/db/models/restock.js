module.exports = (sequelize, DataTypes) => {
  const Restock = sequelize.define(
    'Restock',
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
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      totalItems: {
        type: DataTypes.INTEGER,
      },
      totalPrice: {
        type: DataTypes.DECIMAL(8, 2),
      },
    },
    {
      paranoid: true,
    }
  );

  Restock.associate = (models) => {
    models.Restock.belongsTo(models.Inventory, {
      foreignKey: 'inventoryId',
      model: 'inventories',
    });
    models.Restock.belongsTo(models.User, {
      foreignKey: 'userId',
      model: 'users',
    });

    models.Restock.hasMany(models.RestockList, {
      foreignKey: 'restockId',
      model: 'restocklists',
    });
  };

  return Restock;
};
