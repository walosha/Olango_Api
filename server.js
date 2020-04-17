require("dotenv").config();
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const defaultIdentity = "alice";
const callerId = "client:quick_start";
// Use a valid Twilio number by adding to your account via https://www.twilio.com/console/phone-numbers/verified
const callerNumber = "+16157638542";

/**
 * Creates an access token with VoiceGrant using your Twilio credentials.
 *
 * @param {Object} request - POST or GET request that provides the recipient of the call, a phone number or a client
 * @param {Object} response - The Response Object for the http request
 * @returns {string} - The Access Token string
 */
function tokenGenerator(request, response) {
  // Parse the identity from the http request
  var identity = null;
  if (request.method == "POST") {
    identity = request.body.identity;
  } else {
    identity = request.query.identity;
  }

  if (!identity) {
    identity = defaultIdentity;
  }

  // Used when generating any kind of tokens
  const accountSid = process.env.ACCOUNT_SID;
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_KEY_SECRET;

  // Used specifically for creating Voice tokens
  const pushCredSid = process.env.PUSH_CREDENTIAL_SID;
  const outgoingApplicationSid = process.env.APP_SID;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: outgoingApplicationSid,
    pushCredentialSid: pushCredSid,
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(accountSid, apiKey, apiSecret);
  token.addGrant(voiceGrant);
  token.identity = identity;
  console.log("Token:" + token.toJwt());
  return response.send(token.toJwt());
}

/**
 * Creates an endpoint that can be used in your TwiML App as the Voice Request Url.
 * <br><br>
 * In order to make an outgoing call using Twilio Voice SDK, you need to provide a
 * TwiML App SID in the Access Token. You can run your server, make it publicly
 * accessible and use `/makeCall` endpoint as the Voice Request Url in your TwiML App.
 * <br><br>
 *
 * @param {Object} request - POST or GET request that provides the recipient of the call, a phone number or a client
 * @param {Object} response - The Response Object for the http request
 * @returns {Object} - The Response Object with TwiMl, used to respond to an outgoing call
 */
function makeCall(request, response) {
  // The recipient of the call, a phone number or a client
  var To = null;
  if (request.method == "POST") {
    To = request.body.To;
  } else {
    To = request.query.To;
  }

  const voiceResponse = new VoiceResponse();

  if (!To) {
    voiceResponse.say(
      defaultIdentity + " welcome to Olango tranlation Application!"
    );
  } else if (isNumber(To)) {
    const dial = voiceResponse.dial({ callerId: callerNumber });
    dial.number(To);
  } else {
    const dial = voiceResponse.dial({ callerId: callerId });
    dial.client(To);
  }

  console.log(To);
  console.log("Response:" + voiceResponse.toString());
  return response.send(voiceResponse.toString());
}

/**
 * Makes a call to the specified client using the Twilio REST API.
 *
 * @param {Object} request - POST or GET request that provides the recipient of the call, a phone number or a client
 * @param {Object} response - The Response Object for the http request
 * @returns {string} - The CallSid
 */
async function placeCall(request, response) {
  // The recipient of the call, a phone number or a client
  var To = null;
  if (request.method == "POST") {
    To = request.body.To;
  } else {
    To = request.query.To;
  }
  console.log(To);
  // The fully qualified URL that should be consulted by Twilio when the call connects.
  var url =
    request.protocol + "://" + request.get("host") + "/incoming";
  console.log(url);
  const accountSid = process.env.ACCOUNT_SID;
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_KEY_SECRET;
  const client = require("twilio")(apiKey, apiSecret, {
    accountSid,
  });
  let call;
  try {
    if (!To) {
      console.log("Calling default client:" + defaultIdentity);
      call = await client.api.calls.create({
        url: url,
        to: "client:" + defaultIdentity,
        from: callerId,
      });
    } else if (isNumber(To)) {
      console.log("Calling number:" + To);
      call = await client.api.calls.create({
        url: url,
        to: to,
        from: callerNumber,
      });
    } else {
      console.log("Calling client:" + To);
      call = await client.api.calls.create({
        url: url,
        to: "client:" + To,
        from: callerId,
      });
    }
    console.log(call);
  } catch (error) {
    console.log(error);
  }

  //call.then(console.log(call.sid));
  return response.send(call.sid);
}

/**
 * Creates an endpoint that plays back a greeting.
 */
function incoming() {
  const voiceResponse = new VoiceResponse();
  voiceResponse.say(
    "Congratulations! You have received your first inbound call! Good bye."
  );
  console.log("Response:" + voiceResponse.toString());
  return voiceResponse.toString();
}

function welcome() {
  const voiceResponse = new VoiceResponse();
  voiceResponse.say(
    "Welcome to Olango translation Application!, wait while we direct you to one of our agents"
  );
  console.log("Response:" + voiceResponse.toString());
  return voiceResponse.toString();
}

function isNumber(to) {
  if (to.length == 1) {
    if (!isNaN(to)) {
      console.log("It is a 1 digit long number" + to);
      return true;
    }
  } else if (String(to).charAt(0) == "+") {
    number = to.substring(1);
    if (!isNaN(number)) {
      console.log("It is a number " + to);
      return true;
    }
  } else {
    if (!isNaN(to)) {
      console.log("It is a number " + to);
      return true;
    }
  }
  console.log("not a number");
  return false;
}

exports.tokenGenerator = tokenGenerator;
exports.makeCall = makeCall;
exports.placeCall = placeCall;
exports.incoming = incoming;
exports.welcome = welcome;
