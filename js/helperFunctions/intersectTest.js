class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Determine the distance between a point and a line
function pointLineDist(lineStart, lineEnd, point) {
    let m = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
    let t = lineStart.y - m * lineStart.x;
    let t2 = point.y + (1 / m) * point.x;
    let closeX = (t2 - t) / (m + 1 / m);
    let closestPoint = new Point(closeX, m * closeX + t);

    if (closeX < Math.min(lineStart.x, lineEnd.x) || closeX > Math.max(lineStart.x, lineEnd.x)
        || closestPoint.y < Math.min(lineStart.y, lineEnd.y) || closestPoint.y > Math.max(lineStart.y, lineEnd.y)) {
        return Math.min(distance(point, lineStart), distance(point, lineEnd));
    }

    return distance(point, closestPoint);
}

// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
        return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function segOrientation(p, q, r) {
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.y - p.y) * (r.x - q.x) -
        (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0; // collinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2) {
    if ((p1.x == p2.x && p1.y == p2.y) || (p1.x == q2.x && p1.y == q2.y)) return false;
    if ((q1.x == p2.x && q1.y == p2.y) || (q1.x == q2.x && q1.y == q2.y)) return false;

    // Find the four orientations needed for general and
    // special cases
    let o1 = segOrientation(p1, q1, p2);
    let o2 = segOrientation(p1, q1, q2);
    let o3 = segOrientation(p2, q2, p1);
    let o4 = segOrientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

function toPointList(vertcies) {
    return vertcies.map(v => new Point(v.x, v.y));
}

/**
 * @param {Point} point
 * @param {Point[]} polygon
 */
function isInPolygon(point, polygon) {
    let maxX = this.getMaxPolygonX(polygon);
    let ray = [point, new Point(maxX + 1, point.y)];
    let intersections = 0;
    for (let i = 0; i < polygon.length; i++) {
        let edge = [polygon[i], polygon[(i + 1) % polygon.length]];
        if (this.doIntersect(ray[0], ray[1], edge[0], edge[1])) {
            intersections++;
        }
    }
    return intersections % 2 == 1;
}

function getMaxPolygonX(polygon) {
    let maxX = polygon[0].x;
    for (let i = 1; i < polygon.length; i++) {
        if (polygon[i].x > maxX) {
            maxX = polygon[i].x;
        }
    }
    return maxX;
}