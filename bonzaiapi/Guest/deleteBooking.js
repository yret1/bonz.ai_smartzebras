const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const bookingNumber = event.pathParameters.id;
  const tableName = "allBookings";
  const bookingName = event.pathParameters.bookingName;

  console.log("Booking number: ", bookingNumber);

  const params = {
    TableName: tableName,
    Key: {
      id: bookingNumber,
      bookingName: bookingName,
    },
  };

  try {
    const response = await dynamoDB.delete(params).promise();
    if (!response) {
      return {
        statusCode: 404,
        body: JSON.stringify({ ERROR: "Booking number not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Could not delete booking, problem with server",
      }),
    };
  }
};

// const calculateRemovable = (startDate) => {
//   //Bokningens startdatum
//   // const start = new Date(startDate);
//   // //Dagens datum
//   // const today = new Date();
//   // if (today > start) {
//   //   throw new Error(
//   //     "Din bokning är redan aktiv. Det går inte längre att ändra eller avboka."
//   //   );
//   // }
//   // // Millisekunder mellan start och slut
//   // const differenceInMillis = start - today;
//   // // Konvertera till dagar
//   // const millisecondsInDay = 24 * 60 * 60 * 1000;
//   // const differenceInDays = differenceInMillis / millisecondsInDay;
//   // // Returnera antal nätter för bokningen
//   // if (differenceInDays >= 2) {
//   //   return true;
//   // } else {
//   //   return false;
//   // }
// };
