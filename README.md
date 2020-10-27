# Parking Mapper 1.0.0

Parking Mapper is a simple webapp that helps you to directly contribute to OpenStreetMap.
You will have to identify the type of displayed parkings by looking to the aerial imagery.
Currently this app is available only in France, cause it uses the imagey 'BDOrtho IGN'.

See [documentation](https://wiki.openstreetmap.org/wiki/Key:parking) for details about the tag mapped by this app.

Parking Maper is a JavaScript application that run 100% in your web browser, it doesn't need a backend. You can host this app on any static web hosting service.

## How to use this app

1. Open https://binnette.github.io/parking-mapper/
2. Click on button 'Authenticate'
3. Zoom to the desired area in France
4. Click on button 'Get parkings'
5. Wait for the Overpass query to complete
6. When a parking is displayed, look to the imagery
7. Then pick the correct parking type
8. Continue with the next parking

Note: you can skip current parking by pressing button 'next'

## Run or debug locally

1. Clone this repo
2. Set const `oauthConsumerKey` and `oauthSecret` in file conf.js
3. Type following commands:

```
yarn
yarn serve
```

Open your web browser: http://localhost:8000/