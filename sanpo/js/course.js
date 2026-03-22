const home = { lat: 37.865, lng: 138.934 };

function generateLoopCourse(targetDist) {
  const start = findNearestNode(home.lat, home.lng);
  if (!start) return null;

  let bestCourse = null;
  let minDiff = Infinity;

  // 複数の試行から最適なものを選択（ESの「検証の反復」を体現）
  for (let i = 0; i < 30; i++) {
    const course = findCandidate(start, targetDist);
    if (course) {
      const d = calcCourseDistance(course);
      const diff = Math.abs(d - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        bestCourse = course;
      }
    }
  }
  return bestCourse;
}

function findCandidate(start, targetDist) {
  let current = start;
  let path = [start];
  let visitedEdges = new Set();
  let currentDist = 0;

  for (let step = 0; step < 100; step++) {
    const neighbors = edges[current.id] || [];
    let candidates = neighbors.filter((nextId) => {
      const key = edgeKey(current.id, nextId);
      return !disabledEdges.has(key) && !visitedEdges.has(key);
    });

    const isReturning = currentDist > targetDist * 0.75;

    if (candidates.length === 0) {
      if (neighbors.includes(start.id)) {
        path.push(start);
        return path;
      }
      break;
    }

    // スコア順に並び替え
    candidates.sort((a, b) => {
      const scoreA = edgeData[edgeKey(current.id, a)]?.score || 1;
      const scoreB = edgeData[edgeKey(current.id, b)]?.score || 1;

      if (isReturning) {
        const distA = calcDistance(
          nodes.find((n) => n.id == a).lat,
          nodes.find((n) => n.id == a).lng,
          start.lat,
          start.lng,
        );
        const distB = calcDistance(
          nodes.find((n) => n.id == b).lat,
          nodes.find((n) => n.id == b).lng,
          start.lat,
          start.lng,
        );
        return distA - distB;
      }
      return scoreB - scoreA;
    });

    // ★ここで「遊び」を入れる
    // 上位3つ（候補が少なければその全数）からランダムに1つ選択
    const pickRange = isReturning ? 1 : 3; // 帰るときは迷わず最短で、行きは寄り道する
    const topCandidates = candidates.slice(0, pickRange);
    const nextId =
      topCandidates[Math.floor(Math.random() * topCandidates.length)];

    const nextNode = nodes.find((n) => n.id == nextId);

    currentDist += calcDistance(
      current.lat,
      current.lng,
      nextNode.lat,
      nextNode.lng,
    );
    visitedEdges.add(edgeKey(current.id, nextId));
    path.push(nextNode);
    current = nextNode;

    if (current.id === start.id && currentDist > targetDist * 0.8) return path;
  }

  path.push(start);
  return path;
}

function findNearestNode(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  nodes.forEach((n) => {
    const d = calcDistance(lat, lng, n.lat, n.lng);
    if (d < bestDist) {
      bestDist = d;
      best = n;
    }
  });
  return best;
}

function calcCourseDistance(course) {
  let sum = 0;
  for (let i = 0; i < course.length - 1; i++) {
    sum += calcDistance(
      course[i].lat,
      course[i].lng,
      course[i + 1].lat,
      course[i + 1].lng,
    );
  }
  return sum;
}

function drawCourse(course) {
  if (plannedRoute) map.removeLayer(plannedRoute);
  const latlngs = course.map((n) => [n.lat, n.lng]);
  plannedRoute = L.polyline(latlngs, {
    color: "#3498db",
    weight: 5,
    opacity: 0.9,
  }).addTo(map);
  map.fitBounds(plannedRoute.getBounds());
  alert(`コース確定：${(calcCourseDistance(course) / 1000).toFixed(2)}km`);
}
