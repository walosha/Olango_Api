const express = require("express");
const morgan = require("morgan");
var AccessToken = require("twilio").jwt.AccessToken;
var VoiceGrant = AccessToken.VoiceGrant;
var app = express();

require("dotenv").config();

if (process.env.NODE_ENV || "development" === "development") {
  app.use(morgan("dev"));
}

// Endpoint to generate access token
app.get("/token", function(request, response) {
  var identity = { name: "Olawale afuye", id: 42627272829 };

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token
  token.identity = identity;
  const outgoingApplicationSid = "idudhdfffhadhfhagdjhfghdfgjhjhjhks";

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: outgoingApplicationSid,
    incomingAllow: true // Optional: add to allow incoming calls
  });
  // Grant token access to the Video API features
  token.addGrant(voiceGrant);

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});
var port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
