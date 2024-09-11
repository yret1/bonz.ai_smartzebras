const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});

const checkOccupiedRooms = async () => {
  const tableName = "allBookings";
  try {
    const data = await docClient.scan({ TableName: tableName }).promise();

    const totalOccupiedRooms = data.Items.reduce((acc, item) => {
      const { totalRooms } = item;
      return acc + (totalRooms || 0); // Add totalRooms, default to 0 if undefined
    }, 0); // Initialize the accumulator with 0

    return totalOccupiedRooms;
  } catch (error) {
    console.error("Error checking occupied rooms:", error);
    throw new Error("Could not retrieve total rooms.");
  }
};
exports.handler = async (event) => {
  const tableName = "allBookings";

  const availableRooms = 20 - (await checkOccupiedRooms());

  try {
    const data = await docClient.scan({ TableName: tableName }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(
        { bookings: data.Items, freeRooms: availableRooms },
        null,
        2
      ),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
