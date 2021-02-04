module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
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
      categoryId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'productcategories',
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
      imageUrl: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.DECIMAL(8, 2),
      },
      quantityInStock: {
        type: DataTypes.INTEGER,
      },
      restockLevel: {
        type: DataTypes.INTEGER,
      },
      unit: {
        type: DataTypes.STRING,
      },
      expiryDate: {
        type: DataTypes.DATE,
      },
      hasLeftOver: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      paranoid: true,
    }
  );

  Product.associate = (models) => {
    models.Product.belongsTo(models.Inventory, {
      foreignKey: 'inventoryId',
      model: 'inventories',
    });
    models.Product.belongsTo(models.User, {
      foreignKey: 'userId',
      model: 'users',
    });
    models.Product.belongsTo(models.ProductCategory, {
      foreignKey: 'categoryId',
      model: 'productcategories',
    });
    models.Product.hasMany(models.OrderList, {
      foreignKey: 'productId',
      model: 'orderlists',
    });
  };

  return Product;
};
