exports.Restock = class Restock {
  constructor(
    inventoryId,
    userId,
    totalItems,
    totalPrice,
    Inventory = null,
    User = null,
    id = null
  ) {
    if (inventoryId) this.inventoryId = inventoryId;
    if (userId) this.userId = userId;
    if (totalItems) this.totalItems = totalItems;
    if (totalPrice) this.totalPrice = totalPrice;
    if (Inventory) this.Inventory = Inventory;
    if (User) this.User = User;
    if (id) this.id = id;
  }
};

exports.createRestock = (formData, inventoryId, userId) => {
  return new this.Restock(
    inventoryId,
    userId,
    formData.totalItems,
    formData.totalPrice
  );
};
