module.exports = class Inventory {
  constructor(name, id = null) {
    this.name = name;
    if (id) this.id = id;
  }
};
