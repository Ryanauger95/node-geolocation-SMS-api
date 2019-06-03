const accountSid = process.env.TWILIO_SID ;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_SRC_ADDRESS;
const client = require("twilio")(accountSid, authToken);

module.exports.sendSMS = async (phoneNumber, message) => {
  // const body = "This is the ship that made the Kessel Run in fourteen parsecs?";
  console.log("Sending SMS to " + phoneNumber + " with text: " + message);
  const msg = client.messages.create({
    body: message,
    from: fromNumber,
    to: phoneNumber
  });

  // return msg;
};
