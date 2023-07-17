const ALGORITHMS = {
    TRIANGULATION: 0
};

var algorithm = null;

async function algorithmClick(param) {
    if (param == ALGORITHMS.TRIANGULATION) {
        algorithm = new TriangulationAlgo();
        $("#algoControlPanel").removeClass("invisible");
        $("#stepButton").removeClass("disabled");
        $("#runCompleteButton").removeClass("disabled");
        await algorithm.run();
        algorithm = null;
    }
}

function stepClick() {
    if (algorithm != null) {
        algorithm.shouldContinue = true;
    }
}

function runCompleteClick() {
    if (algorithm != null) {
        algorithm.runComplete = true;
        algorithm.shouldContinue = true;
    }
}

class Algorithm {
    constructor() {
        this.shouldContinue = false;
        this.runComplete = false;
        this.numSteps = 0;
        this.currentStep = 0;
    }

    async run() {

    }

    async pause(stepTitle = "", stepDesc = "") {
        this.currentStep++;
        console.log("pause");
        if (this.runComplete) {
            return;
        }
        $("#stepButton").removeClass("disabled");
        $("#runCompleteButton").removeClass("disabled");
        $("#stepTitle").text("Step " + this.currentStep + "/" + this.numSteps + ": " + stepTitle);
        $("#stepDescription").text(stepDesc);
        while (!this.shouldContinue) {
            console.log("waiting");
            await this.sleep(1000);
        }
        this.shouldContinue = false;
        $("#stepButton").addClass("disabled");
        $("#runCompleteButton").addClass("disabled");
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onFinished() {
        $("#algoControlPanel").addClass("invisible");
        // $("#stepButton").removeClass("disabled");
        // $("#runCompleteButton").removeClass("disabled");
    }
}

class TriangulationAlgo extends Algorithm {
    async run() {
        console.log("triangulation");
        super.numSteps = 4;

        await super.pause("Connect degree 1 vertices", "Connect vertices of degree 1 to the next clockwise neighbour of their neighbour");

        if (graph.vertices.length < 3) {
            window.alert("can't triangulate, not enough vertices for triangulation");
            super.onFinished();
            return;
        }
        if (!graph.isPlanarEmbedded()) {
            window.alert("can't triangulate, graph is not planar embedded");
            super.onFinished();
            return;
        }
        if (graph.getConnectedComponents().length > 1) {
            window.alert("can't triangulate, graph is not connected");
            super.onFinished();
            return;
        }
        if (graph.getMultiEdges().length > 0 || graph.getLoops().length > 0) {
            window.alert("can't triangulate, graph has multi-edges or loops");
            super.onFinished();
            return;
        }

        this.connectDegOneVertices();

        await super.pause("Triangulate", "Triangulate the graph without paying attention to multi-edges/loops. Picks one vertex per facet and connects it with all other vertices in the facet except neighbours");
        let newFacets = this.uncleanTriangulation();

        await super.pause("Remove loops", "Remove loops");
        newFacets = this.cleanLoops(newFacets);

        await super.pause("Remove multi-edges", "Remove multi-edges by deleting newly added edges and connecting them to the other vertices in the facet (edge exchange)");
        this.cleanMultiEdges(newFacets);

        super.onFinished();

        return;
    }

    connectDegOneVertices() {
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
            console.log("added edge " + edge.print());
            vertex = getNextDegOneVertex();
        }
        redrawAll();
    }

    // Triangulate the graph without paying attention to loops/multi-edges
    uncleanTriangulation() {
        let allFacets = getAllFacets();

        let newFacets = [];
        $.each(allFacets, function (_index, facet) {
            newFacets.push(facet);
        });

        $.each(allFacets, function (index, facet) {
            if (facet.length > 3) {
                var verticesOnFacet = [];
                $.each(facet, function (_index, edge) {
                    verticesOnFacet.push(edge.v2);
                });
                let prevEdge = new Edge(verticesOnFacet[0], verticesOnFacet[1]);
                for (var i = 2; i < verticesOnFacet.length - 1; i++) {
                    var edge = new Edge(verticesOnFacet[0], verticesOnFacet[i], index + "_" + i);
                    graph.addEdge(edge);
                    console.log("added edge " + edge.print());
                    var newFacet = [
                        edge, new Edge(verticesOnFacet[i], verticesOnFacet[i - 1]),
                        prevEdge];
                    newFacets.push(newFacet);
                    prevEdge = edge;
                }
                var lastFacet = [
                    prevEdge,
                    new Edge(verticesOnFacet[verticesOnFacet.length - 2], verticesOnFacet[verticesOnFacet.length - 1]),
                    new Edge(verticesOnFacet[verticesOnFacet.length - 1], verticesOnFacet[0])];
                newFacets.push(lastFacet);
                newFacets.splice(newFacets.indexOf(facet), 1);
            }
        });

        $.each(newFacets, function (_index, facet) {
            console.log("Facet " + _index);
            let str = "";
            $.each(facet, function (_index, edge) {
                str += edge.print() + " ";
            });
            console.log(str);
        });
        redrawAll();

        return newFacets;
    }

