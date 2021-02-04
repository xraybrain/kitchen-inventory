const BaseModel = require('../db/models/index');
const Feedback = require('../lib/Feedback');
const {
  validateUser,
  encryptPassword,
  deleteData,
  dataExists,
} = require('../lib/helpers');
const { User, createSuperUser, createUser } = require('../lib/models/User');
const UserType = require('../lib/models/UserType');
const Pager = require('../lib/Pager');
const Inventory = require('../lib/models/Inventory');
const Sanitizer = require('../lib/Sanitizer');
const {
  SQLErrorCodeMsg,
  generateErrorFeedback,
  generateFormErrorFeedack,
  generateAuthErrorFeedback,
} = require('../lib/models/ErrorHandler');
const { GetAuthUser } = require('../lib/AuthManager');
const FormError = require('../lib/models/FormError');
const { isDigit } = require('../lib/Validator');

exports.getUsers = async (req, res, next) => {
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
        { surname: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
        { othernames: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
        { email: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
        { gender: { [BaseModel.Sequelize.Op.like]: `%${searchquery}%` } },
      ];
    }

    filter['inventoryId'] = authUser.inventoryId;

    let pager = new Pager('User', limit, page);
    feedback = await pager.getData(
      filter,
      [{ model: BaseModel.Inventory }],
      [['surname', 'ASC']],
      paginate
    );
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.getUser = async (req, res, next) => {
  let feedback;
  let id = req.params.id;
  let field = isDigit(id) ? 'id' : 'email';
  try {
    let user = await BaseModel.User.findOne({
      where: { [field]: id },
      include: [{ model: BaseModel.Inventory }],
    });

    if (user) {
      feedback = new Feedback(user, true, 'success');
    } else {
      feedback = new Feedback(null, false, 'no user found');
    }
  } catch (error) {
    console.log(error);
    feedback = generateErrorFeedback(error);
  }
  res.json(feedback);
};

exports.createUserInventory = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();

  let { formData } = Sanitizer.sanitize(req.body);
  let formErrors = {};
  let feedback;

  try {
    let userData = createSuperUser(formData);
    let inventoryData = new Inventory(formData.Inventory.name);
    validateUser(formErrors, userData);

    if (Object.keys(formErrors).length === 0) {
      // no errors
      let emailExists = await dataExists('User', { email: userData.email });
      if (emailExists) {
        feedback = new Feedback(null, false, 'Email address already exists.');
        return res.json(feedback);
      }

      // Everything is ok
      userData.password = encryptPassword(userData.password);
      let inventory = await BaseModel.Inventory.create(inventoryData, {
        transaction,
      });
      userData.inventoryId = inventory.null;
      let user = await BaseModel.User.create(userData, {
        transaction,
      });
      user.id = user.null;
      feedback = new Feedback(user, true, 'saved successfully.');
      await transaction.commit();
    } else {
      feedback = generateFormErrorFeedack(formErrors);
    }
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    feedback = generateErrorFeedback(error);
  }
  res.json(feedback);
};

exports.saveUser = async (req, res, next) => {
  let feedback;
  let authorization = req.body.authorization;
  let authUser = GetAuthUser(authorization);

  if (authUser) {
    try {
      let formData = Sanitizer.sanitize(req.body.formData);
      let userData = createUser(formData, authUser.inventoryId);
      console.log(userData);
      let errors = {};
      validateUser(errors, userData);
      switch (formData.userType) {
        case UserType.Admin:
        case UserType.Staff:
          break;
        default:
          errors['userType'] = new FormError(
            'Please provide a valid user type.'
          );
      }

      if (Object.keys(errors).length === 0) {
        // no form errors
        let emailExists = await dataExists('User', {
          email: userData.email,
          inventoryId: authUser.inventoryId,
        });
        if (emailExists) {
          feedback = new Feedback(null, false, 'Email address already exists.');
          return res.json(feedback);
        }

        // Everything is ok
        userData.password = encryptPassword(userData.password);
        let user = await BaseModel.User.create(userData);
        user.id = user.null;
        feedback = new Feedback(user, true, 'saved successfully.');
      } else {
        feedback = new Feedback(errors, false, 'this form has error fields.');
      }
    } catch (error) {
      console.log(error);
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.updateUser = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let userData = new User(
    formData.surname,
    formData.othernames,
    formData.email,
    formData.gender,
    formData.password
  );
  let feedback;

  if (authUser) {
    try {
      if (userData.password)
        userData.password = encryptPassword(userData.password);
      let result = (
        await BaseModel.User.update(userData, {
          where: { id: formData.id },
        })
      )[0];

      let updatedUser = await BaseModel.User.findOne({
        where: { id: formData.id },
      });

      feedback = new Feedback(updatedUser, true, 'updated successfully.');
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

exports.deleteUser = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let userResult;
  let authUser = GetAuthUser(authorization);

  try {
    if (
      authUser.userType === UserType.SuperAdmin ||
      authUser.userType === UserType.Admin
    ) {
      let user = await BaseModel.User.findByPk(id);
      if (user && user.userType === UserType.SuperAdmin) {
        feedback = new Feedback(
          null,
          false,
          'This account can not be deleted.'
        );
      } else {
        userResult = await deleteData('User', { field: 'id', value: id });
        feedback = new Feedback(userResult, true, 'deleted successfully.');
      }
    } else {
      feedback = generateAuthErrorFeedback();
    }
  } catch (error) {
    feedback = generateErrorFeedback(error);
  }
  res.json(feedback);
};

exports.userDashboard = async (req, res, next) => {
  let feedback;
  let authorization = req.query.authorization;
  let authUser = GetAuthUser(authorization);

  try {
    if (authUser) {
      totalUsers = await BaseModel.User.count({
        where: { inventoryId: authUser.inventoryId },
      });
      totalRestocks = await BaseModel.Restock.count({
        where: { inventoryId: authUser.inventoryId },
      });
      totalItems = await BaseModel.Product.count({
        where: { inventoryId: authUser.inventoryId },
      });
      totalExpenses = await BaseModel.Restock.sum('totalPrice', {
        where: { inventoryId: authUser.inventoryId },
      });
      feedback = new Feedback(
        { totalUsers, totalRestocks, totalItems, totalExpenses },
        true,
        'success'
      );
    } else {
      feedback = generateAuthErrorFeedback();
    }
  } catch (error) {
    feedback = generateErrorFeedback(error);
  }
  res.json(feedback);
};

exports.resetPassword = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let userData = new User(null, null, null, null, formData.password);
  let feedback;
  try {
    userData.password = encryptPassword(userData.password);
    let result = await BaseModel.User.update(userData, {
      where: { id: formData.id },
    });
    feedback = new Feedback(result, true, 'updated successfully.');
  } catch (error) {
    console.log(error);
    feedback = generateErrorFeedback(error);
  }
  res.json(feedback);
};
