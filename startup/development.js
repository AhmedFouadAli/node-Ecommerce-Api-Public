
const morgan = require("morgan");

module.exports = function (app) {
    const environmentType = process.env.NODE_ENV || "development";

    if (environmentType === "development") {
      // for printing the request detail
      app.use(morgan("dev"));
      console.log("Development");
    }

}