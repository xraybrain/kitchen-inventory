const BaseModel = require('../db/models/index');
const Feedback = require('../lib/Feedback');
const { deleteData, insertOrderLists } = require('../lib/helpers');
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

exports.getOrders = async (req, res, next) => {
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

    let pager = new Pager('Order', limit, page);
    feedback = await pager.getData(
      filter,
      [
        { model: BaseModel.Inventory },
        { model: BaseModel.User },
        { model: BaseModel.OrderList, include: [{ model: BaseModel.Product }] },
      ],
      [['createdAt', 'DESC']],
      paginate
    );
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.saveOrder = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let formErrors = {};
  let feedback;

  if (authUser) {
    try {
      let orderData = createOrder(
        formData,
        authUser.inventoryId,
        authUser.user
      );

      if (Validator.isEmpty(orderData.description))
        formErrors['description'] = new FormError(
          'Order description field is required'
        );
      if (Validator.isEmpty(orderData.totalItems))
        formErrors['totalItems'] = new FormError(
          'Order total items field is required'
        );

      if (Object.keys(formErrors).length === 0) {
        // Everything is ok
        let order = await BaseModel.Order.create(orderData, { transaction });
        // let orderListFormError;
        await insertOrderLists(order.null, formData.OrderLists, transaction);
        // commit transaction
        await transaction.commit();
        let newOrder = await BaseModel.Order.findOne({
          where: { id: order.null },
          include: [
            { model: BaseModel.User },
            {
              model: BaseModel.OrderList,
              include: [{ model: BaseModel.Product }],
            },
          ],
        });
        feedback = new Feedback(newOrder, true, 'saved successfully.');
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

exports.saveOrderLists = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    try {
      // Everything is ok
      let order = await BaseModel.Order.findOne({
        where: {
          id: formData.id,
        },
      });
      order.totalItems += Number(formData.totalItems);
      order.save({ transaction });

      await insertOrderLists(formData.id, formData.OrderLists, transaction);
      // commit transaction
      await transaction.commit();
      let newOrder = await BaseModel.Order.findOne({
        where: { id: formData.id },
        include: [
          { model: BaseModel.User },
          {
            model: BaseModel.OrderList,
            include: [{ model: BaseModel.Product }],
          },
        ],
      });
      feedback = new Feedback(newOrder, true, 'saved successfully.');
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

exports.updateOrder = async (req, res, next) => {
  const transaction = await BaseModel.sequelize.transaction();
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let orderData = createOrder(formData);
  let feedback;

  if (authUser) {
    try {
      let result = (
        await BaseModel.Order.update(orderData, {
          where: { id: formData.id },
          transaction,
        })
      )[0];

      let updatedOrder = await BaseModel.Order.findOne({
        where: { id: formData.id },
        include: [
          { model: BaseModel.User },
          {
            model: BaseModel.OrderList,
            include: [{ model: BaseModel.Product }],
          },
        ],
      });
      feedback = new Feedback(updatedOrder, true, 'updated successfully.');
      feedback.message = result ? feedback.message : 'no data was updated';
      transaction.commit();
    } catch (error) {
      console.log(error);
      transaction.rollback();
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generateAuthErrorFeedback();
  }
  res.json(feedback);
};

exports.deleteOrder = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    let result = await deleteData('Order', {
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

exports.deleteOrderList = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser) {
    let result = await deleteData('OrderList', {
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
