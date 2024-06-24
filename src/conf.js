const client_id = '...';
const url = 'https://www.openstreetmap.org';
const apiUrl = 'https://api.openstreetmap.org';
export const overpassApiUrl = 'https://overpass-api.de/api/';

export const conf = {
  scope: "read_prefs write_api",
  client_id: client_id,
  redirect_uri : '',
  url: url,
  apiUrl: apiUrl,
  auto: true,
  singlepage: true
};
