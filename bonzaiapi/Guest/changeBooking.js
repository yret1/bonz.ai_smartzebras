const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});

// Funktion för att hämta totalt antal upptagna rum
const checkOccupiedRooms = async () => {
  const tableName = "allBookings";
  try {
    const data = await docClient.scan({ TableName: tableName }).promise();

    // Räkna totalt antal upptagna rum
    const totalOccupiedRooms = data.Items.reduce((acc, item) => {
      const { totalRooms } = item;
      return acc + (totalRooms || 0); // Summera rummen, använd 0 om undefined
    }, 0);

    return totalOccupiedRooms;
  } catch (error) {
    console.error("Hittade inga rum:", error);
    throw new Error("ojdå, något gick fel. Försök igen.");
  }
};

// Funktion för att beräkna antal nätter mellan två datum
const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new Error("Ooops, något gick fel. Försök igen.");
  }

  // Millisekunder mellan start och slut
  const differenceInMillis = end - start;

  // Konvertera till dagar
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const differenceInDays = differenceInMillis / millisecondsInDay;

  return differenceInDays;
};

exports.handler = async (event) => {
  const tableName = "allBookings";
  const bookingId = event.pathParameters.id; // Hämta boknings-ID från URL-parametrar
  const bookingName = event.pathParameters.bookingName;
  const body = JSON.parse(event.body); // Parsar JSON-kroppen i förfrågan

  const { guests, roomsReq, from, to } = body; // Hämta bokningsinformation från kroppen

  const today = new Date().toISOString.split("T")[0];

  try {
    // Kontrollera att bokningen existerar
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
    }
    const calculateRemovable = (startDate) => {
      const start = new Date(startDate);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const differenceInMillis = start.getTime() - today.getTime();
      const millisecondsInDay = 24 * 60 * 60 * 1000;
      const differenceInDays = Math.floor(
        differenceInMillis / millisecondsInDay
      );

      if (differenceInDays < 2) {
        return {
          removable: false,
          message:
            "Din bokning är mindre än 2 dagar bort eller redan aktiv. Det går inte längre att ändra eller avboka.",
        };
      }

      return {
        removable: true,
      };
    };

    const bookingCheck = calculateRemovable(existingBooking.Item.from);

    if (!bookingCheck.removable) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: bookingCheck.message,
        }),
      };
    }

    // Räkna antalet fria rum
    const freeRooms = 20 - (await checkOccupiedRooms());

    // Räkna nätter mellan inchecknings- och utcheckningsdatum
    const nights = calculateNights(from, to);

    // Initialisera antal rum av varje typ
    let svit = 0;
    let dubbel = 0;
    let single = 0;

    // Räkna antalet rum av varje typ baserat på input
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

    // Beräkna kostnaden och totalt antal rum och sängar
    const cost =
      svit * 1500 * nights + dubbel * 1000 * nights + single * 500 * nights;
    const totalBeds = svit * 3 + dubbel * 2 + single * 1;
    const totalRooms = svit + dubbel + single;

    // Kontrollera om det finns tillräckligt med lediga rum
    if (totalRooms > freeRooms) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Tyvärr finns det inte tillräckligt med rum för att ändra din bokning. Det finns endast ${freeRooms} rum tillgängliga.`,
        }),
      };
    }

    // Validera bokningen
    if (totalBeds >= guests && guests !== 0 && from && to) {
      // Uppdatera bokningen i DynamoDB
      await docClient
        .update({
          TableName: tableName,
          Key: { id: bookingId, bookingName: bookingName },
          UpdateExpression:
            "set guests = :guests, totalRooms = :totalRooms, totalBeds = :totalBeds, cost = :cost, #from = :from, #to = :to ",
          ExpressionAttributeValues: {
            ":guests": guests,
            ":totalRooms": totalRooms,
            ":totalBeds": totalBeds,
            ":cost": cost,
            ":from": from,
            ":to": to,
          },
          ExpressionAttributeNames: {
            "#from": "from",
            "#to": "to",
          },
        })
        .promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Din bokning har uppdaterats. Du är nu bokad mellan ${from} och ${to}. Total kostnad: ${cost} kr.`,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Oj då, något gick fel. Kontrollera dina val.",
        }),
      };
    }
  } catch (error) {
    console.error("DynamoDB Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Bokningen kunde inte uppdateras. Försök igen senare...",
        error: error.message,
      }),
    };
  }
};
