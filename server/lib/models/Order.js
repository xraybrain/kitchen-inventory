exports.Order = class Order {
  constructor(
    inventoryId,
    userId,
    description,
    totalItems,
    OrderLists,
    Inventory = null,
    User = null,
    id = null
    // totalPrice,
  ) {
    if (inventoryId) this.inventoryId = inventoryId;
    if (userId) this.userId = userId;
    if (description) this.description = description;
    if (totalItems) this.totalItems = totalItems;
    if (OrderLists) this.OrderLists = OrderLists;
    if (Inventory) this.Inventory = Inventory;
    if (User) this.User = User;
    if (id) this.id = id;
    // if (totalPrice) this.totalPrice = totalPrice;
  }
};

exports.createOrder = (formData, inventoryId, userId) => {
  return new this.Order(
    inventoryId,
    userId,
    formData.description,
    formData.totalItems
    // formData.totalPrice
  );
};
