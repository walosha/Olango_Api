const express = require("express");
const morgan = require("morgan");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VoiceGrant;
const app = express();

require("dotenv").config();

if (process.env.NODE_ENV || "development" === "development") {
  app.use(morgan("dev"));
}

// Endpoint to generate access token
app.get("/token", function(request, response) {
  const identity = { name: "Olawale afuye", id: 42627272829 };

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token
  token.identity = identity;

  const grant = new VideoGrant();
  // Grant token access to the Video API features
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
