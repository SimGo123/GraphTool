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
    console.log('i ' + eqIndexOf(graph.vertices, startVertex));
    distances[eqIndexOf(graph.vertices, startVertex)] = 0;
    console.log('d ' + distances);
    while (queue.length > 0) {
        let newQueue = [];
        queue.forEach(v => {
            let incidentEdges = graph.getIncidentEdges(v, true);
            console.log('ice');
            printArr(incidentEdges)
            incidentEdges.forEach(e => {
                console.log(typeof distances[eqIndexOf(graph.vertices, v)]);
                console.log(typeof e.weight);
                let dist = parseInt(distances[eqIndexOf(graph.vertices, v)]) + parseInt(e.weight);
                let nNumber = (e.v1nr != v.number) ? e.v1nr : e.v2nr;
                let neighbourIdx = eqIndexOf(graph.vertices, graph.getVertexByNumber(nNumber));
                console.log(dist + ' vs ' + distances[neighbourIdx]);
                if (dist < distances[neighbourIdx]) {
                    distances[neighbourIdx] = dist;
                    newQueue.push(graph.getVertexByNumber(nNumber));
                }
            })
        });
        queue = newQueue;
        console.log('qu');
        printArr(queue);
    }
    return distances;
}


class StatusEdge {
    constructor(edge, rightVisited, leftVisited) {
        this.edge = edge;
        this.rightVisited = rightVisited;
        this.leftVisited = leftVisited;
    }
}

// Returns an array of facet walks
// Requires: graph is planar embedded, only one connected component
// TODO Handle one degree vertices
function getAllFacets() {
    console.log("getAllFacets");
    // Copy edges into statusEdges, which keep additional left/right visited booleans
    let statusEdges = [];
    $.each(graph.edges, function (_index, edge) {
        // Status edges are [edge, rightVisited, leftVisited]
        statusEdges.push(new StatusEdge(edge, false, false));
    });
    let facets = [];
    $.each(graph.edges, function (_index, edge) {
        let statusEdge = statusEdges[statusEdgeIndex(statusEdges, edge)];
        if (!statusEdge.rightVisited) {
            // console.log('right facet');
            let rightFacet = facetWalk(edge, true, statusEdges);
            facets.push(rightFacet);
            $.each(rightFacet, function (_index, edge) {
                let edgeIndex = statusEdgeIndex(statusEdges, edge);
                if (statusEdges[edgeIndex].edge.v1nr == edge.v1nr) {
                    statusEdges[edgeIndex].rightVisited = true;
                    // console.log("r");
                } else {
                    statusEdges[edgeIndex].leftVisited = true;
                    // console.log("l");
                }
            });
        }
        statusEdge = statusEdges[statusEdgeIndex(statusEdges, edge)];
        if (!statusEdge.leftVisited) {
            // console.log('left facet');
            let leftFacet = facetWalk(edge, false, statusEdges);
            facets.push(leftFacet);
            $.each(leftFacet, function (_index, edge) {
                let edgeIndex = statusEdgeIndex(statusEdges, edge);
                if (statusEdges[edgeIndex].edge.v1nr == edge.v1nr) {
                    statusEdges[edgeIndex].leftVisited = true;
                    // console.log("l");
                } else {
                    statusEdges[edgeIndex].rightVisited = true;
                    // console.log("r");
                }
            });
        }
    });
    console.log("Found " + facets.length + " facets");
    $.each(facets, function (_index, facet) {
        let facetStr = "";
        $.each(facet, function (_index, edge) {
            facetStr += edge.print() + " ";
        });
        // console.log(facetStr);
    });
    return facets;
}

// Follow a facet from a vertex back to itself, return edges on facet
function facetWalk(edge, rightDir, statusEdges) {
    let facet = [];
    let prevVertex = graph.getVertexByNumber(edge.v1nr);
    let currentVertex = graph.getVertexByNumber(edge.v2nr);
    let statusEdgeVisited = false;
    while (!statusEdgeVisited) {
        let neighbours = graph.getAllNeighbours(currentVertex);
        let nextVertex = nextVertexAfter(neighbours, prevVertex, rightDir);

        let newEdge = new Edge(currentVertex.number, nextVertex.number);
        let edgeIndex = statusEdgeIndex(statusEdges, newEdge);

        if (rightDir) {
            if (statusEdges[edgeIndex].edge.v1nr == newEdge.v1nr) {
                statusEdgeVisited = statusEdges[edgeIndex].rightVisited;
            } else {
                statusEdgeVisited = statusEdges[edgeIndex].leftVisited;
            }
        } else {
            if (statusEdges[edgeIndex].edge.v1nr == newEdge.v1nr) {
                statusEdgeVisited = statusEdges[edgeIndex].leftVisited;
            } else {
                statusEdgeVisited = statusEdges[edgeIndex].rightVisited;
            }
        }

        if (!statusEdgeVisited) {
            facet.push(newEdge);

            if (rightDir) {
                if (statusEdges[edgeIndex].edge.v1nr == newEdge.v1nr) {
                    statusEdges[edgeIndex].rightVisited = true;
                } else {
                    statusEdges[edgeIndex].leftVisited = true;
                }
            } else {
                if (statusEdges[edgeIndex].edge.v1nr == newEdge.v1nr) {
                    statusEdges[edgeIndex].leftVisited = true;
                } else {
                    statusEdges[edgeIndex].rightVisited = true;
                }
            }
        }

        prevVertex = currentVertex;
        currentVertex = nextVertex;
    }
    return facet;
}

