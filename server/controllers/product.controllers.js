const BaseModel = require('../db/models/index');
const Feedback = require('../lib/Feedback');
const { deleteData, dataExists } = require('../lib/helpers');
const Pager = require('../lib/Pager');
const Sanitizer = require('../lib/Sanitizer');
const {
  generateErrorFeedback,
  generateAuthErrorFeedback,
  generateFormErrorFeedack,
  generatePermissionErrorFeedback,
} = require('../lib/models/ErrorHandler');
const { GetAuthUser } = require('../lib/AuthManager');
const FormError = require('../lib/models/FormError');
const Validator = require('../lib/Validator');
const { createProduct } = require('../lib/models/Product');

exports.getProducts = async (req, res, next) => {
  let feedback;
  let page = Number(req.query.page) || 1;
  let paginate = req.query.paginate === 'false' ? false : true;
  let limit = Number(req.query.limit) || 20;
  let searchquery = req.query.searchquery;
  let restock = req.query.restock === 'true' ? true : false;
  let outofstock = req.query.outofstock === 'true' ? true : false;
  let category = req.query.category || '';
  let authorization = req.query.authorization;
  let authUser = GetAuthUser(authorization);

  if (authUser) {
    let filter = {};
    if (searchquery) {
      filter[BaseModel.Sequelize.Op.or] = [
        { name: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
        { price: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
        { quantityInStock: Number(searchquery) || 0 },
        { restockLevel: Number(searchquery) || 0 },
      ];
    }

    if (restock) {
      // return only products that has reached their restock level
      filter['restockLevel'] = {
        [BaseModel.Sequelize.Op.gte]: BaseModel.Sequelize.col(
          'quantityInStock'
        ),
      };
    }

    if (outofstock) {
      // return only products that are out of stock
      filter['quantityInStock'] = {
        [BaseModel.Sequelize.Op.eq]: 0,
      };
    }

    if (category) {
      filter['categoryId'] = category;
    }

    filter['inventoryId'] = authUser.inventoryId;

    let pager = new Pager('Product', limit, page);
    feedback = await pager.getData(
      filter,
      [
        { model: BaseModel.Inventory },
        { model: BaseModel.User },
        { model: BaseModel.ProductCategory },
      ],
      [['createdAt', 'ASC']],
      paginate
    );
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.saveProduct = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let formErrors = {};
  let feedback;

  if (authUser) {
    try {
      let productData = createProduct(
        formData,
        authUser.inventoryId,
        authUser.user,
        formData.categoryId
      );

      if (Validator.isEmpty(productData.name))
        formErrors['name'] = new FormError('Product name field is required');
      if (Validator.isEmpty(productData.price))
        formErrors['price'] = new FormError('Product price field is required');
      if (Validator.isEmpty(productData.quantityInStock))
        formErrors['quantityInStock'] = new FormError(
          'Product quantity field is required'
        );
      if (Validator.isEmpty(productData.restockLevel))
        formErrors['restockLevel'] = new FormError(
          'Product restock level field is required'
        );
      if (Validator.isEmpty(productData.categoryId))
        formErrors['categoryId'] = new FormError(
          'Product category field is required'
        );

      console.log(productData);

      if (Object.keys(formErrors).length === 0) {
        let productExists = await dataExists('Product', {
          name: productData.name,
          inventoryId: authUser.inventoryId,
        });

        if (productExists) {
          return res.json(
            new Feedback(null, false, 'Product already exists in inventory')
          );
        }

        // Everything is ok
        let product = await BaseModel.Product.create(productData);
        let newProduct = await BaseModel.Product.findOne({
          where: { id: product.null },
          include: [
            { model: BaseModel.Inventory },
            { model: BaseModel.ProductCategory },
            { model: BaseModel.User },
          ],
        });
        feedback = new Feedback(newProduct, true, 'saved successfully.');
      } else {
        feedback = generateFormErrorFeedack(formErrors);
      }
    } catch (error) {
      console.log(error);
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generatePermissionErrorFeedback();
  }
  res.json(feedback);
};

exports.updateProduct = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let productData = createProduct(formData, null, null, formData.categoryId);
  let feedback;

  if (authUser) {
    try {
      let result = (
        await BaseModel.Product.update(productData, {
          where: { id: formData.id },
        })
      )[0];
      let updatedProduct = await BaseModel.Product.findOne({
        where: { id: formData.id },
        include: [{ model: BaseModel.ProductCategory }],
      });
      feedback = new Feedback(updatedProduct, true, 'updated successfully.');
      feedback.message = result ? feedback.message : 'no data was updated';
    } catch (error) {
      console.log(error);
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.deleteProduct = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    let result = await deleteData('Product', {
      field: 'id',
      value: id,
    });
    feedback = new Feedback(result, true, 'deleted successfully.');
    feedback.message = Boolean(feedback.result)
      ? feedback.message
      : 'no data was deleted';
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};
