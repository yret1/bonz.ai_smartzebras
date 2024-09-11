# Gruppprojekt Smart Zebras

## Jonathan Tirapegui, Simon Gustavsson, Jens Alm

### Skapa bokning

_method_ **POST**

krav:
bookingName: namnet på den som står för bokningen
guests: antalet gäster (oavsett ålder)
roomsReq: en array med alla rum som hotellet erbjuder. ändra count på varje rum för det som kunden önskar. 0 = inget rum av denna typ behövs.
from: Datum för bokningens start i formatet YYYY-MM-DD
to: Datum för bokningens slut i formatet YYYY-MM-DD

**_OBSERVERA_**
Det går inte att boka fler rum än antalet gäster. Minst en gäst per rum.
Det går inte heller att boka färre rum än antalet sängar

Svit: 3 sängar
Dubbel: 2 sängar
Single: 1 säng

```

*****INSTRUKTIONER*****

CreateBooking:

URL - https://yd63of64si.execute-api.eu-north-1.amazonaws.com/createBooking
Method - POST
Body:
```

{
"bookingName" : "Simon",
"guests" : 8,
"roomsReq" : [
{
"name" : "Svit",
"count" : 3
},
{
"name" : "Dubble",
"count" : 0
},
{
"name":"single",
"count": 0
}
],
"from" : "2024-09-12",
"to" : "2024-09-20"
}

```

Nu har du skapat en boking.
Nästa steg är att prova göra en ändring i bokningen. Observera att du inte kan ändra namnet på den bokade gästen utan enbart hur många gäster ni är och antalet gäster samt datum.

OBS!!! Namn och ID är enbart för visningens skull. När du har skapat en bokning kommer du att få ett annat id som inte stämmer överens med exemplaren nedan!

Databasen har en partition key och sort key.
Detta innebär att vi behöver både ID:t som bokningen generar samt namnet på den bokade personen som endpoint i URL:en

URL - https://yd63of64si.execute-api.eu-north-1.amazonaws.com/changeBooking/8821b343-203f-4a6c-a3b6-ed67d2534652/Simon

Method: PUT

Body:
```

```
{
"bookingName" : "Simon",
 "guests" : 8, // Testa att ändra antalet gäster
"roomsReq" : [
{
"name" : "Svit",
"count" : 3
},
{
"name" : "Dubble",
"count" : 0
},
{
"name":"single",
"count": 0
}
],
"from" : "2024-09-12", //Testa att ändra Datum
"to" : "2024-09-20" // Testa att ändra slut datum.
}

```

Hämta bokningen och se ifall den har uppdaterats med id och namn som endpoint i URL:en

URL - https://yd63of64si.execute-api.eu-north-1.amazonaws.com/getBookingsToEdit/8821b343-203f-4a6c-a3b6-ed67d2534652/Simon

Method: GET

Om du som gäst skulle få förhinder och vill avboka din bokning så finns den möjligheten.

Sätt ID och Namn i url:en

OBS! Bokningen får inte ändrar om det är mindre än två dagar till startdatum.

URL - https://yd63of64si.execute-api.eu-north-1.amazonaws.com/deleteBooking/8821b343-203f-4a6c-a3b6-ed67d2534652/Simon

Method - DELETE

Om du som receptionist vill se över alla bokningar kan du göra det via.

URL - https://yd63of64si.execute-api.eu-north-1.amazonaws.com/getBookingAdmin
Method: GET

Som admin kan du se över alla ledigarum samt alla inlagda bokningar.
