function depthFirstSearch(vertex) {
    console.log("depthFirstSearch");
    let visited = [];
    let stack = [];
    stack.push(vertex);
    while (stack.length > 0) {
        let vertex = stack.pop();
        if (eqIndexOf(visited, vertex) == -1) {
            visited.push(vertex);
            let neighbours = graph.getAllNeighbours(vertex);
            $.each(neighbours, function (_index, neighbour) {
                stack.push(neighbour);
            });
        }
    }
    return visited;
}

class BreadthSearchVertex {
    constructor(vertex, parent) {
        this.vertex = vertex;
        this.parent = parent;
    }

    eq(other) {
        return this.vertex.eq(other.vertex);
    }
}

function breadthFirstSearchTree(vertex, runGraph) {
    console.log("breadthFirstSearchTree");
    let visited = [vertex];
    let layers = [];
    let prevLayer = [new BreadthSearchVertex(vertex, null)];
    while (prevLayer.length > 0) {
        let nextLayer = [];
        layers.push(prevLayer);
        $.each(prevLayer, function (_index, prevLayerBSVertex) {
            let neighbours = runGraph.getAllNeighbours(prevLayerBSVertex.vertex);
            console.log('neighbours: ' + neighbours.length);
            $.each(neighbours, function (_index, neighbourVertex) {
                if (eqIndexOf(visited, neighbourVertex) == -1) {
                    visited.push(neighbourVertex);
                    nextLayer.push(new BreadthSearchVertex(neighbourVertex, prevLayerBSVertex.vertex));
                }
            });
        });
        prevLayer = nextLayer;
    }
    return layers;
}

// Next brute force iteration
// Starts with [false, false, ...]
// Ends with [true, true, ...]
// Returns null if [true, true, ...] was passed
function nextBruteForceIter(array) {
    let done = !array.includes(false);
    if (done) {
        return null;
    }

    let index = array.indexOf(false);
    array[index] = true;
    for (let i = 0; i < index; i++) {
        array[i] = false;
    }
    return array;
}

function getDijekstraResults(startVertex) {
    let queue = [startVertex];
    let distances = [];
    graph.vertices.forEach(v => {
        distances.push(parseInt(Number.MAX_SAFE_INTEGER));
    });
    distances[eqIndexOf(graph.vertices, startVertex)] = 0;
    while (queue.length > 0) {
        let newQueue = [];
        queue.forEach(v => {
            let incidentEdges = graph.getIncidentEdges(v, true);
            incidentEdges.forEach(e => {
                let dist = parseInt(distances[eqIndexOf(graph.vertices, v)]) + parseInt(e.weight);
                let nNumber = (e.v1nr != v.number) ? e.v1nr : e.v2nr;
                let neighbourIdx = eqIndexOf(graph.vertices, graph.getVertexByNumber(nNumber));
                if (dist < distances[neighbourIdx]) {
                    distances[neighbourIdx] = dist;
                    newQueue.push(graph.getVertexByNumber(nNumber));
                }
            })
        });
        queue = newQueue;
    }
    return distances;
}

