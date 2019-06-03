const common = require("./commonFunctions")
// import entire SDK
const AWS = require("aws-sdk");

const endpoint = new AWS.Endpoint("https://dynamodb.us-east-1.amazonaws.com");
const credentials = new AWS.Credentials(
  process.env.AWS_ACCESS_ID,
  process.env.AWS_ACCESS_KEY,
  (sessionToken = null)
);

AWS.config.update({
  apiVersion: "2012-08-10",
  credentials: credentials,
  region: "us-east-1",
  endpoint: endpoint
});

const dynamodb = new AWS.DynamoDB({
  apiVersion: "2012-08-10",
  credentials: credentials,
  endpoint: endpoint,
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

// dynamo_batch_lookup_loc
//  - Lookup and retreive all items related to the QRID
module.exports.dynamo_batch_lookup_loc = async QRIDList => {
  var QRIDFormatList = [];
  QRIDList.forEach(QRID => {
    QRIDFormatList = QRIDFormatList.concat({
      QRID: {
        S: QRID
      }
    });
  });
  // Build query for all parameters
  var params = {
    RequestItems: { QRCodes: { Keys: QRIDFormatList } }
  };

  // Make Async request
  const request = dynamodb.batchGetItem(params);
  const data = await request.promise();

  // Return data without Dynamo's types - Unmarshall all data
  var allData = [];
  if (data.Responses.QRCodes.length != 0) {
    data.Responses.QRCodes.forEach(entry => {
      allData = allData.concat(AWS.DynamoDB.Converter.unmarshall(entry));
    });
  }

  return allData;
};

// dynamo_lookup_loc
//  - Lookup and retreive all items related to the QRID
module.exports.dynamo_lookup_loc = async QRID => {
  // Build query for all parameters
  var params = {
    ExpressionAttributeValues: {
      ":v1": {
        S: QRID
      }
    },
    KeyConditionExpression: "QRID = :v1",
    TableName: "QRCodes"
  };

  // Make Async request
  const request = dynamodb.query(params);
  const data = await request.promise();

  // Return data without Dynamo's types
  return AWS.DynamoDB.Converter.unmarshall(data.Items[0]);
};

// dynamo_insert_notif
//  - insert a notification into the database
module.exports.dynamo_insert_notif = async (QRID, Phone, UnixTime) => {
  // build put statement
  var params = {
    TableName: "Notifications",
    Item: {
      Address: String(Phone),
      Type: "Phone",
      UnixTime: Number(UnixTime),
      QRID: QRID
    }
  };
  // Execute put
  const data = await docClient.put(params).promise();
  console.log("Added item:", JSON.stringify(data, null, 2));
};

// dynamo_check_UnixTimes
//  - search the database for all UnixTimes that have expired.
// For all UnixTimes that have expired, send an SMS. This should
// be done once/minute.
module.exports.dynamo_check_timestamps = async () => {
  // Build scan
  var allData = [];
  let timenow = common.timenow()

  var params = {
    TableName: "Notifications",
    FilterExpression: "UnixTime < :unix_time ",
    ExpressionAttributeValues: {
      ":unix_time": timenow
    }
  };

  // We scan as many times as it takes to iterate through all of the
  // data that matches our condition, because scan can only return 1 MB
  console.log("Scanning Notifications table for older UnixTimes");
  while (1) {
    const data = await docClient.scan(params).promise();
    allData = allData.concat(data.Items);

    if (typeof data.LastEvaluatedKey != "undefined") {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      continue;
    }
    break;
  }
  return allData;
};

// dynamo_delete_entry
//  - Delete an entry in the Notifications table
module.exports.dynamo_delete_notification = async (Address, UnixTime) => {
  var params = {
    TableName: "Notifications",
    Key: {
      Address: Address,
      UnixTime: UnixTime
    }
  };

  console.log("Attempting a delete...");
  const del = await docClient.delete(params).promise();
  console.log(del);
  return del;
};
