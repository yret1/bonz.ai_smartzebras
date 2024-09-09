const AWS = require("aws-sdk");
const { uuid } = require("uuidv4");
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

  const tableName = "BookingsDatabase";

  const body = JSON.parse(event.body);

  const { bookingName, guests, roomsReq } = body;

  //const bookingRequset = body.bookingRequset;

  const id = uuid();

  let svit = 0;
  let dubbel = 0;
  let single = 0;

  roomsReq.forEach((room) => {
    switch (room.name) {
      case "Svit":
        svit++;
        break;
      case "Dubbel":
        dubbel++;
        break;
      case "Single":
        single++;
        break;
    }
  });

  const cost = svit * 1500 + dubbel * 1000 + single * 500;

  const totalBeds = 4;

  if (totalBeds >= guests && guests !== 0) {
    try {
      await docClient
        .put({
          TableName: tableName,
          Item: {
            id: id, //string
            bookingName: bookingName, //string
            guests: guests, // number
            bookedRooms: {
              Svit: svit, // number
              Dubbel: dubbel, // number
              Single: single, // number
            },
            cost: cost, //string
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
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Could not create booking",
          error: error,
        }),
      };
    }
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          "Ojsan. Det verkar som att du har bokat för många gäster. Försök igen.",
      }),
    };
  }
};
