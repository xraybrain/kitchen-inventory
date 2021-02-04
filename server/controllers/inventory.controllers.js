const BaseModel = require('../db/models/index');
const { GetAuthUser } = require('../lib/AuthManager');
const Feedback = require('../lib/Feedback');
const { deleteData } = require('../lib/helpers');
const {
  generateErrorFeedback,
  generatePermissionError,
} = require('../lib/models/ErrorHandler');
const Inventory = require('../lib/models/Inventory');
const UserType = require('../lib/models/UserType');
const Sanitizer = require('../lib/Sanitizer');

exports.updateInventory = async (req, res, next) => {
  let { formData, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser && authUser.userType === UserType.SuperAdmin) {
    let inventoryData = new Inventory(formData.name);

    try {
      let result = (
        await BaseModel.Inventory.update(inventoryData, {
          where: { id: formData.id },
        })
      )[0];

      let updatedInventory = await BaseModel.Inventory.findOne({
        where: { id: formData.id },
      });
      feedback = new Feedback(updatedInventory, true, 'updated successfully.');
      feedback.message = result ? feedback.message : 'no data was updated';
    } catch (error) {
      console.log(error);
      feedback = generateErrorFeedback(error);
    }
  } else {
    feedback = generatePermissionError();
  }
  res.json(feedback);
};

exports.deleteInventory = async (req, res, next) => {
  let { id, authorization } = Sanitizer.sanitize(req.body);
  let authUser = GetAuthUser(authorization);
  let feedback;

  if (authUser && authUser.userType === UserType.SuperAdmin) {
    let result = await deleteData('Inventory', { field: 'id', value: id });
    feedback = new Feedback(result, true, 'deleted successfully.');
    feedback.message = Boolean(result)
      ? feedback.message
      : 'no data was deleted.';
  } else {
    feedback = generatePermissionError();
  }
  res.json(feedback);
};
