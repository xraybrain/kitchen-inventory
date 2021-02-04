exports.ProductCategory = class ProductCategory {
  constructor(inventoryId = null, name = null, id = null) {
    if (inventoryId) this.inventoryId = inventoryId;
    if (name) this.name = name;
    if (id) this.id = id;
  }
};

exports.createProductCategory = (formData = {}, inventoryId = null) => {
  return new this.ProductCategory(
    formData.inventoryId || inventoryId,
    formData.name
  );
};