function getUniqueVerticeNrsOnFacet(facet) {
    let verticesOnFacet = [];
    $.each(facet, function (_index, edge) {
        if (verticesOnFacet.indexOf(edge.v1nr) == -1) {
            verticesOnFacet.push(edge.v1nr);
        }
        if (verticesOnFacet.indexOf(edge.v2nr) == -1) {
            verticesOnFacet.push(edge.v2nr);
        }
    });
    return verticesOnFacet;
}

function getFacetCenter(facet) {
    let facetCenter = new Point(0, 0);
    let verticesOnFacet = getUniqueVerticeNrsOnFacet(facet);
    $.each(verticesOnFacet, function (_index, vertexNr) {
        let vertex = graph.getVertexByNumber(vertexNr);
        facetCenter.x += vertex.x;
        facetCenter.y += vertex.y;
    });
    facetCenter.x /= verticesOnFacet.length;
    facetCenter.y /= verticesOnFacet.length;
    return facetCenter;
}

// Try to get the outer facet by checking which facet contains 
// the extreme (max/min x/y) vertices
// May return one, multiple (or no) facets that could be the outer facet
// Requires: Planar embedded graph
function tryGetOuterFacet() {
    let extremeVertices = {
        'minX': graph.vertices[0], 'maxX': graph.vertices[0],
        'minY': graph.vertices[0], 'maxY': graph.vertices[0]
    };
    let minX = graph.vertices[0].x;
    let maxX = graph.vertices[0].x;
    let minY = graph.vertices[0].y;
    let maxY = graph.vertices[0].y;

    graph.vertices.forEach((vertex) => {
        if (vertex.x < minX) {
            minX = vertex.x;
            extremeVertices['minX'] = vertex;
        }
        if (vertex.x > maxX) {
            maxX = vertex.x;
            extremeVertices['maxX'] = vertex;
        }
        if (vertex.y < minY) {
            minY = vertex.y;
            extremeVertices['minY'] = vertex;
        }
        if (vertex.y > maxY) {
            maxY = vertex.y;
            extremeVertices['maxY'] = vertex;
        }
    });
    let facets = getAllFacets();
    let possibilities = [];
    facets.forEach((facet) => {
        let verticeNrsOnFacet = getUniqueVerticeNrsOnFacet(facet);
        if (verticeNrsOnFacet.includes(extremeVertices['minX'].number)
            && verticeNrsOnFacet.includes(extremeVertices['maxX'].number)
            && verticeNrsOnFacet.includes(extremeVertices['minY'].number)
            && verticeNrsOnFacet.includes(extremeVertices['maxY'].number)) {
            possibilities.push(facet);
        }
    });
    // Check if both facets contain the same vertices (like inside and outside of circle graph)
    if (possibilities.length == 2
        && possibilities[0].sort().join(',') === possibilities[1].sort().join(',')) {
        return [possibilities[0]];
    }
    return possibilities;
}

// Get next vertex after afterVertex in right/left direction
function nextVertexAfter(vertices, afterVertex, rightDir) {
    let vertexIndex = eqIndexOf(vertices, afterVertex);
    if (rightDir) {
        if (vertexIndex == vertices.length - 1) {
            return vertices[0];
        } else {
            return vertices[vertexIndex + 1];
        }
    } else {
        if (vertexIndex == 0) {
            return vertices[vertices.length - 1];
        } else {
            return vertices[vertexIndex - 1];
        }
    }
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

function statusEdgeIndex(statusEdges, edge) {
    //console.log("looking for " + edge.print());
    for (var i = 0; i < statusEdges.length; i++) {
        //console.log("statusEdge " + statusEdges[i][0].v1.number + " " + statusEdges[i][0].v2.number);
        if (statusEdges[i].edge.eq(edge)) {
            //console.log("found se");
            return i;
        }
    }
    console.log("no se");
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