const ALGORITHMS = {
    TRIANGULATION: 0
};

function algorithmClick(param) {
    if (param == ALGORITHMS.TRIANGULATION) {
        triangulation();
    }
}

function triangulation() {
    console.log("triangulation");
    if (graph.vertices.length < 3) {
        console.log("not enough vertices for triangulation");
        return;
    }
    if (!graph.isPlanarEmbedded()) {
        console.log("graph is not planar embedded");
        return;
    }
    if (graph.getConnectedComponents().length > 1) {
        console.log("graph is not connected");
        return;
    }
    var vertex = getNextDegOneVertex();
    // Add edges until there are no more vertices of degree 1
    while (vertex != null) {
        var neighbour = graph.getAllNeighbours(vertex)[0];
        // console.log("neighbour " + JSON.stringify(neighbour));
        var neighboursNeighbours = graph.getAllNeighbours(neighbour);
        let neighboursNeighbour = nextVertexAfter(neighboursNeighbours, vertex, true);
        // console.log("neighboursNeighbour " + JSON.stringify(neighboursNeighbour));
        var edge = new Edge(vertex, neighboursNeighbour);
        graph.addEdge(edge);
        console.log("added edge " + JSON.stringify(edge));
        vertex = getNextDegOneVertex();
    }
    redrawAll();

    // Triangulate the graph without paying attention to loops/multiple edges
    let allFacets = getAllFacets();
    $.each(allFacets, function (_index, facet) {
        console.log("facet " + _index);
        if (facet.length > 3) {
            var verticesOnFacet = [];
            $.each(facet, function (_index, edge) {
                verticesOnFacet.push(edge.v2);
            });
            console.log("verticesOnFacet " + JSON.stringify(verticesOnFacet));
            for (var i = 2; i < verticesOnFacet.length - 1; i++) {
                var edge = new Edge(verticesOnFacet[0], verticesOnFacet[i]);
                graph.addEdge(edge);
                console.log("added edge " + edge.print());
            }
        }
    });
    redrawAll();

    // Remove multiple edges by performing edge exchanges
    let multiEdges = graph.getMultiEdges();
    $.each(multiEdges, function (_index, multiEdge) {
        graph.deleteEdge(multiEdge);
        let newPoints = [];
        for (var i = 0; i < allFacets.length; i++) {
            if (eqIndexOf(allFacets[i], multiEdge) != -1) {
                var verticesOnFacet = [];
                $.each(allFacets[i], function (_index, edge) {
                    verticesOnFacet.push(edge.v2);
                });
                verticesOnFacet.splice(eqIndexOf(verticesOnFacet, multiEdge.v1), 1);
                verticesOnFacet.splice(eqIndexOf(verticesOnFacet, multiEdge.v2), 1);
                newPoints.push(verticesOnFacet[0]);
            }
        }
        if (newPoints.length == 2) {
            var edge = new Edge(newPoints[0], newPoints[1]);
            graph.addEdge(edge);
            console.log("added edge " + edge.print());
        } else {
            console.log("newPoints.length != 2");
        }
    });
    redrawAll();
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

function nextVertexAfter(vertices, afterVertex, rightDir) {
    let vertexIndex = eqIndexOf(vertices, afterVertex);
    console.log("vertexIndex " + vertexIndex);
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

// Returns an array of facet walks
// TODO Handle one degree vertices
// Requires: graph is planar embedded, only one connected component
function getAllFacets() {
    console.log("getAllFacets");
    // Copy edges into statusEdges, which keep additional left/right visited booleans
    let statusEdges = [];
    $.each(graph.edges, function (_index, edge) {
        // Status edges are [edge, rightVisited, leftVisited]
        statusEdges.push([edge, false, false]);
    });
    let facets = [];
    $.each(graph.edges, function (_index, edge) {
        let statusEdge = statusEdges[statusEdgeIndex(statusEdges, edge)];
        console.log("edge " + edge.print() + " " + statusEdge[1] + " " + statusEdge[2]);
        if (!statusEdge[1]) {
            console.log("1");
            let rightFacet = facetWalk(edge, true);
            console.log("rightFacet " + rightFacet.length);
            facets.push(rightFacet);
            $.each(rightFacet, function (_index, edge) {
                let edgeIndex = statusEdgeIndex(statusEdges, edge);
                if (statusEdges[edgeIndex][0].v1 == edge.v1) {
                    statusEdges[edgeIndex][1] = true;
                    console.log("r");
                } else {
                    statusEdges[edgeIndex][2] = true;
                    console.log("l");
                }
            });
            let facetStr = "";
            $.each(rightFacet, function (_index, edge) {
                facetStr += edge.print() + " ";
            });
            console.log(facetStr);
        }
        statusEdge = statusEdges[statusEdgeIndex(statusEdges, edge)];
        if (!statusEdge[2]) {
            console.log("2");
            let leftFacet = facetWalk(edge, false);
            console.log("leftFacet " + leftFacet.length);
            facets.push(leftFacet);
            $.each(leftFacet, function (_index, edge) {
                let edgeIndex = statusEdgeIndex(statusEdges, edge);
                if (statusEdges[edgeIndex][0].v1 == edge.v1) {
                    statusEdges[edgeIndex][2] = true;
                    console.log("l");
                } else {
                    statusEdges[edgeIndex][1] = true;
                    console.log("r");
                }
            });
            let facetStr = "";
            $.each(leftFacet, function (_index, edge) {
                facetStr += edge.print() + " ";
            });
            console.log(facetStr);
        }
    });
    console.log("Found " + facets.length + " facets");
    $.each(facets, function (_index, facet) {
        let facetStr = "";
        $.each(facet, function (_index, vertex) {
            facetStr += vertex.number + " ";
        });
        console.log(facetStr);
    });
    return facets;
}

// Follow a facet from a vertex back to itself, return edges on facet
function facetWalk(edge, rightDir) {
    let startVertex = edge.v1;
    console.log("startVertex " + startVertex.number + " v1 " + edge.v1.number + " v2 " + edge.v2.number);
    let facet = [];
    facet.push(edge);
    let prevVertex = edge.v1;
    let currentVertex = edge.v2;
    while (!currentVertex.eq(startVertex)) {
        let neighbours = graph.getAllNeighbours(currentVertex);
        let nextVertex = nextVertexAfter(neighbours, prevVertex, rightDir);
        facet.push(new Edge(currentVertex, nextVertex));
        prevVertex = currentVertex;
        currentVertex = nextVertex;
    }
    return facet;
}

function eqIndexOf(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].eq(element)) {
            return i;
        }
    }
    console.log("eq index not found");
    return -1;
}

