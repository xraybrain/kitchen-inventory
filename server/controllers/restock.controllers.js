const BaseModel = require('../db/models/index');
const Feedback = require('../lib/Feedback');
const { deleteData, insertRestockLists } = require('../lib/helpers');
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
const { createOrder } = require('../lib/models/Order');
const { createRestock } = require('../lib/models/Restock');

exports.getRestocks = async (req, res, next) => {
  let feedback;
  let page = Number(req.query.page) || 1;
  let paginate = req.query.paginate === 'false' ? false : true;
  let limit = Number(req.query.limit) || 20;
  let { fromdate, todate } = req.query;
  let authorization = req.query.authorization;
  let authUser = GetAuthUser(authorization);

  if (authUser) {
    let filter = {};
    if (fromdate && todate) {
      filter['createdAt'] = {
        [BaseModel.Sequelize.Op.gte]: fromdate,
        [BaseModel.Sequelize.Op.lte]: todate,
      };
    }

    filter['inventoryId'] = authUser.inventoryId;

    let pager = new Pager('Restock', limit, page);
    feedback = await pager.getData(
      filter,
      [
        { model: BaseModel.Inventory },
        { model: BaseModel.User },
        {
          model: BaseModel.RestockList,
          include: [{ model: BaseModel.Product }],
        },
      ],
      [['createdAt', 'DESC']],
      paginate
    );
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.saveRestock = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let formErrors = {};
  let feedback;

  if (authUser) {
    try {
      let restockData = createRestock(
        formData,
        authUser.inventoryId,
        authUser.user
      );

      if (Validator.isEmpty(restockData.totalPrice))
        formErrors['totalPrice'] = new FormError(
          'Restock total price field is required'
        );
      if (Validator.isEmpty(restockData.totalItems))
        formErrors['totalItems'] = new FormError(
          'Order total items field is required'
        );

      if (Object.keys(formErrors).length === 0) {
        // Everything is ok
        let restock = await BaseModel.Restock.create(restockData, {
          transaction,
        });

        await insertRestockLists(
          restock.null,
          formData.RestockLists,
          transaction
        );
        // commit transaction
        await transaction.commit();
        let newRestock = await BaseModel.Restock.findOne({
          where: { id: restock.null },
          include: [
            { model: BaseModel.User },
            {
              model: BaseModel.RestockList,
              include: [{ model: BaseModel.Product }],
            },
          ],
        });
        feedback = new Feedback(newRestock, true, 'saved successfully.');
      } else {
        feedback = generateFormErrorFeedack(formErrors);
      }
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generatePermissionErrorFeedback();
  }
  res.json(feedback);
};

exports.saveRestockLists = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    try {
      let restock = await BaseModel.Restock.findOne({
        where: { id: formData.id },
      });
      restock.totalItems += Number(formData.totalItems);
      restock.totalPrice =
        Number(restock.totalPrice) + Number(formData.totalPrice);
      await restock.save({ transaction });
      // Everything is ok
      await insertRestockLists(formData.id, formData.RestockLists, transaction);
      // commit transaction
      await transaction.commit();
      let updatedRestock = await BaseModel.Restock.findOne({
        where: { id: formData.id },
        include: [
          { model: BaseModel.User },
          {
            model: BaseModel.RestockList,
            include: [{ model: BaseModel.Product }],
          },
        ],
      });
      feedback = new Feedback(updatedRestock, true, 'saved successfully.');
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generatePermissionErrorFeedback();
  }
  res.json(feedback);
};

exports.deleteRestock = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    let result = await deleteData('Restock', {
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

exports.deleteRestockList = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    let result = await deleteData('RestockList', {
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
