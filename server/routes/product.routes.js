const router = require('express').Router();
const {
  getProducts,
  saveProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controllers');

router.get('/products/', getProducts);
router.post('/products/', saveProduct);
router.put('/products/', updateProduct);
router.delete('/products/', deleteProduct);

module.exports = router;
