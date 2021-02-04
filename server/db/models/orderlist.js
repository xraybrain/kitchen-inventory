module.exports = (sequelize, DataTypes) => {
  const OrderList = sequelize.define(
    'OrderList',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      orderId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
      },
      productId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      unit: {
        type: DataTypes.STRING,
      },
      hasLeftOver: {
        type: DataTypes.BOOLEAN,
      },
      // subTotalPrice: {
      //   type: DataTypes.DECIMAL(8, 2),
      // },
    },
    {
      paranoid: true,
    }
  );

  OrderList.associate = (models) => {
    models.OrderList.belongsTo(models.Order, {
      foreignKey: 'orderId',
      model: 'orders',
    });
    models.OrderList.belongsTo(models.Product, {
      foreignKey: 'productId',
      model: 'products',
    });
  };

  return OrderList;
};
