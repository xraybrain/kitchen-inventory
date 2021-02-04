const {
  getCategories,
  saveCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/product_category.controllers');

const router = require('express').Router();

router.get('/categories/', getCategories);
router.post('/categories/', saveCategory);
router.put('/categories/', updateCategory);
router.delete('/categories/', deleteCategory);

module.exports = router;
