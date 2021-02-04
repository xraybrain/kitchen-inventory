module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('restocks', {
      id: {
        type: Sequelize.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      inventoryId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'inventories',
          key: 'id',
        },
      },
      userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      totalItems: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      totalPrice: {
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
    return queryInterface.dropTable('restocks');
  },
};
