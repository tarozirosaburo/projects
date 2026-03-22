let mode = "course"; // "node" or "course"

document.getElementById("clear").onclick = () => {
  clearGraph();
  clearCourse();
};

const modeswitch = document.getElementById('switch');
const modenode = document.getElementById('node');
const modecourse = document.getElementById('course');

modeswitch.addEventListener('click', function () {
  if (mode != "course") {
    modenode.style.display = "none";
    modecourse.style.display = 'block';
    mode = "course";
  } else {
    modenode.style.display = "block";
    modecourse.style.display = 'none';
    mode = "node";
  }
});

window.onload = () => {
  initMap();
  loadGraph();
  loadDisabledEdges(); // ★追加
  drawEdges();
  modenode.style.display = 'none';

  map.on("click", e => {
    if (mode === "node") {
      addNode(e.latlng.lat, e.latlng.lng);
    }
  });

  document.getElementById("generateBtn").onclick = () => {
    const km = parseFloat(
      document.getElementById("distanceInput").value
    );
    if (isNaN(km) || km <= 0) {
      alert("距離を入力してください");
      return;
    }

    const course = generateLoopCourse(km * 1000);
    if (!course) {
      alert("コース生成に失敗しました");
      return;
    }
    drawCourse(course);
  }
}