import 'remodal/dist/remodal.css'
import 'remodal/dist/remodal-default-theme.css'
import 'jquery-toast-plugin/dist/jquery.toast.min.css'
import './style.css'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import 'leaflet-bing-layer'
import $ from 'jquery'
import OsmRequest from 'osm-request'
import 'jquery-toast-plugin'
import 'remodal'
import { osmAuth } from 'osm-auth';
import { conf, overpassApiUrl, bingMapsKey, mapboxAccessToken } from './conf.js'

// ui components
let map, polyline, bbox, parkings, currentElement, changesetId, index, solved, skipped, solvedChangeset, total;
// changeset details
const createdBy = 'Parking-Mapper 1.3.0';
const SplitFixMe = 'Split this parking to set correct types to each part.'
let changesetSource = 'OpenStreetMap';

conf.redirect_uri = window.location.origin + window.location.pathname;
console.log(conf);
var auth = osmAuth(conf);
const osm = new OsmRequest(conf);

function initParkingMapper() {
  initMap();
  initUser();
  initUi();
}

// Initialize leaflet map
function initMap() {
  map = L.map('map');
  map.setView([47.0, 2.0], 5);

  let baseLayers = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20, maxNativeZoom: 19
    }),
    'Esri World Imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://wiki.openstreetmap.org/wiki/Esri">Esri</a>',
      maxZoom: 20, maxNativeZoom: 19
    }),
    'Esri World Imagery (Clarity) Beta': L.tileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://wiki.openstreetmap.org/wiki/Esri">Esri</a>',
      maxZoom: 20, maxNativeZoom: 18
    }),
    'Bing Aerial': L.tileLayer.bing({
      attribution: '&copy; <a href="https://opengeodata.org/microsoft-imagery-details">Bing Maps</a>',
      bingMapsKey: bingMapsKey,
      maxZoom: 20
    }),
    'Mapbox Satellite': L.tileLayer('https://api.mapbox.com/v4/{tileset_id}/{z}/{x}/{y}@2x.{format}?access_token={accessToken}', {
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
      tileset_id: 'mapbox.satellite',
      format: 'jpg',
      accessToken: mapboxAccessToken,
      maxZoom: 20, maxNativeZoom: 18
    }),
    'BDOrtho IGN': L.tileLayer('https://proxy-ign.openstreetmap.fr/94GjiyqD/bdortho/{z}/{x}/{y}.jpg', {
      attribution: '&copy; <a href="https://www.openstreetmap.fr/bdortho/">BDOrtho IGN</a>',
      maxZoom: 20, maxNativeZoom: 18
    })
  };

  baseLayers['OpenStreetMap'].addTo(map);

  let layerControl = L.control.layers(baseLayers).addTo(map);

  map.on('baselayerchange', function (e) {
    changesetSource = e.name;
    layerControl.collapse();
  });
}

function initUser() {
  console.log('initUser')
  $('.div-authent').toggle(false);
  if (auth.authenticated()) {
    auth.xhr({
      method: 'GET',
      path: '/api/0.6/user/details.json'
    }, function (err, data) {
      if (err) {
        $.toast({
          icon: 'error',
          heading: 'Error getting user details',
          text: err.responseText,
          position: 'bottom-center'
        });
        auth.logout();
        initUser();
      } else {
        $('#connected').toggle(true);
        let d = JSON.parse(data);
        $('#user_img').attr('src', d.user.img.href);
        $('#user_name').text(d.user.display_name);
        $('#user_name').attr('href', `https://www.openstreetmap.org/user/${encodeURIComponent(d.user.display_name)}`);
      }
    });
  } else {
    $('#disconnected').toggle(true);
  }
}

// Initialize the full UI. Bind button, etc.
function initUi() {
  // bind buttons 
  $('#connect').on('click', authenticate);
  $('#logout').on('click', disconnect);
  $("#start").on('click', () => {
    toggleModal(false, 'modal');
    showToolbar('#selection');
  });
  $("#btn-start-here").on('click', () => {
    showPanel('#welcome');
    toggleModal(true, 'modal');
  });
  $('#query-parking').on('click', queryParking);
  $('.type').on('click', onClickType);
  $('#more').on('click', () => toggleModal(true, 'modal-more'));
  $('.next').on('click', onClickNext);
  $('#fixme').on('click', onClickFixme);
  $('#ideditor').on('click', onClickIdEditor);
  $('#josmeditor').on('click', onClickJosmEditor);

  $('#back').on('click', () => showPanel('#welcome'));
  $('.continue').on('click', () => showPanel('#welcome'));
  $('.btn-about').on('click', () => showPanel('#about'));

  toggleModal(true, 'modal');
}

