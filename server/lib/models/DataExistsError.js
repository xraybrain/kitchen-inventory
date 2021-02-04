module.exports = class DataExistsError extends (
  Error
) {
  constructor(message) {
    super();
    this.message = message || 'data already exists';
    this.code = 'ERR_DATA_EXISTS';
  }
};
