class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    let queryObject = { ...this.queryString };
    // for removing it from the filter since they are using for other things:
    const excludedFields = ["sort", "page", "limit", "fields", "q"];
    excludedFields.forEach((keyToRemove) => delete queryObject[keyToRemove]);

    // 3)filtering with operation
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    queryObject = JSON.parse(queryString);
    this.mongooseQuery = this.mongooseQuery.find(queryObject);
    return this;
  }

  sort() {
    //4- sorting by fields
    if (this.queryString.sort) {
      // sort=-price from large to small
      // Sorting by more than one field if two of them same in the first field
      const splitSort = this.queryString.sort.split(",");

      this.mongooseQuery = this.mongooseQuery.sort(splitSort.join(" "));
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("createdAt");
    }
    //   to able to apply chaining method over the object:
    // const apiFeature=new APiFeature()
    //   apiFeature.filter().sort()
    return this;
  }

  limitFieldList() {
    if (this.queryString.fields) {
      this.mongooseQuery = this.mongooseQuery.select(
        this.queryString.fields.split(",")
      );
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search() {
    if (this.queryString.q) {
      console.log(this.queryString.q);
      const query = {};
      query.$or = [
        {
          title: { $regex: this.queryString.q, $options: "i" },
        },
        { description: { $regex: this.queryString.q, $options: "i" } },
        { name: { $regex: this.queryString.q, $options: "i" } },
      ];
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  pagination(countDocument) {
    const page = parseInt(this.queryString.page, 10) - 1 || 0;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const numberSkipItem = limit * page;
    const endIndex = (page + 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(numberSkipItem).limit(limit);
    const paginationFields = {
      currentPage: page + 1,
      itemsPerPage: limit,
      totalNumberOfPages: Math.ceil(countDocument / limit),
      hasNextPage: endIndex < countDocument,
      hasPreviousPage: numberSkipItem > 0,
    };
    this.pagenationResult = paginationFields;
    return this;
  }
}

module.exports = ApiFeatures;
