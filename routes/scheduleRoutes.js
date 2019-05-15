// import entire SDK
const AWS = require("aws-sdk");

const endpoint = new AWS.Endpoint("https://dynamodb.us-east-1.amazonaws.com");
const credentials = new AWS.Credentials(
  "AKIASKB57BNKGEMF7WUN",
  "IR7EDx6Wyi6djriij5wVk/IveSJx2SRle/SXnPer",
  (sessionToken = null)
);
const dynamodb = new AWS.DynamoDB({
  apiVersion: "2012-08-10",
  credentials: credentials,
  endpoint: endpoint,
  region: "us-east-1"
});

async function dynamo_lookup_loc(qr_code) {
  var params = {
    ExpressionAttributeValues: {
      ":v1": {
        S: qr_code
      }
    },
    KeyConditionExpression: "QRID = :v1",
    ProjectionExpression:
      "QRID, SpotLat, SpotLng, SpotAddress, SpotCity, SpotLevel",
    TableName: "QRCodes"
  };
  const request = dynamodb.query(params);
  const data = await request.promise();

  return data;
}
module.exports = app => {
  // Our QR Code API returns an object in JSON form with the
  // Location and level of the placed QR Code
  // Must query dynamo-db
  app.get("/qr", async (req, res) => {
    console.log(req.query);

    const _loc_info = await dynamo_lookup_loc(req.query.qr_code);
    const loc_info = _loc_info.Items[0]

    res.send(AWS.DynamoDB.Converter.unmarshall(loc_info));

  });
};
