const mongoose = require("mongoose");

const translatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please choose a Name"],
    unique: true,
  },
  language: {
    type: String,
    required: [true, "Please choose a language"],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "Please choose a phone"],
    unique: true,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const Translator = mongoose.model("Translator", translatorSchema);

module.exports = Translator;
