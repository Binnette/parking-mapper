const endpoint = 'https://www.openstreetmap.org';
const oauthConsumerKey = '...';
const oauthSecret = '...';
const overpassApiUrl = '//overpass-api.de/api/';

const ConfOsmRequest = {
  endpoint: endpoint,
  oauthConsumerKey: oauthConsumerKey,
  oauthSecret: oauthSecret
};

const ConfOsmAuth = {
  url: endpoint,
  oauth_consumer_key: oauthConsumerKey,
  oauth_secret: oauthSecret,
  auto: true
};
