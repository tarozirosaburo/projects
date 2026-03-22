let nodes = [];
let edges = {}; // 隣接リスト
let edgeData = {}; // エッジごとのスコア等のメタデータ {"1-2": {score: 3.0}}
let nodeMarkers = [];
let edgeLines = [];
let nextNodeId = 1;
const STORAGE_KEY = "walk_graph";
const DISABLED_EDGE_KEY = "disabled_edges";
const R = 6371000;
const pi = Math.PI;
const toRad = (deg) => deg * pi / 180;

function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function addNode(lat, lng) {
  const node = { id: nextNodeId++, lat, lng };
  nodes.push(node);
  createMarker(node);
  rebuildEdges();
  drawEdges();
  saveGraph();
}

function createMarker(node) {
  const marker = L.marker([node.lat, node.lng]).addTo(map);
  nodeMarkers.push(marker);
}

function rebuildEdges(maxDist = 300) {
  edges = {};
  nodes.forEach(n => (edges[n.id] = []));
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = calcDistance(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
      if (d <= maxDist) {
        const u = nodes[i].id;
        const v = nodes[j].id;
        edges[u].push(v);
        edges[v].push(u);
        
        // エッジデータの初期化（既存データがあれば維持）
        const key = edgeKey(u, v);
        if (!edgeData[key]) {
          edgeData[key] = { score: 1.0 }; // デフォルトスコア
        }
      }
    }
  }
}

function drawEdges() {
  edgeLines.forEach(line => map.removeLayer(line));
  edgeLines = [];

  Object.keys(edges).forEach(uId => {
    edges[uId].forEach(vId => {
      if (parseInt(vId) <= parseInt(uId)) return;
      const u = nodes.find(n => n.id == uId);
      const v = nodes.find(n => n.id == vId);
      const key = edgeKey(uId, vId);
      const disabled = disabledEdges.has(key);

      // 修正：細めの灰色ライン、クリックでON/OFF
      const line = L.polyline([[u.lat, u.lng], [v.lat, v.lng]], {
        color: disabled ? "#ddd" : "#999",
        weight: 2,
        opacity: disabled ? 0.5 : 0.5,
        dashArray: disabled ? "4, 4" : null
      }).addTo(map);

      line.on("click", () => {
        disabledEdges.has(key) ? disabledEdges.delete(key) : disabledEdges.add(key);
        saveDisabledEdges();
        drawEdges();
      });
      edgeLines.push(line);
    });
  });
}

function saveGraph() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, edgeData, nextNodeId }));
}

let disabledEdges = new Set();
function saveDisabledEdges() {
  localStorage.setItem(DISABLED_EDGE_KEY, JSON.stringify([...disabledEdges]));
}
function loadDisabledEdges() {
  const data = localStorage.getItem(DISABLED_EDGE_KEY);
  if (data) disabledEdges = new Set(JSON.parse(data));
}

function clearGraph() {
  nodeMarkers.forEach(m => map.removeLayer(m));
  edgeLines.forEach(l => map.removeLayer(l));
  nodeMarkers = [];
  edgeLines = [];
  nodes = [];
  edges = {};
  disabledEdges.clear();
  nextNodeId = 1;
  localStorage.clear();
}

function loadGraph() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  const obj = JSON.parse(data);
  nodes = obj.nodes;
  nextNodeId = obj.nextNodeId;
  nodes.forEach(n => createMarker(n));
  rebuildEdges();
  drawEdges();
}