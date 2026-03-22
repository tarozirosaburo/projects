let mode = "course";

const modeswitch = document.getElementById('switch');
const modenode = document.getElementById('node');
const modecourse = document.getElementById('course');

modeswitch.onclick = () => {
  mode = (mode === "course") ? "node" : "course";
  modenode.style.display = (mode === "node") ? "block" : "none";
  modecourse.style.display = (mode === "course") ? "block" : "none";
};

document.getElementById("clear").onclick = () => { clearGraph(); if(plannedRoute) map.removeLayer(plannedRoute); };

window.onload = () => {
  initMap();
  loadGraph();
  loadDisabledEdges();
  modenode.style.display = 'none';

  map.on("click", e => {
    if (mode === "node") {
      addNode(e.latlng.lat, e.latlng.lng); // アラートなし
    }
  });

  document.getElementById("generateBtn").onclick = () => {
    const km = parseFloat(document.getElementById("distanceInput").value);
    if (isNaN(km) || km <= 0) return alert("距離を入力してください");
    const course = generateLoopCourse(km * 1000);
    if (course) drawCourse(course);
    else alert("コース生成に失敗しました。ノードを増やすか、距離を調整してください。");
  };
};