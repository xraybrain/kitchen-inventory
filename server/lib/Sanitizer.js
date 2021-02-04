module.exports = class Sanitizer {
  static sanitize(formData) {
    let sanitized = {};
    for (let [field, value] of Object.entries(formData)) {
      sanitized[field] = Sanitizer.cleanData(value);
    }
    return sanitized;
  }

  static cleanData(val) {
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          val[i] = this.cleanData(val[i]);
        }
      } else {
        try {
          for (let [field, value] of Object.entries(val)) {
            val[field] = this.cleanData(value);
          }
        } catch (error) {
          return val;
        }
      }
    } else {
      if (typeof val == 'string') {
        return String(val)
          .replace(/<\/*\w+>/g, '')
          .trim();
      }
      return val;
    }
    return val;
  }
};
