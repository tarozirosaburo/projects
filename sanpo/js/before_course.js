const home = { lat: 37.865, lng: 138.934 };

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

function generateLoopCourse(targetDist) {
  const start = findNearestNode(home.lat, home.lng);
  if (!start) return null;

  let bestCourse = null;
  let minDiff = Infinity;

  // ESの「試行錯誤」をコード化：内部で20パターンのルートを作り、最も誤差が少ないものを採用
  for (let i = 0; i < 20; i++) {
    const candidate = attemptRandomPath(start, targetDist);
    if (candidate) {
      const d = calcCourseDistance(candidate);
      const diff = Math.abs(d - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        bestCourse = candidate;
      }
    }
  }
  return bestCourse;
}

function attemptRandomPath(start, targetDist) {
  let current = start;
  let path = [start];
  let visited = new Set([start.id]);
  let currentDist = 0;

  // ステップ数を制限しつつ、目標距離の約70%まで進む
  for (let step = 0; step < 100; step++) {
    const neighbors = edges[current.id] || [];
    let candidates = neighbors.filter(
      (id) => !visited.has(id) && !disabledEdges.has(edgeKey(current.id, id)),
    );

    if (candidates.length === 0 || currentDist > targetDist * 0.7) break;

    // 【ESのポイント】独自スコアと勾配による重み付け
    candidates.sort((a, b) => {
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      // スコアが高い・勾配が緩やかな方を優先する評価式
      const scoreA =
        nodeA.score - Math.abs(nodeA.elevation - current.elevation) * 0.1;
      const scoreB =
        nodeB.score - Math.abs(nodeB.elevation - current.elevation) * 0.1;
      return scoreB - scoreA;
    });

    // 上位候補からランダムに選択（楽しさの維持）
    const topCandidates = candidates.slice(0, 3);
    const nextId =
      topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const next = nodes.find((n) => n.id === nextId);

    currentDist += calcDistance(current.lat, current.lng, next.lat, next.lng);
    path.push(next);
    visited.add(nextId);
    current = next;
  }

  // 最後に最短距離でスタートへ戻る（帰還ロジック）
  const returnPath = getReturnPath(current, start, visited);
  return path.concat(returnPath);
}

function getReturnPath(fromNode, toNode, visited) {
  // 簡易的な帰還：常にゴールに近い隣接ノードを選択
  let path = [];
  let current = fromNode;
  for (let i = 0; i < 20; i++) {
    const neighbors = edges[current.id] || [];
    if (neighbors.includes(toNode.id)) {
      path.push(toNode);
      return path;
    }
    let bestNext = null;
    let minDist = Infinity;
    neighbors.forEach((id) => {
      const n = nodes.find((x) => x.id === id);
      const d = calcDistance(n.lat, n.lng, toNode.lat, toNode.lng);
      if (d < minDist) {
        minDist = d;
        bestNext = n;
      }
    });
    if (!bestNext || bestNext.id === current.id) break;
    path.push(bestNext);
    current = bestNext;
  }
  return path;
}

function drawCourse(course) {
  const latlngs = course.map((n) => [n.lat, n.lng]);
  if (plannedRoute) map.removeLayer(plannedRoute);
  plannedRoute = L.polyline(latlngs, {
    color: "#FF5722",
    weight: 6,
    opacity: 0.8,
  }).addTo(map);
  map.fitBounds(plannedRoute.getBounds());
  const dist = calcCourseDistance(course);
  alert(
    `生成コース距離: ${(dist / 1000).toFixed(2)} km\n(目標との差: ${Math.abs(dist - document.getElementById("distanceInput").value * 1000).toFixed(0)}m)`,
  );
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
