import multer from "multer";
import path from "path";
import generateUniqueImageName from "../utils/generateUniqueImageName.js";

const handleHomeShowCaseLogoUploader = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "file-" + uniqueSuffix);
    },
  }),
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg|svg|avif|webp/;
    const extension = path.extname(file.originalname);
    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"));
    }
  },
}).array("images");

const handleZeroPlaceImageUploader = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "file-" + uniqueSuffix);
    },
  }),
  fileFilter: (req, file, cb) => {
    file.uid = req.body[file.fieldname];
    const supportedImage = /png|jpg|jpeg|svg|avif|webp/;
    const extension = path.extname(file.originalname);
    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"));
    }
  },
}).any();

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file-" + uniqueSuffix);
  },
});

const singleImageUploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg|svg|avif|webp/;
    const extension = path.extname(file.originalname);
    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"));
    }
  },
}).single("image");

const multipleImageUploader = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg|svg|avif|webp/;
    const extension = path.extname(file.originalname);
    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"));
    }
  },
}).array("images");

const singleImageUploaderStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueSuffix = generateUniqueImageName(file.originalname);

    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const singlePhotoUploader = multer({
  storage: singleImageUploaderStorage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg|svg|avif|webp/;

    const extension = path.extname(file.originalname);

    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported"));
    }
  },
}).single("image");

export {
  singlePhotoUploader,
  handleHomeShowCaseLogoUploader,
  handleZeroPlaceImageUploader,
  multipleImageUploader,
  singleImageUploader,
};
