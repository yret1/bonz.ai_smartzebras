const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});

exports.handler = async (event) => {
  const rooms = [
    {
      roomType: "Svit",
      cost: 1500,
      space: 3,
    },
    { roomType: "Dubbel", cost: 1000, space: 2 },
    { roomType: "Single", cost: 500, space: 1 },
  ];

  const tableName = "Bookings";

  const body = JSON.parse(event.body);
  console.log("Body", body);

  //const bookingRequset = body.bookingRequset;
  const bookingName = body.bookingName;
  // const requestedRooms = body.rooms;

  // Antal lediga sängar
  /**const totalBeds = requestedRooms.reduce((acc, room) => {
    const sleeps = rooms.find((r) => r.space === room.space);
    return acc + sleeps.space;
  });*/

  const totalBeds = 4;
  // Antal gäster
  const guests = body.guests;

  const BookingItem = {
    bookingName: bookingName, // string
    guests: guests, // number
  };

  if (totalBeds >= guests && guests !== 0) {
    try {
      await docClient
        .put({
          TableName: tableName,
          Item: {
            bookingName: bookingName,
            guests: guests,
          },
        })
        .promise();

      return sendResponse(200, { success: true });
    } catch (error) {}
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Not enough beds or guests",
      }),
    };
  }
};
