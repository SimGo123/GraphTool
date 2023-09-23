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
            printArr(incidentEdges)
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
        printArr(queue);
    }
    return distances;
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
    let t2 = point.y + (1/m) * point.x;
    let closeX = (t2 - t) / (m + 1/m);
    let closestPoint = new Point(closeX, m * closeX + t);

    if (closeX < Math.min(lineStart.x, lineEnd.x) || closeX > Math.max(lineStart.x, lineEnd.x)
        || closestPoint.y < Math.min(lineStart.y, lineEnd.y) || closestPoint.y > Math.max(lineStart.y, lineEnd.y)) {
        return Math.min(distance(point, lineStart), distance(point, lineEnd));
    }

    return distance(point, closestPoint);
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