function toggleModal(toggle, id) {
  var modal = $(`[data-remodal-id=${id}]`).remodal({ hashTracking: false });
  if (toggle) {
    modal.open();
  } else {
    modal.close();
  }
}

function onClickIdEditor() {
  if (currentElement) {
    const url = `https://www.openstreetmap.org/edit?${currentElement._type}=${currentElement._id}`;
    window.open(url);
  } else {
    $.toast({
      icon: 'error',
      heading: 'No current element',
      text: 'Can not open iD editor.',
      position: 'bottom-center'
    });
  }
}

function onClickJosmEditor() {
  if (currentElement) {
    const url = `http://localhost:8111/load_object?objects=${currentElement._type}${currentElement._id}`;
    window.open(url);
  } else {
    $.toast({
      icon: 'error',
      heading: 'No current element',
      text: 'Can not open JOSM.',
      position: 'bottom-center'
    });
  }
}

// authenticate user
function authenticate() {
  if (auth.authenticated()) {
    authenticated();
  } else {
    auth.xhr({ method: "GET", path: "/api/0.6/user/details" },
      function (err, result) {
        // result is an XML DOM containing the user details
        if (err) {
          $.toast({
            icon: 'error',
            heading: 'Error authenticating',
            text: + err.responseText,
            position: 'bottom-center'
          });
          console.error(err);
          console.error(result);
        }
      }
    );
  }
}

function authenticated() {
  auth.authenticate(() => {
    // Fully authed at this point
    // remove code and state from url
    const currentUrl = window.location.href;
    const cleanUrl = currentUrl.split('?')[0];
    window.history.replaceState({}, '', cleanUrl);
    console.log('Authenticated');
    initParkingMapper();
  });
}

// disconnect user
function disconnect() {
  auth.logout();
  initUser();
}

// show the given panel
function showPanel(panel) {
  $('.panel').toggle(false);
  $(panel).toggle(true);
}

function showToolbar(toolbar) {
  $('.toolbar').toggle(false);
  $(toolbar).toggle(true);
}

function queryParking() {
  $.toast().reset('all');
  let zoom = map.getZoom();
  if (zoom < 10) {
    $.toast({
      icon: 'error',
      heading: 'Area too large',
      text: 'Zoom at least to 10 (current: ' + zoom + ')',
      position: 'bottom-center'
    });
    return;
  }
  showToolbar('#loading');
  var bounds = map.getBounds();
  bounds = map.wrapLatLngBounds(bounds);
  loadParkings(bounds);
}

// load parking from overpass
function loadParkings(bounds) {
  bbox = bounds._southWest.lat + ', ' + bounds._southWest.lng + ', ' +
    bounds._northEast.lat + ', ' + bounds._northEast.lng;

  let url = overpassApiUrl + 'interpreter?data=' +
    '[out:json];' +
    '(' +
    'way[amenity=parking][!parking][!fixme](' + bbox + ');' +
    'way[amenity=parking][parking=yes][!fixme](' + bbox + ');' +
    ');' +
    'out ids geom;';

  fetch(url)
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      // when parking are loaded
      parkings = data.elements;
      // devmode only, use test data
      //parkings = test.elements;
      total = parkings.length;
      if (total > 0) {
        $('#total').text(total);
        index = 0;
        solved = 0;
        solvedChangeset = 0;
        skipped = 0;
        $('#index').text(index);
        $('#solved').text(solved);
        $('#skipped').text(skipped);
        // show the challenge panel
        showToolbar('#challenge');
        // go to the first parking
        next();
        // info message, change to aerial imagery
        if (changesetSource == 'OpenStreetMap') {
          $.toast({
            icon: 'info',
            heading: 'Parking(s) found',
            text: 'Switch to aerial view using the top right button.',
            position: 'bottom-center'
          });
        }
        return;
      } else {
        $.toast({
          icon: 'warning',
          heading: 'Found no parking without type',
          text: 'Move map to another area.',
          position: 'bottom-center'
        });
        showToolbar('#selection');
      }
    }).catch(function (err) {
      $.toast({
        icon: 'error',
        heading: 'Error getting parking',
        text: err,
        position: 'bottom-center'
      });
      console.error(err);
      showToolbar('#selection');
    });
}

