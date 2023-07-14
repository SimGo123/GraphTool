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