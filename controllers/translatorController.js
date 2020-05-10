const Translator = require("../models/translatorModel");

exports.saveTranslator = async function (req, res) {
  const { name, phone, language } = req.body;
  if (!name || !phone || !language) {
    res.status(404).json({
      status: "failed",
    });
  }

  const newTranslator = await Translator.create({ name, phone, language });
  newTranslator.__v = undefined;
  newTranslator.active = undefined;

  res.status(200).json({
    status: "sucess",
    data: newTranslator,
  });
};

exports.getTranslators = async function (req, res) {
  const { name, phone, language } = req.body;
  if (!name || !phone || !language) {
    res.status(404).json({
      status: "failed",
    });
  }

  const translators = await Translator.find();

  res.status(200).json({
    status: "sucess",
    data: translators,
  });
};

exports.deleteTranslator = async function (req, res) {
  console.log("controlleer", req.params.id);
  await Translator.findOneAndRemove(
    {
      _id: req.params.id,
    },
    function (err, user) {
      if (err) throw err;

      console.log("Success");
    }
  );

  const translators = await Translator.find();
  res.render("index", { translators }, { async: true });
};
