let client_id = "";
if (window.location.toString().startsWith('https://binnette.github.io/parking-mapper/')) {
  // PROD configuration
  client_id = 'vchtknFnqUHquSUleQSXeLmi2Jt2LEi6CT-6lJOVVsY';
  console.log("Prod configuration");
} else if (window.location.toString().startsWith('https://localhost:5173/parking-mapper'))  {
  // DEV configuration
  client_id = '8fPnRt71H3eVzk_MDjxUbqY9YLobiBSxwzzdbZ5T_58';
  console.log("Dev configuration");
} else {
  console.error('Check configuration. Unknow hostname: ' + window.location.hostname);
}
const url = 'https://www.openstreetmap.org';
const apiUrl = 'https://api.openstreetmap.org';
export const overpassApiUrl = 'https://overpass-api.de/api/';
export const bingMapsKey = 'AlP2hZdKUYiJxdBH7O65tFO8mxiz_OZk5Vx6V5mxzW3WKkilMKP9hfixb1CpHuS4'

export const conf = {
  scope: "read_prefs write_api",
  client_id: client_id,
  redirect_uri : '',
  url: url,
  apiUrl: apiUrl,
  auto: true,
  singlepage: true
};