// center map on parking and add marker
function showParking(p) {
  $('.action').prop('disabled', true);

  if (polyline) {
    map.removeLayer(polyline);
  }

  currentElement = undefined;
  osm.fetchElement(p.type + '/' + p.id).then(function (data) {
    currentElement = data;
    polyline = L.polyline(p.geometry).addTo(map);
    let bounds = [[p.bounds.minlat, p.bounds.minlon], [p.bounds.maxlat, p.bounds.maxlon]];
    map.fitBounds(bounds);
    $('#index').text(index);
    $('.action').prop('disabled', false);
  }).catch(function (err) {
    $('.action').prop('disabled', true);
    $('#index').text(index);
    if (is404(err)) {
      $.toast({
        icon: 'error',
        heading: 'Parking not found',
        text: 'Element ' + p.type + '/' + p.id + ' not found on ' + endpoint,
        position: 'bottom-center'
      });
    } else {
      $.toast({
        icon: 'error',
        heading: 'Error getting parking',
        text: err,
        position: 'bottom-center'
      });
    }
  });
}

function is404(err) {
  try {
    let mess = JSON.parse(err.message);
    return mess.status === 404;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// disable button and go to next element
function onClickNext() {
  $('.action').prop('disabled', true);
  skipped++;
  $('#skipped').text(skipped);
  next();
}

// go to the next parking
function next() {
  toggleModal(false, 'modal-more');
  if (index >= total) {
    $('#total-done').text(total);
    $('#solved-done').text(solved);
    if (changesetId) {
      osm.closeChangeset(changesetId).then(function (result) {
        if (result) {
          $('#closing-error').text('Error while closing changeset: ' + result);
          showPanel('#end-error');
        } else {
          showPanel('#done');
        }
      });
      // reset changesetId
      changesetId = undefined;
    } else {
      showPanel('#done');
    }
    toggleModal(true, "modal");
    showToolbar('#start-here');
    return;
  }
  let p = parkings[index];
  index++;
  showParking(p);
}

// on type button click
function onClickType(event) {
  $('.action').prop('disabled', true);
  let type = event.target.value;
  setParkingType(type);
}

function getComment() {
  return `Add parking type for ${solvedChangeset} parkings in bbox(${bbox})`;
}

function getChangesetTags() {
  return Object.assign({ parking: solvedChangeset }, { source: changesetSource });
}

function checkOrCreateChangeset() {
  if (changesetId) {
    return osm.isChangesetStillOpen(changesetId)
      .catch((err) => {
        console.warn(err);
        return osm.createChangeset(createdBy, getComment(), getChangesetTags())
          .then((id) => {
            solvedChangeset = 0;
            changesetId = id;
          });
      });
  } else {
    return osm.createChangeset(createdBy, getComment(), getChangesetTags())
      .then((id) => {
        solvedChangeset = 0;
        changesetId = id;
      });
  }
}

function onClickFixme() {
  checkOrCreateChangeset().then(() => {
    setElementTag(SplitFixMe);
  });
}

// Ensure a changeset is open, then set the parking type
function setParkingType(type) {
  checkOrCreateChangeset().then(() => {
    setElementTag(type);
  });
}

function setElementSuccess(newElementVersion, type) {
  currentElement = osm.setVersion(currentElement, newElementVersion);
  console.log('updated id:' + currentElement._id + ", type:" + type + ", version:" + newElementVersion);
  solved++;
  solvedChangeset++;
  $('#solved').text(solved);
  // update comment and tags in changeset
  osm.updateChangesetTags(changesetId, createdBy, getComment(), getChangesetTags())
    .then(function () {
      next();
    })
    .catch(function (err) {
      $.toast({
        icon: 'error',
        heading: 'Error updating changeset',
        text: err,
        position: 'bottom-center'
      });
      next();
    });
}

// set the tag parking to the element
function setElementTag(type) {
  console.log('setElementTag id:' + currentElement._id + ", type:" + type + ", version:" + currentElement.$.version);
  if (type == SplitFixMe) {
    // We add a fixme tag
    currentElement = osm.setTag(currentElement, 'fixme', SplitFixMe);
  } else {
    // We set the parking type in tag 'parking'
    currentElement = osm.setTag(currentElement, 'parking', type);
  }
  // send element to OSM api
  osm.sendElement(currentElement, changesetId)
    .then(function (data) {
      setElementSuccess(data, type);
    })
    .catch(function (err) {
      $.toast({
        icon: 'error',
        heading: 'Error sending element', 
        text: err,
        position: 'bottom-center'
      });
      next();
    });
}

if (window.location.search.slice(1).split('&').some(p => p.startsWith('code='))) {
  console.log('Window call Authenticated');
  authenticated();
} else{
  initParkingMapper();
}
