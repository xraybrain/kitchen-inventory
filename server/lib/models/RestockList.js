exports.RestockList = class RestockList {
  constructor(
    restockId,
    productId,
    quantity,
    subTotalPrice,
    Restock = null,
    Product = null,
    id = null
  ) {
    if (restockId) this.restockId = restockId;
    if (productId) this.productId = productId;
    if (quantity) this.quantity = quantity;
    if (subTotalPrice) this.subTotalPrice = subTotalPrice;
    if (Restock) this.Restock = Restock;
    if (Product) this.Product = Product;
    if (id) this.id = id;
  }
};

exports.createRestockList = (formData, restockId) => {
  return new this.RestockList(
    restockId,
    formData.productId,
    formData.quantity,
    formData.subTotalPrice
  );
};
