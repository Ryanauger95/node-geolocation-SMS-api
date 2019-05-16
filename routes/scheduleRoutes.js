const dynamoDB = require("../services/dynamoDB");
const twilioSMS = require("../services/twilioSMS");
const cronJobs = require("../services/cronJobs");

function googleMapsURL(lat, lng) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    String(lat) +
    "," +
    String(lng)
  );
}

function appleMapsURL(lat, lng) {
  return "http://maps.apple.com/?daddr=" + String(lat) + "," + String(lng);
}

function createReminderMessage(addressData) {
  return (
    "This is a SpotSpot reminder about your recent parking location. " +
    "You parked at " +
    addressData.SpotAddress +
    " " +
    addressData.SpotCity +
    ", " +
    addressData.SpotState +
    " " +
    addressData.SpotZipCode +
    " in zone " +
    addressData.SpotZone +
    ".\nGoogle Maps: " +
    googleMapsURL(addressData.SpotLat, addressData.SpotLng) +
    "\nApple Maps: " +
    appleMapsURL(addressData.SpotLat, addressData.SpotLng)
  );
}

function createWelcomeMessage(addressData, UnixTime) {
  dateStr = new Date(UnixTime * 1000).toString();
  return (
    "Thank you for signing up for SpotSpot! Keep this for your records, and we will remind you on " +
    dateStr +
    " You parked at " +
    addressData.SpotAddress +
    " " +
    addressData.SpotCity +
    ", " +
    addressData.SpotState +
    " " +
    addressData.SpotZipCode +
    " in zone " +
    addressData.SpotZone +
    ".\nGoogle Maps: " +
    googleMapsURL(addressData.SpotLat, addressData.SpotLng) +
    "\nApple Maps: " +
    appleMapsURL(addressData.SpotLat, addressData.SpotLng)
  );
}

module.exports = async app => {
  // -- /sms
  //  Schedule an SMS to be sent with Twilio
  app.get("/sms", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    console.log(req.query);
    qr_code = req.query.qr_code;
    phone = req.query.phone;
    timestamp = req.query.unix_timestamp;

    //insert the notification into the database
    dynamoDB.dynamo_insert_notif(qr_code, phone, timestamp);

    //Imediately Send a Welcome SMS
    // Gather the location Data
    const address0 = await dynamoDB.dynamo_lookup_loc(qr_code);
    console.log(address0);
    twilioSMS.sendSMS(phone, createWelcomeMessage(address0, timestamp));

    // This needs to be a cron job
    // Schedule SMSs for each user
    cronJobs.newNodeCronJob(Number(timestamp), async () => {
      // Get all of the pending notifications
      const notificationDataList = await dynamoDB.dynamo_check_timestamps();
      console.log(notificationDataList.length.toString() + " Results found");
      console.log("notificationDataList");
      console.log(notificationDataList);

      // build a list of all of the QRIDs so that we can run
      // a batch query to get the Address information
      QRIDList = new Set();
      notificationDataList.forEach(function(entry) {
        QRIDList = QRIDList.add(entry.QRID);
      });

      // Look up the address information for all of the QRIDs
      const addressDataList = await dynamoDB.dynamo_batch_lookup_loc(QRIDList);
      console.log("addressDataList");
      console.log(addressDataList);

      // Loop through the notification list and match the address.
      // Whenever we have a match, we build a message and send and SMS
      for (var i = 0; i < notificationDataList.length; i++) {
        const notification = notificationDataList[i];
        for (var j = 0; j < addressDataList.length; j++) {
          const address = addressDataList[j];
          if ((notification.QRID = address.QRID)) {
            // Build A Message
            const message = createReminderMessage(address);

            // Send the Message
            if (notification.Type == "Phone") {
              twilioSMS.sendSMS(notification.Address, message);
            }

            //delete the notification
            dynamoDB.dynamo_delete_notification(
              notification.Address,
              notification.UnixTime
            );

            break;
          }
        }
      }
    });
    res.send({});
  });
};
