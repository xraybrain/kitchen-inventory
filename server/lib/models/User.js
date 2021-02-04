const UserType = require('./UserType');
exports.User = class User {
  constructor(
    surname = null,
    othernames = null,
    email = null,
    gender = null,
    password = null,
    userType = null,
    inventoryId = null,
    imageURL = null,
    Inventory = null,
    id = null
  ) {
    if (userType) this.userType = userType;
    if (surname) this.surname = surname;
    if (othernames) this.othernames = othernames;
    if (email) this.email = email;
    if (gender) this.gender = gender;
    if (password) this.password = password;
    if (imageURL) this.imageURL = imageURL;
    if (inventoryId) this.inventoryId = inventoryId;
    if (Inventory) this.Inventory = Inventory;
    if (id) this.id = id;
  }
};

exports.createSuperUser = (formData) => {
  return new this.User(
    formData.surname,
    formData.othernames,
    formData.email,
    formData.gender,
    formData.password,
    UserType.SuperAdmin
  );
};

exports.createUser = (formData, inventoryId) => {
  return new this.User(
    formData.surname,
    formData.othernames,
    formData.email,
    formData.gender,
    formData.password,
    formData.userType,
    inventoryId,
    formData.imageURL
  );
};
