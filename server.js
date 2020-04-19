const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const methods = require("./router");
const mongoose = require("mongoose");
const authController = require("./controllers/authController");
const tokenGenerator = methods.tokenGenerator;
const makeCall = methods.makeCall;
const placeCall = methods.placeCall;
const incoming = methods.incoming;
const welcome = methods.welcome;
require("dotenv").config();

// Create Express webapp
const app = express();

// parse application/x-www-form-urlencoded
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(helmet());

// Serving static files

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
  });

app.post("/signin", authController.signin);
app.post("/signup", authController.signup);

app.get("/", function (request, response) {
  response.send(welcome());
});

app.post("/", function (request, response) {
  response.send(welcome());
});

app.get("/accessToken", function (request, response) {
  tokenGenerator(request, response);
});

app.post("/accessToken", function (request, response) {
  tokenGenerator(request, response);
});

app.get("/makeCall", function (request, response) {
  makeCall(request, response);
});

app.post("/makeCall", function (request, response) {
  makeCall(request, response);
});

app.get("/placeCall", placeCall);

app.post("/placeCall", placeCall);

app.get("/incoming", function (request, response) {
  response.send(incoming());
});

app.post("/incoming", function (request, response) {
  response.send(incoming());
});

// Create an http server and run it
const port = process.env.PORT || 9000;
app.listen(port, function () {
  console.log("server server running on *:" + port);
});
