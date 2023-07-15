class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const Direction = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
}

// Ball up or under obj
function upDownCheck(ball, obj, objH) {
    return (ball.y >= obj.y + objH / 2 ? Direction.DOWN : Direction.UP);
}

// Ball left or right of obj
function leftRightCheck(ball, obj, objW) {
    return (ball.x >= obj.x + objW / 2 ? Direction.RIGHT : Direction.LEFT);
}


function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Determine the distance between a point and a line
function pointLineDist(lineStart, lineEnd, point) {
    // let t = (
    //     (point.x - lineStart.x) * (lineEnd.x - lineStart.x) 
    //     + (point.y - lineStart.y) * (lineEnd.y - lineStart.y)
    //     ) 
    //     / Math.pow(lineLength, 2);
    // let closestPoint = new Point(lineStart.x + t * (lineEnd.x - lineStart.x), lineStart.y + t * (lineEnd.y - lineStart.y));
    // return distance(point, closestPoint);
    let m = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
    let t = lineStart.y - m * lineStart.x;
    let t2 = point.y + m * point.x;
    let closeX = (t2 - t) / (2 * m);
    let closestPoint = new Point(closeX, m * closeX + t);

    if (closeX < Math.min(lineStart.x, lineEnd.x) || closeX > Math.max(lineStart.x, lineEnd.x)
        || closestPoint.y < Math.min(lineStart.y, lineEnd.y) || closestPoint.y > Math.max(lineStart.y, lineEnd.y)) {
        return Math.min(distance(point, lineStart), distance(point, lineEnd));
    }

    return distance(point, closestPoint);
}

function pointCredibilityUpdate(point, obj, objW, objH) {
    if (point.x < obj.x) point.x = obj.x;
    if (point.x > obj.x + objW) point.x = obj.x + objW;

    if (point.y < obj.y) point.y = obj.y;
    if (point.y > obj.y + objH) point.y = obj.y + objH;

    return point;
}

function getUpDownDist(ball, obj, objW, objH) {
    let closestUpDownX = ball.x;
    let upDown = upDownCheck(ball, obj, objH);
    let closestUpDownY = (upDown == Direction.UP) ? obj.y : obj.y + objH;

    let closestUpDownPoint = new Point(closestUpDownX, closestUpDownY);
    closestUpDownPoint = pointCredibilityUpdate(closestUpDownPoint, obj, objW, objH);

    return distance(ball, closestUpDownPoint);
}

function getLeftRightDist(ball, obj, objW, objH) {
    let leftRight = leftRightCheck(ball, obj, objW);
    let closestLeftRightX = (leftRight == Direction.LEFT) ? obj.x : obj.x + objW;
    let closestLeftRightY = ball.y;

    let closestLeftRightPoint = new Point(closestLeftRightX, closestLeftRightY);
    closestLeftRightPoint = pointCredibilityUpdate(closestLeftRightPoint, obj, objW, objH);

    return distance(ball, closestLeftRightPoint);
}

// Check if ball is touching obj with width objW and height objH
// If resetCollision is true, move ball out of colliding object
function touchCheckAndUpdate(ball, obj, objW, objH, resetCollision) {
    let upDown = upDownCheck(ball, obj, objH);
    let leftRight = leftRightCheck(ball, obj, objW);

    let upDownDist = getUpDownDist(ball, obj, objW, objH);
    let leftRightDist = getLeftRightDist(ball, obj, objW, objH);

    let isInside = ball.x >= obj.x && ball.x <= obj.x + objW
        && ball.y >= obj.y && ball.y <= obj.y + objH;

    let returnVal = upDownDist < Ball.radius || leftRightDist < Ball.radius || isInside;

    if (resetCollision) {
        if (upDownDist <= leftRightDist && upDownDist < Ball.radius) {
            ball.y = (upDown == Direction.UP) ? obj.y - Ball.radius : obj.y + objH + Ball.radius;
        } else if (leftRightDist < upDownDist && leftRightDist < Ball.radius) {
            ball.x = (leftRight == Direction.LEFT) ? obj.x - Ball.radius : obj.x + objW + Ball.radius;
        }
    }

    return returnVal;
}


// class Point
// {
//     constructor(x, y)
//     {
//         this.x = x;
//             this.y = y;
//     }
// }
  
// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r)
{
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
function orientation(p, q, r)
{
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);
    
    if (val == 0) return 0; // collinear
    
    return (val > 0)? 1: 2; // clock or counterclock wise
}
  
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{
    if ((p1.x == p2.x && p1.y == p2.y) || (p1.x == q2.x && p1.y == q2.y)) return false;
    if ((q1.x == p2.x && q1.y == p2.y) || (q1.x == q2.x && q1.y == q2.y)) return false;

    // Find the four orientations needed for general and
    // special cases
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);
    
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