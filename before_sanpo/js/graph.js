let nodes = [];
let edges = {};
let nodeMarkers = [];
let nextNodeId = 1;
const STORAGE_KEY = "walk_graph";
const DISABLED_EDGE_KEY = "disabled_edges";
const R = 6371000; // 地球の半径（m）
const pi = Math.PI
const toRad = (deg) => deg * pi / 180;
const toDeg = (rad) => rad * 180 / pi;

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  //Haversine距離
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function addNode(lat, lng) {
  const node = { id: nextNodeId++, lat, lng };
  nodes.push(node);

  const marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`Node ${node.id}`)

  nodeMarkers.push(marker);
  rebuildEdges();
  drawEdges();
  saveGraph();
}

function rebuildEdges(maxDist = 300) {
  edges = {};
  nodes.forEach(n => (edges[n.id] = []));

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const d = calcDistance(a.lat, a.lng, b.lat, b.lng);
      if (d <= maxDist) {
        edges[a.id].push(b.id);
        edges[b.id].push(a.id);
      }
    }
  }
  console.log("edges rebuilt:", edges); // ★追加
}

function saveGraph() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ nodes, edges, nextNodeId })
  );
}

function saveDisabledEdges() {
  localStorage.setItem(
    DISABLED_EDGE_KEY,
    JSON.stringify([...disabledEdges])
  );
}

function loadDisabledEdges() {
  const data = localStorage.getItem(DISABLED_EDGE_KEY);
  if (!data) return;

  disabledEdges = new Set(JSON.parse(data));
}

let disabledEdges = new Set();

function clearGraph() {
  nodeMarkers.forEach(m => map.removeLayer(m));
  edgeLines.forEach(l => map.removeLayer(l));

  nodeMarkers = [];
  edgeLines = [];
  nodes = [];
  edges = {};
  disabledEdges.clear();
  nextNodeId = 1;

  localStorage.removeItem(STORAGE_KEY);
}

function loadGraph() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const obj = JSON.parse(data);
  nodes = obj.nodes;
  edges = obj.edges;
  nextNodeId = obj.nextNodeId;

  nodes.forEach(n => {
    const marker = L.marker([n.lat, n.lng])
      .addTo(map)
      .bindPopup(`Node ${n.id}`);
    nodeMarkers.push(marker);
  });
  rebuildEdges();
  drawEdges();
}

let edgeLines = [];
function drawEdges() {
  edgeLines.forEach(line => map.removeLayer(line));
  edgeLines = [];

  nodes.forEach(n => {
    const neighbors = edges[n.id];
    if (!neighbors) return;

    neighbors.forEach(neiId => {
      if (neiId <= n.id) return;

      const nei = nodes.find(x => x.id === neiId);
      if (!nei) return;

      const key = edgeKey(n.id, neiId);
      const disabled = disabledEdges.has(key);

      const line = L.polyline(
        [
          [n.lat, n.lng],
          [nei.lat, nei.lng]
        ],
        {
          color: disabled ? "white" : "gray",
          weight: 3,
          opacity: disabled ? 0.4 : 0.7,
          dashArray: disabled ? "2,6" : null
        }
      ).addTo(map);
      line.bringToFront();   // ★追加

      line.on("click", () => {
        if (disabledEdges.has(key)) {
          disabledEdges.delete(key);
        } else {
          disabledEdges.add(key);
        }
        saveDisabledEdges(); // ★追加
        drawEdges();
      });

      edgeLines.push(line);
    });
  });
}
