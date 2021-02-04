const {
  getOrders,
  saveOrder,
  updateOrder,
  deleteOrder,
  saveOrderLists,
  deleteOrderList,
} = require('../controllers/order.controllers');

const router = require('express').Router();

router.get('/orders/', getOrders);
router.post('/orders/', saveOrder);
router.put('/orders/', updateOrder);
router.delete('/orders/', deleteOrder);

router.post('/orders/orderlists/', saveOrderLists);
router.delete('/orders/orderlists/', deleteOrderList);

module.exports = router;
