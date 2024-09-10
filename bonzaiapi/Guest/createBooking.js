const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});

const checkOccupiedRooms = async () => {
  const tableName = "allBookings";
  try {
    const data = await docClient.scan({ TableName: tableName }).promise();

    const totalOccupiedRooms = data.Items.reduce((acc, item) => {
      const { totalRooms } = item;
      return acc + (totalRooms || 0); // Loopa samtliga bokningar och summera totalRooms
    }, 0);

    // Returnera antal upptagna rum
    return totalOccupiedRooms;
  } catch (error) {
    console.error("Hittade inga rum:", error);
    throw new Error("Ooops, något gick fel. Försök igen.");
  }
};

const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new Error(
      "Din bokning är incorrect. Var vänlig och kontrollera dina val."
    );
  }

  // Millisekunder mellan start och slut
  const differenceInMillis = end - start;

  // Konvertera till dagar
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const differenceInDays = differenceInMillis / millisecondsInDay;

  // Returnera antal nätter för bokningen
  return differenceInDays;
};

exports.handler = async (event) => {
  const tableName = "allBookings";

  const body = JSON.parse(event.body);

  //Kontrollera lediga rum
  const freeRooms = 20 - (await checkOccupiedRooms());

  // Data från clienten
  const { bookingName, guests, roomsReq, from, to } = body;

  //Slumpa ett unikt id för bokningen. Används vid avbokning eller kontakt med support.
  const id = uuidv4();

  // Räkna antal olika typer av rum
  let svit = 0;
  let dubbel = 0;
  let single = 0;

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

  const nights = calculateNights(from, to);

  // Räkna ut kostnaden och antal rum som krävs
  const cost =
    svit * 1500 * nights + dubbel * 1000 * nights + single * 500 * nights;
  const totalBeds = svit * 3 + dubbel * 2 + single * 1;
  const totalRooms = svit + dubbel + single;

  // Kontrollera att det finns tillräckligt med rum
  if (totalRooms > freeRooms) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Tyvärr finns det inte tillräckligt med rum för din bokning. Vi har endast ${freeRooms} rum kvar. Din bokning kräver ${totalRooms} rum.`,
      }),
    };
  }

  // Validate booking
  if (
    totalBeds >= guests &&
    guests !== 0 &&
    !totalRooms <= guests &&
    from &&
    to
  ) {
    try {
      // Spara till databasen
      await docClient
        .put({
          TableName: tableName,
          Item: {
            id: id,
            bookingName: bookingName,
            guests: guests,
            totalRooms: totalRooms,
            totalBeds: totalBeds,
            cost: cost,
            from: from,
            to: to,
          },
        })
        .promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Tack för din bokning, ${bookingName}! Vi ser fram emot att välkomna dig till Bonzai Hotel mellan ${from} och ${to}. Ditt bokningsnummer är ${id}. Använd detta nummer vid avbokning eller kontakt med support.  Total kostnad för din bokning är ${cost} kr. Vid eventuella frågor, vänligen kontakta oss på Bonzai Hotels!.`,
          bookingName: bookingName,
          id: id,
          result: "success",
        }),
      };
    } catch (error) {
      console.error("DynamoDB Error: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Bokningen misslyckades. Försök igen!",
          error: error.message,
          result: "error",
        }),
      };
    }
  } else if (guests < totalRooms) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Oj då, antalet gäster är färre än antalet rum. Var vänlig och kontrollera dina val.",
        result: "roomsOverGuests",
      }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Oj då, något gick fel. Var vänlig och kontrollera dina val.",
        result: "error",
      }),
    };
  }
};
