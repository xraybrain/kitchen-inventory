module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('restocklists', {
      id: {
        type: Sequelize.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      restockId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'restocks',
          key: 'id',
        },
      },
      productId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      quantity: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      subTotalPrice: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('restocklists');
  },
};
