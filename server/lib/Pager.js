const BaseModel = require('../db/models');
const Feedback = require('../lib/Feedback');

module.exports = class Pager {
  constructor(model, pageSize, page) {
    if (model === undefined || model === '') {
      throw new Error({
        errCode: 'NOMODEL',
        message: 'model is required.',
      });
    }
    this.model = model;
    this.pageSize = pageSize || 10;
    this.page = page || 1;
    this.filter = {};
  }

  /**
   * @description Contacts the server for data
   * @param whereClause this will be used to query the database
   * @param include add all models to be included in the query
   * @param order this is the sort order of the results
   */
  async getData(
    whereClause = {},
    include = null,
    order = [['createdAt', 'DESC']],
    hasPagination = true
  ) {
    let offset = this.pageSize * this.page - this.pageSize;
    this.filter = {
      where: whereClause,
      include: include,
      order: order,
    };

    if (hasPagination) {
      this.filter.offset = offset;
      this.filter.limit = this.pageSize;
    }

    let feedback;

    try {
      this.results = await BaseModel[this.model].findAll(this.filter);
      await this.calculatePages(whereClause);
      feedback = new Feedback(
        this.results,
        true,
        'success',
        this.totalItems,
        this.totalPages,
        this.page
      );
    } catch (error) {
      console.log(error);
      feedback = new Feedback(
        null,
        false,
        'we encountered a problem while retrieving data'
      );
    }

    return feedback;
  }

  /**
   * @description computes the totalItems and totalPages for this model data.
   * @param whereClause this will be used to query the database
   */
  async calculatePages(whereClause = {}) {
    this.totalItems = await BaseModel[this.model].count({ where: whereClause });
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }
};
