const router = require('express').Router();

const {
  getRestocks,
  saveRestock,
  saveRestockLists,
  deleteRestock,
  deleteRestockList,
} = require('../controllers/restock.controllers');

router.get('/restocks/', getRestocks);
router.post('/restocks/', saveRestock);
router.post('/restocks/restocklists', saveRestockLists);
router.delete('/restocks/', deleteRestock);
router.delete('/restocks/restocklists', deleteRestockList);

module.exports = router;
