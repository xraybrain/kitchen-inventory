module.exports = class Validator {
  static isEmpty(val) {
    return val === '' || val === undefined || val === null;
  }

  static isEmail(val) {
    return /^(\w){2,}@(\w){2,}\.(\w){2,}$/.test(val);
  }

  static isMobile(val) {
    return /^(\d){11}$/.test(val);
  }

  static isRealName(val) {
    return /^([a-zA-Z]){3,}$/.test(val);
  }

  static isRealNames(val) {
    return /^(\s*[a-zA-Z]{2,}\s*\.*)+(\s*[a-zA-Z]+\s*\.*)*$/;
  }

  static isDigit(val) {
    return /[0-9]+?/g.test(val);
  }
};