    cleanLoops(newFacets) {
        let loops = graph.getLoops();
        $.each(loops, function (_index, loop) {
            graph.deleteEdge(loop);
            console.log("deleted loop " + loop.print());
            for (var i = 0; i < newFacets.length; i++) {
                let facet = newFacets[i];
                let index = eqIndexOf(facet, loop);
                if (index != -1) {
                    let id = facet[index].id;
                    if (id != null) {
                        for (var j = i + 1; j < newFacets.length; j++) {
                            let facet2 = newFacets[j];
                            let index2 = eqIndexOf(facet2, loop);
                            if (index2 != -1) {
                                let id2 = facet2[index2].id;
                                if (id == id2) {
                                    console.log("found both facets w/loop: " + i + " and " + j);
                                    let verticesOnFacet = getUniqueVerticesOnFacet(facet);
                                    safeArrEqDel(verticesOnFacet, loop.v1);
                                    safeArrEqDel(verticesOnFacet, loop.v2);

                                    let verticesOnFacet2 = getUniqueVerticesOnFacet(facet2);
                                    safeArrEqDel(verticesOnFacet2, loop.v1);
                                    safeArrEqDel(verticesOnFacet2, loop.v2);
                                    let newEdge = new Edge(verticesOnFacet[0], verticesOnFacet2[0]);
                                    graph.addEdge(newEdge);
                                    console.log("added edge " + newEdge.print());

                                    let facet2WithoutLoop = facet2.slice(0, index2).concat(facet2.slice(index2 + 1));
                                    //console.log('sl ' + printArr(facet.slice(0, index)) + ' + ' + printArr(facet2WithoutLoop) + ' + ' + printArr(facet.slice(index + 1)));
                                    let newFacet = facet.slice(0, index).concat(facet2WithoutLoop).concat(facet.slice(index + 1));
                                    let edgeToReplaceIdx = eqIndexOf(newFacet, new Edge(newEdge.v1, loop.v1), true);
                                    newFacet[edgeToReplaceIdx] = newEdge;
                                    safeArrEqDel(newFacet, new Edge(newEdge.v2, loop.v2), true);
                                    newFacets.push(newFacet);
                                    console.log('added facet ' + printArr(newFacet));

                                    let newFacet2 = [newEdge, new Edge(newEdge.v2, loop.v1), new Edge(loop.v1, newEdge.v1)];
                                    newFacets.push(newFacet2);
                                    console.log('added facet ' + printArr(newFacet2));

                                    newFacets.splice(newFacets.indexOf(facet), 1);
                                    newFacets.splice(newFacets.indexOf(facet2), 1);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
        });
        redrawAll();
        console.log('after removing loops');
        $.each(newFacets, function (_index, facet) {
            console.log("Facet " + _index);
            let str = "";
            $.each(facet, function (_index, edge) {
                str += edge.print() + " ";
            });
            console.log(str);
        });

        return newFacets;
    }

    // Remove multiple edges by performing edge exchanges
    cleanMultiEdges(newFacets) {
        let multiEdges = graph.getMultiEdges();
        let noIdOccured = [];
        $.each(multiEdges, function (_index, multiEdge) {
            graph.deleteEdge(multiEdge);
            console.log("Looking for multi-edge " + multiEdge.print());

            for (var i = 0; i < newFacets.length; i++) {
                let facet = newFacets[i];
                let index = eqIndexOf(facet, multiEdge);
                if (index != -1) {
                    let id = facet[index].id;
                    if (id != null) {
                        for (var j = i + 1; j < newFacets.length; j++) {
                            let facet2 = newFacets[j];
                            let index2 = eqIndexOf(facet2, multiEdge);
                            if (index2 != -1) {
                                let id2 = facet2[index2].id;
                                if (id == id2) {
                                    console.log("found both facets w/multi-edge: " + i + " and " + j);
                                    let verticesOnFacet = getUniqueVerticesOnFacet(facet);
                                    safeArrEqDel(verticesOnFacet, multiEdge.v1);
                                    safeArrEqDel(verticesOnFacet, multiEdge.v2);

                                    let verticesOnFacet2 = getUniqueVerticesOnFacet(facet2);
                                    safeArrEqDel(verticesOnFacet2, multiEdge.v1);
                                    safeArrEqDel(verticesOnFacet2, multiEdge.v2);
                                    let newEdge = new Edge(verticesOnFacet[0], verticesOnFacet2[0]);
                                    graph.addEdge(newEdge);
                                    console.log("added edge " + newEdge.print());
                                    let eIdxOne = eqIndexOf(facet, new Edge(verticesOnFacet[0], multiEdge.v1));
                                    let eIdxTwo = eqIndexOf(facet2, new Edge(multiEdge.v1, verticesOnFacet2[0]));
                                    let newFacet = [
                                        newEdge,
                                        facet[eIdxOne],
                                        facet2[eIdxTwo]];
                                    newFacets.push(newFacet);
                                    console.log("added facet " + printArr(newFacet));
                                    eIdxOne = eqIndexOf(facet, new Edge(verticesOnFacet[0], multiEdge.v2));
                                    eIdxTwo = eqIndexOf(facet2, new Edge(multiEdge.v2, verticesOnFacet2[0]));
                                    let newFacet2 = [
                                        newEdge,
                                        facet[eIdxOne],
                                        facet2[eIdxTwo]];
                                    newFacets.push(newFacet2);
                                    console.log("added facet " + printArr(newFacet2));
                                    newFacets.splice(newFacets.indexOf(facet), 1);
                                    newFacets.splice(newFacets.indexOf(facet2), 1);
                                    break;
                                }
                            }
                        }
                    } else {
                        // id == 0
                        if (eqIndexOf(noIdOccured, multiEdge) == -1) {
                            noIdOccured.push(multiEdge);
                        }
                    }
                }
            }
            console.log('after m-edge ' + multiEdge.print());
            $.each(newFacets, function (_index, facet) {
                console.log("Facet " + _index);
                let str = "";
                $.each(facet, function (_index, edge) {
                    str += edge.print() + " ";
                });
                console.log(str);
            });
        });

        $.each(noIdOccured, function (_index, edge) {
            if (eqIndexOf(graph.edges, edge) == -1) {
                graph.addEdge(edge);
                console.log("re-added original edge " + edge.print());
            }
        });

        redrawAll();
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
// Requires: graph is planar embedded, only one connected component
// TODO Handle one degree vertices
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
            let rightFacet = facetWalk(edge, true, statusEdges);
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
            let leftFacet = facetWalk(edge, false, statusEdges);
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
        $.each(facet, function (_index, edge) {
            facetStr += edge.print() + " ";
        });
        console.log(facetStr);
    });
    return facets;
}

// Follow a facet from a vertex back to itself, return edges on facet
function facetWalk(edge, rightDir, statusEdges) {
    let startVertex = edge.v1;
    console.log("startVertex " + startVertex.number + " v2 " + edge.v2.number);
    let facet = [];
    let prevVertex = edge.v1;
    let currentVertex = edge.v2;
    let statusEdgeVisited = false;
    while (!statusEdgeVisited) {
        let neighbours = graph.getAllNeighbours(currentVertex);
        let nextVertex = nextVertexAfter(neighbours, prevVertex, rightDir);

        let newEdge = new Edge(currentVertex, nextVertex);
        let edgeIndex = statusEdgeIndex(statusEdges, newEdge);

        let sameDirIndex = rightDir ? 1 : 2;
        let oppDirIndex = rightDir ? 2 : 1;
        if (statusEdges[edgeIndex][0].v1 == newEdge.v1) {
            statusEdgeVisited = statusEdges[edgeIndex][sameDirIndex];
        } else {
            statusEdgeVisited = statusEdges[edgeIndex][oppDirIndex];
        }

        if (!statusEdgeVisited) {
            facet.push(newEdge);

            if (statusEdges[edgeIndex][0].v1 == newEdge.v1) {
                statusEdges[edgeIndex][sameDirIndex] = true;
            } else {
                statusEdges[edgeIndex][oppDirIndex] = true;
            }
        }

        prevVertex = currentVertex;
        currentVertex = nextVertex;
    }
    return facet;
}

function getUniqueVerticesOnFacet(facet) {
    let verticesOnFacet = [];
    $.each(facet, function (_index, edge) {
        if (eqIndexOf(verticesOnFacet, edge.v1) == -1) {
            verticesOnFacet.push(edge.v1);
        }
        if (eqIndexOf(verticesOnFacet, edge.v2) == -1) {
            verticesOnFacet.push(edge.v2);
        }
    });
    return verticesOnFacet;
}

function eqIndexOf(array, element, withId = false) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].eq(element, withId)) {
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
        if (statusEdges[i][0].eq(edge)) {
            //console.log("found se");
            return i;
        }
    }
    console.log("no se");
    return -1;
}

function safeArrEqDel(arr, elem, withId = false) {
    let index = eqIndexOf(arr, elem, withId);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

/*
problem with:
{"vertices":[{"x":242,"y":121.80000305175781},{"x":534,"y":135.8000030517578},{"x":394,"y":259.8000030517578},{"x":255,"y":348.8000030517578},{"x":515,"y":339.8000030517578}],"edges":[{"v1":{"x":242,"y":121.80000305175781},"v2":{"x":534,"y":135.8000030517578}},{"v1":{"x":534,"y":135.8000030517578},"v2":{"x":394,"y":259.8000030517578}},{"v1":{"x":394,"y":259.8000030517578},"v2":{"x":515,"y":339.8000030517578}},{"v1":{"x":515,"y":339.8000030517578},"v2":{"x":255,"y":348.8000030517578}}]}
*/