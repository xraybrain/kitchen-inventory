module.exports = (sequelize, DataTypes) => {
  const RestockList = sequelize.define(
    'RestockList',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      restockId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'restocks',
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
        type: DataTypes.STRING,
      },
      subTotalPrice: {
        type: DataTypes.DECIMAL(8, 2),
      },
    },
    {
      paranoid: true,
    }
  );

  RestockList.associate = (models) => {
    models.RestockList.belongsTo(models.Restock, {
      foreignKey: 'restockId',
      model: 'restocks',
    });
    models.RestockList.belongsTo(models.Product, {
      foreignKey: 'productId',
      model: 'products',
    });
  };

  return RestockList;
};
