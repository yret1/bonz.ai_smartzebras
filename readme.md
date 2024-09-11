# Gruppprojekt Smart Zebras

## Jonathan Tirapegui, Simon Gustavsson, Jens Alm



### Skapa bokning

*method* **POST**
*URL* https://yd63of64si.execute-api.eu-north-1.amazonaws.com/createBooking

***krav***:<br/>
bookingName: namnet på den som står för bokningen <br/>
guests: antalet gäster (oavsett ålder)<br/>
roomsReq: en array med alla rum som hotellet erbjuder. ändra count på varje rum för det som kunden önskar. 0 = inget rum av denna typ behövs.<br/>
from: Datum för bokningens start i formatet YYYY-MM-DD<br/>
to: Datum för bokningens slut i formatet YYYY-MM-DD<br/>



***OBSERVERA***
Det går inte att boka fler rum än antalet gäster. Minst en gäst per rum.
Det går inte heller att boka färre rum än antalet sängar

Svit: 3 sängar
Dubbel: 2 sängar
Single: 1 säng

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
