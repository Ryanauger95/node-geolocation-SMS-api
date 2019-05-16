const accountSid = "AC8e090f00de074bc2c538e6546b30759e";
const authToken = "c97301e2bed3c6de925f02563d2edd8a";
const fromNumber = "+19802474334";
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
