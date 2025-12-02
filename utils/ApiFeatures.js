const AppError = require("../classes/AppError");

class ApiFeatures {
  constructor(query, queryString, baseFilter = {}) {
    this.query = query;
    this.queryString = queryString;
    this.baseFilter = baseFilter;
  }

  filter() {
    // 1️⃣ Copy query object
    const queryObj = { ...this.queryString };

    // 2️⃣ Remove special fields
    const excludedFields = ["sort", "page", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 3️⃣ Advanced filtering with operators (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // 4️⃣ Parse filter and merge with base filter
    const queryFilter = JSON.parse(queryStr);
    const filter = { ...this.baseFilter, ...queryFilter };

    // 5️⃣ Apply filter to query
    this.query = this.query.find(filter);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // Store pagination values for potential validation in controller
    this.page = page;
    this.limit = limit;
    this.skip = skip;

    return this;
  }
}

module.exports = ApiFeatures;

