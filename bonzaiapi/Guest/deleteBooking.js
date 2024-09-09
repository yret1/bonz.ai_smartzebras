const calculateRemovable = (startDate) => {
  //Bokningens startdatum
  const start = new Date(startDate);

  //Dagens datum
  const today = new Date();

  if (today > start) {
    throw new Error(
      "Din bokning är redan aktiv. Det går inte längre att ändra eller avboka."
    );
  }

  // Millisekunder mellan start och slut
  const differenceInMillis = start - today;

  // Konvertera till dagar
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const differenceInDays = differenceInMillis / millisecondsInDay;

  // Returnera antal nätter för bokningen
  if (differenceInDays >= 2) {
    return true;
  } else {
    return false;
  }
};
