[![GitHub License](https://img.shields.io/github/license/Binnette/parking-mapper)](https://opensource.org/licenses/MIT)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Binnette/parking-mapper/build-and-deploy.yml?label=Build%20and%20Deploy)](https://github.com/Binnette/parking-mapper/actions/workflows/build-and-deploy.yml)
[![W3C Validation](https://img.shields.io/w3c-validation/html?targetUrl=https%3A%2F%2Fbinnette.github.io%2Fparking-mapper%2F)](https://validator.nu/?doc=https%3A%2F%2Fbinnette.github.io%2Fparking-mapper%2F)
[![Use this app online|Parking Mapper 1.1.0](https://img.shields.io/website?url=https%3A%2F%2Fbinnette.github.io%2Fparking-mapper%2F&up_message=Parking%20Mapper%201.1.0&label=Use%20this%20app%20online)](https://binnette.github.io/parking-mapper/)

# Parking Mapper 1.1.0

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

1. Clone this repo: `git clone https://github.com/Binnette/parking-mapper.git`
2. Open cloned repo: `cd parking-mapper`
3. Install node modules: `npm i`
4. Run the app locally: `npm run dev`
5. Open url: https://localhost:5173/parking-mapper

Note: this app works and is connected to OSM API, so you can use it directly to edit OSM data.
