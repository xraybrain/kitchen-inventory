exports.OrderList = class OrderList {
  constructor(
    orderId,
    productId,
    quantity,
    unit,
    hasLeftOver,
    // subTotalPrice,
    Order = null,
    Product = null,
    id = null
  ) {
    if (orderId) this.orderId = orderId;
    if (productId) this.productId = productId;
    if (quantity) this.quantity = quantity;
    if (unit) this.unit = unit;
    if (hasLeftOver) this.hasLeftOver = hasLeftOver;
    // if (subTotalPrice) this.subTotalPrice = subTotalPrice;
    if (Order) this.Order = Order;
    if (Product) this.Product = Product;
    if (id) this.id = id;
  }
};

exports.createOrderList = (formData, orderId) => {
  return new this.OrderList(
    orderId,
    formData.productId,
    formData.quantity,
    formData.unit,
    formData.hasLeftOver
  );
};
