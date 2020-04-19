const multer = require("multer");
const User = require("../models/userModel");
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "This is not an image!, please upload an Image",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImages = upload.single("profile");

// Filter based on the criteria passed in
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // RETURN ERROR IF USER POST PASSWORD DATA

  const filteredBody = filterObj(req.body, "name", "email");

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for Password update. Please use update password rour=te",
        401
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "sucess",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.body.id, { active: false });
  res.status(200).json({
    status: "sucess",
    data: null,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  console.log(req.user);
  res.status(200).json({
    status: "sucess",
    data: {
      user: req.user,
    },
  });
});

exports.profileImage = catchAsync(async (req, res, next) => {
  let image = req.file.filename;
  console.log(image);
  // res.setHeader('Content-Type', 'application/form-data');

  if (!image) {
    return new AppError("Upload an Image", 400);
  }

  image = await User.findByIdAndUpdate(
    req.user.id,
    { image },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "sucess",
    data: {
      image,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: "sucess",
    data: null,
  });
});
