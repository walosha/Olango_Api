const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const callController = require("./controllers/callController");
const userController = require("./controllers/userController");
const mongoose = require("mongoose");
const authController = require("./controllers/authController");
const translatorController = require("./controllers/translatorController");
const Translator = require("./models/translatorModel");
const globalErrorHandler = require("./controllers/errorController");

require("dotenv").config();

// Create Express webapp
const app = express();

// parse application/x-www-form-urlencoded
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(helmet());

// Serving static files

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public/")));

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    // DEFAULT SET-UP
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected successfully!");
  })
  .catch(console.log("Connection Failed Failed"));

//USER ROUTES
app.post("/signin", authController.signin);
app.post("/signup", authController.signup);

app.get("/", function (request, response) {
  response.render("pages/login");
});

app.get(
  "/api/user/Me",
  authController.protect,
  userController.getMe,
  userController.getOne
);

app.post(
  "/api/user/upload",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

app.post("/api/user/updateMe", authController.protect, userController.updateMe);

// VIEW ROUTES
app.get("/dashboard", async function (request, response) {
  const translators = await Translator.find();
  response.render("pages/dashboard", { translators });
});

app.get("/api/delete/:id", translatorController.deleteTranslator);

// TRANSLATOR ROUTES

app.post("/formData", translatorController.saveTranslator);
app.get("/formData", translatorController.getTranslators);

// CALL ROUTES
app.get("/accessToken", function (request, response) {
  callController.tokenGenerator(request, response);
});

app.post("/", function (request, response) {
  response.send(callController.welcome());
});

app.post("/accessToken", function (request, response) {
  callController.tokenGenerator(request, response);
});

app.get("/makeCall", function (request, response) {
  callController.makeCall(request, response);
});

app.post("/makeCall", function (request, response) {
  callController.makeCall(request, response);
});

app.get("/placeCall", callController.placeCall);

app.post("/placeCall", callController.placeCall);

app.get("/incoming", function (request, response) {
  response.send(callController.incoming());
});

app.post("/incoming", function (request, response) {
  response.send(callController.incoming());
});

app.all("*", function (request, response) {
  response.render("pages/404");
});

app.use(globalErrorHandler);
// Create an http server and run it
const port = process.env.PORT || 9000;
app.listen(port, function () {
  console.log("server server running on *:" + port);
});