function statusEdgeIndex(statusEdges, edge) {
    //console.log("looking for " + edge.print());
    for (var i = 0; i < statusEdges.length; i++) {
        //console.log("statusEdge " + statusEdges[i][0].v1.number + " " + statusEdges[i][0].v2.number);
        if (statusEdges[i][0].eq(edge)) {
            //console.log("found se");
            return i;
        }
    }
    console.log("no se");
    return -1;
}

/*
Problem with:
[{"x":360,"y":97.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},{"x":166,"y":284.6000061035156,"number":0,"radius":15,"highlightColor":"red","color":"gray"},{"x":139,"y":155.60000610351562,"number":1,"radius":15,"highlightColor":"red","color":"gray"},{"x":224,"y":391.6000061035156,"number":2,"radius":15,"highlightColor":"red","color":"gray"},{"x":360,"y":97.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},{"x":139,"y":155.60000610351562,"number":1,"radius":15,"highlightColor":"red","color":"gray"},{"x":166,"y":284.6000061035156,"number":0,"radius":15,"highlightColor":"red","color":"gray"},{"x":360,"y":97.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},{"x":224,"y":391.6000061035156,"number":2,"radius":15,"highlightColor":"red","color":"gray"},{"x":139,"y":155.60000610351562,"number":1,"radius":15,"highlightColor":"red","color":"gray"},{"x":221,"y":187.60000610351562,"number":4,"radius":15,"highlightColor":"red","color":"gray"}]
*/