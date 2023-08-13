// eslint-disable-next-line import/no-extraneous-dependencies
const { v4: uuidv4 } = require("uuid");

// For working with images:
const multer = require("multer");

// handling the error earlier before sending it to the database:
const APIError = require("../utils/apiError");

exports.uploadSingleImage = (relatedName, fieldName = "ImageUrl") => {
  // 1-Disk Storage solution
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // where we want to save the images
      cb(null, `uploads/${relatedName}`);
    },
    filename: function (req, file, cb) {
      const extension = file.mimetype.split("/")[1];
      // this is to make the name of the image unique

      const uniqueSuffix = `${relatedName} -${uuidv4()}-${Date.now()}.${extension}`;

      cb(null, uniqueSuffix);
    },
  });

  //  2-MemoryStorage
  const multerMemoryStorage = multer.memoryStorage();

  // For allowing specific types only
  const multerFilter = function (req, file, cb) {
    // this is to make sure that the file is an image
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new APIError(400, "Not an image! Please upload only images."), false);
    }
  };
  // We are going to use storage to add some configuration
  const upload = multer({
    // Working with desk
    // storage: multerStorage,
    // Working with memory
    storage: multerMemoryStorage,
    fileFilter: multerFilter,
  });

  return upload.single(fieldName);
};
exports.uploadMultiImages = (
  relatedName,
  singleImage = "imageCover",
  manyImages = "images"
) => {
  // 1-Disk Storage solution
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // where we want to save the images
      cb(null, `uploads/${relatedName}`);
    },
    filename: function (req, file, cb) {
      const extension = file.mimetype.split("/")[1];
      // this is to make the name of the image unique

      const uniqueSuffix = `${relatedName} -${uuidv4()}-${Date.now()}.${extension}`;

      cb(null, uniqueSuffix);
    },
  });

  //  2-MemoryStorage
  const multerMemoryStorage = multer.memoryStorage();

  // For allowing specific types only
  const multerFilter = function (req, file, cb) {
    // this is to make sure that the file is an image
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new APIError(400, "Not an image! Please upload only images."), false);
    }
  };
  // We are going to use storage to add some configuration
  const upload = multer({
    // Working with desk
    // storage: multerStorage,
    // Working with memory
    storage: multerMemoryStorage,
    fileFilter: multerFilter,
  });

  return upload.fields([
    { name: singleImage, maxCount: 10 },
    { name: manyImages, maxCount: 5 },
  ]);
};
