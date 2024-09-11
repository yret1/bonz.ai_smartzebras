const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const bookingId = event.pathParameters.id; // Hämta boknings-ID från URL-parametrar
  const bookingName = event.pathParameters.bookingName;

  const tableName = "allBookings";
  const existingBooking = await docClient
    .get({
      TableName: tableName,
      Key: { id: bookingId, bookingName: bookingName },
    })
    .promise();

  if (!existingBooking.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Bokningen hittades inte." }),
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(existingBooking.Item),
    };
  }
};
