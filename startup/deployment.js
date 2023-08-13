const cors = require("cors");
const compression = require("compression");

module.exports = function (app) {
  // enables other domain to access the api
  app.use(cors());
  app.options("*", cors());
  app.use(compression());
};
