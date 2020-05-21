const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const callController = require("./controllers/callController");
const userController = require("./controllers/userController");
const authController = require("./controllers/authController");
const translatorController = require("./controllers/translatorController");
const Translator = require("./models/translatorModel");
const globalErrorHandler = require("./controllers/errorController");

// Create Express webapp
const app = express();

// parse application/x-www-form-urlencoded{ limit: "10kb"
app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(helmet());

// Serving static files

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public/")));

//USER ROUTES
app.post("/admin", authController.restrictToAdmin("admin"));
app.post("/signin", authController.signin);
app.post("/signup", authController.signup);
app.get("/logout", authController.logout);

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

//VIEW ROUTES
app.get("/dashboard", authController.protect, async function (
  request,
  response
) {
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

module.exports = app;
