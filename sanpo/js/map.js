let map;
let debugLat = 37.8648;//37.8650;
let debugLng = 138.9402;//138.9340;
let plannedRoute = null;

function initMap() {
  map = L.map("mapcontainer", {zoomControl:false});
  map.setView([debugLat, debugLng], 16); 

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);
}

function clearCourse() {
  if (plannedRoute) {
    map.removeLayer(plannedRoute);
    plannedRoute = null;
  }
}