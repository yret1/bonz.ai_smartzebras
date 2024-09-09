# Gruppprojekt Smart Zebras

## Jonathan Tirapegui, Simon Gustavsson, Jens Alm



### Skapa bokning

*method* **POST**

krav:
bookingName: namnet på den som står för bokningen
guests: antalet gäster (oavsett ålder)
roomsReq: en array med alla rum som hotellet erbjuder. ändra count på varje rum för det som kunden önskar. 0 = inget rum av denna typ behövs.
from: Datum för bokningens start i formatet YYYY-MM-DD
to: Datum för bokningens slut i formatet YYYY-MM-DD

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
