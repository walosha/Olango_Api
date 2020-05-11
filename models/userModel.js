const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bycrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please Provide us your email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Provide a Valid email"],
  },
  image: {
    type: String,
    default: "profileImages/default.jpg",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false, //THIS OPTION HIDE THE PASSWORD FROM BEING RETURNED TO USERS
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passswordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiry: Date,
});

userSchema.pre("save", async function (next) {
  // RUN THIS IF PASSWORD IS NOT MODIFIED
  if (!this.isModified("password")) return next();
  // RUN THIS IF PASSWORD IS CREATED OR MODIFIED
  this.password = await bycrypt.hash(this.password, 16);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bycrypt.compare(candidatePassword, userPassword);
};

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passswordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  //this.find({ active: { $ne: false } }); Used when there are other documents that are neither true or false
  next();
});

// THIS COMAPARE PASSWORD INPUT BY USER AND THE ONE ON DB BY FIRST DECRPTYING IT
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bycrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passswordChangedAter = function (JWTTimestamp) {
  if (this.changedPasswordAt) {
    const changedTimeStamp = parseInt(
      this.passswordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //GENERATING RESET TOKEN FOR USERS
  const resetToken = crypto.randomBytes(32).toString("hex");

  // ENCRYPTING RESETTOKEN TO BE SAVED TO DATABASE

  this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
