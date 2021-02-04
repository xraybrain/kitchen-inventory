const bcrypt = require('bcryptjs');
const BaseModel = require('../db/models');
const Validator = require('./Validator');
const FormError = require('./models/FormError');
const UserType = require('./models/UserType');
const { _createProduct } = require('./models/Product');
const { createOrderList } = require('./models/OrderList');
const DataExistsError = require('./models/DataExistsError');
const { createRestockList } = require('./models/RestockList');

exports.dataExists = async (model, whereClause = {}) => {
  return await BaseModel[model].findOne({
    where: whereClause,
  });
};

exports.encryptPassword = (password) => {
  let salt = bcrypt.genSaltSync(12);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
};

exports.validateUser = (errors = {}, formData) => {
  if (!Validator.isEmail(formData.email)) {
    errors['email'] = new FormError('Please provide a valid email.');
  }

  if (!Validator.isRealName(formData.surname)) {
    errors['surname'] = new FormError('Please provide a valid surname.', [
      'no digit or special characters',
    ]);
  }

  if (!Validator.isRealNames(formData.otherNames)) {
    errors['surname'] = new FormError('Please provide a valid othernames.', [
      'no digit or special characters',
    ]);
  }

  if (Validator.isEmpty(formData.password)) {
    errors['password'] = new FormError('Password field is required.');
  }

  if (Validator.isEmpty(formData.gender)) {
    errors['gender'] = new FormError('Gender field is required.');
  }

  if (Validator.isEmpty(formData.userType)) {
    errors['userType'] = new FormError('User type field is required.');
  }
};

exports.deleteData = async (
  model,
  query = { field: '', value: '' },
  transaction = null
) => {
  try {
    let result = await BaseModel[model].destroy(
      {
        where: { [query.field]: query.value },
      },
      {
        transaction,
      }
    );
    return result;
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return null;
  }
};

exports.insertOrderLists = async (orderId, OrderLists, transaction) => {
  for (let item of OrderLists) {
    let product = await BaseModel.Product.findByPk(item.productId);
    let p = _createProduct(product);
    // same unit deduct quantity
    if (product.unit === item.unit) {
      if (product.quantityInStock > 0) p.quantityInStock -= item.quantity;
      p.hasLeftOver = item.hasLeftOver || false;
    }
    // check if it has left over
    else if (item.hasLeftOver) {
      p.hasLeftOver = item.hasLeftOver;
    }
    // not same unit and has no hasLeftOver deduct quantity from product
    else {
      if (p.quantityInStock > 0) p.quantityInStock -= 1;
      p.hasLeftOver = false;
    }

    // check if this product has already been added for this orderlist
    let orderListExists = await BaseModel.OrderList.findOne({
      where: {
        orderId,
        productId: item.productId,
      },
      include: [{ model: BaseModel.Product }],
      transaction,
    });

    if (orderListExists) {
      throw new DataExistsError(
        `${orderListExists.Product.name} already added.`
      );
    }
    // update product
    await BaseModel.Product.update(p, {
      where: { id: p.id },
      transaction,
    });
    // insert into order lists
    await BaseModel.OrderList.create(createOrderList(item, orderId), {
      transaction,
    });
  }
};

exports.insertRestockLists = async (restockId, RestockLists, transaction) => {
  for (let item of RestockLists) {
    let product = await BaseModel.Product.findByPk(item.productId);
    let p = _createProduct(product);
    p.quantityInStock = p.quantityInStock ? p.quantityInStock : 0;
    p.quantityInStock += item.quantity;

    let itemAlreadyExists = await BaseModel.RestockList.findOne(
      {
        where: {
          restockId,
          productId: product.id,
        },
      },
      { paranoid: true }
    );

    if (itemAlreadyExists) {
      // throw new DataExistsError(`${product.name} is already added`);
      itemAlreadyExists.quantity = itemAlreadyExists.quantity
        ? itemAlreadyExists.quantity
        : 0;
      itemAlreadyExists.quantity += item.quantity;
      itemAlreadyExists.subTotalPrice += item.subTotalPrice;
      itemAlreadyExists.save();
    } else {
      // insert into restock lists
      await BaseModel.RestockList.create(createRestockList(item, restockId), {
        transaction,
      });
    }

    // update product
    await BaseModel.Product.update(p, {
      where: { id: p.id },
      transaction,
    });
  }
};

exports.resetProductQuantity = async (
  model,
  transaction,
  query = { key: null, value: null }
) => {
  let items = await BaseModel[model].findAll({
    where: { [query.key]: query.value },
  });
  for (let item of items) {
    let product = await BaseModel[model].findByPk(item.productId);
    if (product) {
      product.quantityInStock -= item.quantity;
      await product.save({ transaction });
    }
  }
};
