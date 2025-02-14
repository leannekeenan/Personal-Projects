const { SquareClient, SquareEnvironment, SquareError } = require("square");
require('dotenv').config()

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Sandbox,
});

async function getLocations() {
  try {
    let listLocationsResponse = await client.locations.list();

    let locations = listLocationsResponse.locations;

    locations.forEach(function (location) {
      console.log(
        location.id + ": " +
        location.name + ", " +
        location.address.addressLine1 + ", " +
        location.address.locality
      );
    });
  } catch (error) {
    if (error instanceof SquareError) {
      error.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
  }
};

getLocations();
