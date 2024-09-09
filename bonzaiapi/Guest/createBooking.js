const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});

exports.handler = async (event) => {
  const tableName = "allBookings";

  // Parsing event body
  const body = JSON.parse(event.body); // No need for await here

  console.log("Body: ", body);

  const { bookingName, guests, roomsReq } = body;

  console.log("Booking name: ", bookingName);
  console.log("Guests: ", guests);
  console.log("Rooms requested: ", roomsReq);
  const id = uuidv4();

  let svit = 0;
  let dubbel = 0;
  let single = 0;

  // Process room types and counts
  roomsReq.forEach((room) => {
    switch (room.name) {
      case "Svit":
        svit = room.count;
        break;
      case "Dubbel":
        dubbel = room.count;
        break;
      case "Single":
        single = room.count;
        break;
    }
  });

  // Calculate cost and room details
  const cost = svit * 1500 + dubbel * 1000 + single * 500;
  const totalBeds = svit * 3 + dubbel * 2 + single * 1;
  const totalRooms = svit + dubbel + single;

  // Validate booking
  if (totalBeds >= guests && guests !== 0) {
    try {
      // Save booking to DynamoDB
      await docClient
        .put({
          TableName: tableName,
          Item: {
            id: id,
            bookingName: bookingName,
            guests: guests,
            totalRooms: totalRooms,
            totalBeds: totalBeds,
            cost: cost, // This is a number, not a string
          },
        })
        .promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Bokning skapad med id: ${id}. Du har bokat ${svit} sviter, ${dubbel} dubbelrum och ${single} enkelrum. Totalt antal gäster: ${guests}. Kostnad: ${cost} kr`,
          bookingName: bookingName,
          guests: guests,
        }),
      };
    } catch (error) {
      // Log and return 500 in case of error
      console.error("DynamoDB Error: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Could not create booking",
          error: error.message,
        }),
      };
    }
  } else {
    // Validation failure response
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Ojsan. Det verkar som att du har bokat för många gäster. Försök igen.",
      }),
    };
  }
};
