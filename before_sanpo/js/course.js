const home = {
  lat: 37.8650,
  lng: 138.9340,
};

function findNearestNode(lat, lng) {
  let best = null;
  let bestDist = Infinity;

  nodes.forEach(n => {
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

    let current = start;
    let course = [start];
    let total = 0;

    const visited = new Set([start.id]);
    let forceReturn = false;

    for (let step = 0; step < 200; step++) {
        const neighborsAll = edges[current.id];
        if (!neighborsAll || neighborsAll.length === 0) break;

        let candidates;
        if (!forceReturn) {
            candidates = neighborsAll.filter(id =>
                !visited.has(id) &&
                !disabledEdges.has(edgeKey(current.id, id)));
            if (candidates.length === 0) {
                forceReturn = true;
                continue;
            }
        } else {
            candidates = neighborsAll.filter(id =>
                !disabledEdges.has(edgeKey(current.id, id))
            );
        }

        if (candidates.length === 0) break;

        let nextId;

        if (!forceReturn) {
            nextId = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            nextId = candidates.reduce((best, id) => {
                const n = nodes.find(n => n.id === id);
                const b = nodes.find(n => n.id === best);
                const dn = calcDistance(n.lat, n.lng, start.lat, start.lng);
                const db = calcDistance(b.lat, b.lng, start.lat, start.lng);
                return dn < db ? id : best;
            }, candidates[0]);
        }

        const next = nodes.find(n => n.id === nextId);
        if (!next) break;

        total += calcDistance(
            current.lat, current.lng,
            next.lat, next.lng
        );

        if (total > targetDist * 1.2) forceReturn = true;
        course.push(next);
        visited.add(nextId);
        current = next;

        if (forceReturn && current.id === start.id) {
            return course;
        }
    }
    if (current.id !== start.id) {
        course.push(start);
    }
    return course;
}

function drawCourse(course) {
  const latlngs = course.map(n => [n.lat, n.lng]);

  if (plannedRoute) map.removeLayer(plannedRoute);

  plannedRoute = L.polyline(latlngs, {
    color: "blue",
    weight: 4,
  }).addTo(map);

  map.fitBounds(plannedRoute.getBounds());

  const dist = calcCourseDistance(course);
  alert(`このコースの距離は ${(dist / 1000).toFixed(2)} km です`);
}


function calcCourseDistance(course) {
  let sum = 0;
  for (let i = 0; i < course.length - 1; i++) {
    sum += calcDistance(
      course[i].lat, course[i].lng,
      course[i + 1].lat, course[i + 1].lng
    );
  }
  return sum;
}
