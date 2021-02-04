const router = require('express').Router();

const {
  updateInventory,
  deleteInventory,
} = require('../controllers/inventory.controllers');

router.put('/inventories/', updateInventory);
router.delete('/inventories/', deleteInventory);

module.exports = router;
