const { isDigit } = require('../Validator');
exports.Product = class Product {
  constructor(
    inventoryId = null,
    categoryId = null,
    userId = null,
    imageUrl = null,
    name = null,
    price = null,
    quantityInStock = null,
    restockLevel = null,
    unit = null,
    expiryDate = null,
    hasLeftOver = null,
    Inventory = null,
    ProductCategory = null,
    User = null,
    id = null
  ) {
    console.log('restock => ', restockLevel);
    quantityInStock = quantityInStock || 0;

    if (inventoryId) this.inventoryId = inventoryId;
    if (categoryId) this.categoryId = categoryId;
    if (userId) this.userId = userId;
    if (imageUrl) this.imageUrl = imageUrl;
    if (name) this.name = name;
    if (price) this.price = price;
    if (quantityInStock >= 0) this.quantityInStock = quantityInStock;
    if (isDigit(restockLevel)) this.restockLevel = restockLevel;
    if (unit) this.unit = unit;
    if (expiryDate) this.expiryDate = expiryDate;
    if (hasLeftOver) this.hasLeftOver = hasLeftOver;
    if (Inventory) this.Inventory = Inventory;
    if (ProductCategory) this.ProductCategory = ProductCategory;
    if (User) this.User = User;
    if (id) this.id = id;
  }
};

exports.createProduct = (
  formData,
  inventoryId = null,
  userId = null,
  categoryId = null
) => {
  return new this.Product(
    inventoryId,
    categoryId,
    userId,
    formData.imageUrl,
    formData.name,
    formData.price,
    formData.quantityInStock,
    formData.restockLevel,
    formData.unit,
    formData.expiryDate,
    formData.hasLeftOver
  );
};

exports._createProduct = (productModel) => {
  return new this.Product(
    null,
    null,
    null,
    null,
    null,
    null,
    productModel.quantityInStock,
    null,
    null,
    null,
    productModel.hasLeftOver,
    null,
    null,
    null,
    productModel.id
  );
};
