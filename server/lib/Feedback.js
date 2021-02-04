const { GetAuthUser } = require('./AuthManager');

module.exports = class Feedback {
  constructor(
    result,
    success,
    message,
    totalItems = 0,
    totalPages = 0,
    currentPage = 0
  ) {
    this.result = result;
    this.success = success;
    this.message = message;
    this.totalItems = totalItems;
    this.totalPages = totalPages;
    if (currentPage) this.currentPage = currentPage;
    this.isLoggedIn = false;
  }
};
