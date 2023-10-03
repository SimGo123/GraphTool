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
                ncycle = [graph.vertices[u].number];
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

function isBipartite(runGraph) {
    const numVertices = runGraph.vertices.length;
    const colors = new Array(numVertices).fill(-1); // Initialize colors as -1 (unvisited)

    const sets = [[], []]; // Two sets for vertices with colors 0 and 1

    for (let startVertex = 0; startVertex < numVertices; startVertex++) {
        if (colors[startVertex] === -1) {
            if (!bipartiteBFS(runGraph, startVertex, colors, sets)) {
                console.log('not bipartite starting with ' + runGraph.vertices[startVertex].number);
                return { isBipartite: false, sets: [] };
            }
        }
    }

    return { isBipartite: true, sets: sets };
}

function bipartiteBFS(runGraph, startVertex, colors, sets) {
    const queue = [];
    queue.push(startVertex);
    colors[startVertex] = 0; // Color the starting vertex as 0
    sets[0].push(startVertex); // Add the starting vertex to the first set

    while (queue.length > 0) {
        const currentVertex = queue.shift();

        const neighbours = runGraph.getAllNeighbours(runGraph.vertices[currentVertex]);
        for (let i = 0; i < neighbours.length; i++) {
            const neighborVertex = neighbours[i];
            const neighborIndex = eqIndexOf(runGraph.vertices, neighborVertex);
            if (colors[neighborIndex] === -1) {
                // If neighbor is unvisited, color it with the opposite color of the currentVertex
                colors[neighborIndex] = 1 - colors[currentVertex];
                sets[1 - colors[currentVertex]].push(neighborIndex); // Add to the opposite set
                queue.push(neighborIndex);
            } else if (colors[neighborIndex] === colors[currentVertex]) {
                // If neighbor has the same color as the currentVertex, the graph is not bipartite
                console.log('conflict: ' + runGraph.vertices[neighborIndex].number + ' and ' + runGraph.vertices[currentVertex].number);
                return false;
            }
            // If neighbor is already visited with a different color, continue
        }
    }

    return true;
}

const stdBackColorSet = new ColorSet("#D3D3D3", "#D3D3D3", "red");
function drawTwoGraphs(backGraph, foreGraph,
    backColorSet = stdBackColorSet, foreColorSet = new ColorSet()) {
    clearFgCanvas();
    drawCanvasWalls();
    backGraph.draw(null, null, backColorSet);
    foreGraph.draw(selectedVertex, selectedEdge, foreColorSet);
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

function mod(number, modulus) {
    return ((number % modulus) + modulus) % modulus;
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