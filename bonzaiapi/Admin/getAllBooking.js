const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});
exports.handler = async (event) => {
  const tableName = "allBookings";

  try {
    const data = await docClient.scan({ TableName: tableName }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
