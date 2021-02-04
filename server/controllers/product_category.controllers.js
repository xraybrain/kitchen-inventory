const BaseModel = require('../db/models/index');
const Feedback = require('../lib/Feedback');
const { deleteData } = require('../lib/helpers');
const UserType = require('../lib/models/UserType');
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
const {
  createProductCategory,
  ProductCategory,
} = require('../lib/models/ProductCategory');
const Validator = require('../lib/Validator');

exports.getCategories = async (req, res, next) => {
  let feedback;
  let page = Number(req.query.page) || 1;
  let paginate = req.query.paginate === 'false' ? false : true;
  let limit = Number(req.query.limit) || 20;
  let searchquery = req.query.searchquery;
  let authorization = req.query.authorization;
  let authUser = GetAuthUser(authorization);

  if (authUser) {
    let filter = {};
    if (searchquery) {
      filter[BaseModel.Sequelize.Op.or] = [
        { name: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
      ];
    }

    filter['inventoryId'] = authUser.inventoryId;

    let pager = new Pager('ProductCategory', limit, page);
    feedback = await pager.getData(
      filter,
      [{ model: BaseModel.Inventory }],
      [['name', 'ASC']],
      paginate
    );
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.saveCategory = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let formErrors = {};
  let feedback;

  if (
    authUser &&
    (authUser.userType === UserType.SuperAdmin ||
      authUser.userType === UserType.Admin)
  ) {
    try {
      let categoryData = createProductCategory(formData, authUser.inventoryId);
      if (Validator.isEmpty(categoryData.name))
        formErrors['name'] = new FormError('Category name field is required');

      if (Object.keys(formErrors).length === 0) {
        // no errors
        let categoryExists = await BaseModel.ProductCategory.findOne({
          where: {
            name: categoryData.name,
            inventoryId: authUser.inventoryId,
          },
        });
        if (categoryExists) {
          return res.json(new Feedback(null, false, 'Category already exists'));
        }
        // Everything is ok
        let category = await BaseModel.ProductCategory.create(categoryData);
        category.id = category.null;
        feedback = new Feedback(category, true, 'saved successfully.');
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

exports.updateCategory = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let categoryData = new ProductCategory(null, formData.name);
  let feedback;

  if (authUser) {
    try {
      let result = (
        await BaseModel.ProductCategory.update(categoryData, {
          where: { id: formData.id },
        })
      )[0];
      let updatedCategory = await BaseModel.ProductCategory.findOne({
        where: { id: formData.id },
      });
      feedback = new Feedback(updatedCategory, true, 'updated successfully.');
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

exports.deleteCategory = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    let result = await deleteData('ProductCategory', {
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
