module.exports = class FormError {
  constructor(error, rules = null) {
    this.error = error;
    if (rules) this.rules = rules;
  }
};
