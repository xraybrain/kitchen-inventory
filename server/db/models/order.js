module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
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
      description: {
        type: DataTypes.STRING,
      },
      totalItems: {
        type: DataTypes.INTEGER,
      },
      // totalPrice: {
      //   type: DataTypes.DECIMAL(8, 2),
      // },
    },
    {
      paranoid: true,
    }
  );

  Order.associate = (models) => {
    models.Order.belongsTo(models.Inventory, {
      foreignKey: 'inventoryId',
      model: 'inventories',
    });
    models.Order.belongsTo(models.User, {
      foreignKey: 'userId',
      model: 'users',
    });
    models.Order.hasMany(models.OrderList, {
      foreignKey: 'orderId',
      model: 'orderlists',
    });
  };

  return Order;
};