// Check if graph contains negative cycles using Bellman-Ford
function containsNegativeCycles(graph, startVertex) {
    let numVertices = graph.vertices.length;
    let shortestPaths = [];
    let predecessors = [];
    for (let i = 0; i < numVertices; i++) {
        shortestPaths.push(10000);
        predecessors.push(null);
    }
    shortestPaths[graph.getVertexIdByNumber(startVertex.number)] = 0;

    for (let i = 0; i < numVertices - 1; i++) {
        for (let j = 0; j < graph.edges.length; j++) {
            let edge = graph.edges[j];
            let u = graph.getVertexIdByNumber(edge.v1nr);
            let v = graph.getVertexIdByNumber(edge.v2nr);
            let weight = parseInt(edge.weight);
            if (edge.orientation == EdgeOrientation.NORMAL || edge.orientation == EdgeOrientation.UNDIRECTED) {
                if (shortestPaths[u] + parseInt(weight) < shortestPaths[v]) {
                    shortestPaths[v] = shortestPaths[u] + weight;
                    predecessors[v] = u;
                }
            }
            if (edge.orientation == EdgeOrientation.REVERSED || edge.orientation == EdgeOrientation.UNDIRECTED) {
                if (shortestPaths[v] + parseInt(weight) < shortestPaths[u]) {
                    shortestPaths[u] = shortestPaths[v] + weight;
                    predecessors[u] = v;
                }
            }
        }
    }
    for (let j = 0; j < graph.edges.length; j++) {
        let edge = graph.edges[j];
        let u = graph.getVertexIdByNumber(edge.v1nr);
        let v = graph.getVertexIdByNumber(edge.v2nr);
        let weight = parseInt(edge.weight);
        if (edge.orientation == EdgeOrientation.NORMAL || edge.orientation == EdgeOrientation.UNDIRECTED) {
            if (shortestPaths[u] + weight < shortestPaths[v]) {
                predecessors[v] = u;
                // A negative cycle exist; find a vertex on the cycle 
                visited = [];
                for (let i = 0; i < numVertices; i++) {
                    visited.push(false);
                }
                visited[v] = true;
                while (!visited[u]) {
                    visited[u] = true;
                    u = predecessors[u];
                }
                // u is a vertex in a negative cycle, find the cycle itself
                ncycle = [u];
                v = predecessors[u];
                while (v != u) {
                    ncycle.unshift(graph.vertices[v].number);
                    v = predecessors[v]
                }
                console.log('Negative cycle: ' + ncycle);
                return true;
            }
        }
        if (edge.orientation == EdgeOrientation.REVERSED || edge.orientation == EdgeOrientation.UNDIRECTED) {
            if (shortestPaths[v] + weight < shortestPaths[u]) {
                console.log('dwn');
                predecessors[u] = v;
                // A negative cycle exist; find a vertex on the cycle 
                visited = [];
                for (let i = 0; i < numVertices; i++) {
                    visited.push(false);
                }
                visited[u] = true;
                while (!visited[v]) {
                    visited[v] = true;
                    v = predecessors[v];
                }
                // u is a vertex in a negative cycle, find the cycle itself
                ncycle = [graph.vertices[v].number];
                u = predecessors[v];
                while (u != v) {
                    ncycle.unshift(graph.vertices[u].number);
                    u = predecessors[u]
                }
                console.log('Negative cycle: ' + ncycle);
                return true;
            }
        }
    }
    return false;
}


function getNextDegOneVertex() {
    console.log("deg1");
    for (var i = 0; i < graph.vertices.length; i++) {
        var vertex = graph.vertices[i];
        if (graph.getVertexDegree(vertex) == 1) {
            console.log("found deg1 vertex");
            return vertex;
        }
    }
    console.log("no deg1 vertices");
    return null;
}

function eqIndexOf(array, element, withId = false, withWeightAndOrient = false) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].eq(element, withId, withWeightAndOrient)) {
            return i;
        }
    }
    //console.log("eq index not found");
    return -1;
}

function safeArrDel(arr, elem) {
    let index = arr.indexOf(elem);
    if (index > -1) {
        arr.splice(index, 1);
    }
}
function safeArrEqDel(arr, elem, withId = false) {
    let index = eqIndexOf(arr, elem, withId);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

function sortClockwise(vertex, vertices) {
    return vertices.sort(function (x, y) {
        if (getAngle(vertex, x) < getAngle(vertex, y)) {
            return -1;
        }
        if (getAngle(vertex, x) > getAngle(vertex, y)) {
            return 1;
        }
        return 0;
    });
}

// Get the angle in degrees between 0 o'clock from the vertex and the vertex's neighbor
function getAngle(vertex, neighbour) {
    var dAx = 0;
    var dAy = -1;
    var dBx = neighbour.x - vertex.x;
    var dBy = neighbour.y - vertex.y;
    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);

    var degree_angle = Math.abs(angle * (180 / Math.PI));
    if (angle < 0) degree_angle = 360 - Math.abs(degree_angle);

    return degree_angle;
}

function changeVectorLength(vector, length) {
    let vectorLength = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    return new Point(vector.x * length / vectorLength, vector.y * length / vectorLength);
}

function reverseOrientation(orientation) {
    switch (orientation) {
        case EdgeOrientation.NORMAL:
            return EdgeOrientation.REVERSED;
        case EdgeOrientation.REVERSED:
            return EdgeOrientation.NORMAL;
    }
    return EdgeOrientation.UNORIENTED;
}

function haveOpposedOrient(orientation1, orientation2) {
    return (orientation1 == EdgeOrientation.NORMAL && orientation2 == EdgeOrientation.REVERSED)
        || (orientation1 == EdgeOrientation.REVERSED && orientation2 == EdgeOrientation.NORMAL);
}

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
function orientation(p, q, r) {
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

function printArr(arr) {
    arr.forEach(elem => console.log(elem.print()));
}

class VertexFacet {
    constructor(vertexNumber, facet) {
        this.vertexNumber = vertexNumber;
        this.facet = facet;
    }
}

class VertexEquality {
    constructor(vertexNumber1, vertexNumber2) {
        this.vertexNumber1 = vertexNumber1;
        this.vertexNumber2 = vertexNumber2;
    }
}

class EdgeEquality {
    constructor(edge1, edge2) {
        this.edge1 = edge1;
        this.edge2 = edge2;
    }
}