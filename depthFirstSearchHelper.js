/**
 * 
 * @param {Vertex} vertex 
 * @param {Graph} runGraph 
 * @param {boolean} usingOrientation 
 * @returns {Vertex[]}
 */
function depthFirstSearch(vertex, runGraph, usingOrientation = false) {
    console.log("depthFirstSearch");
    let visited = [];
    let stack = [];
    stack.push(vertex);
    while (stack.length > 0) {
        let vertex = stack.pop();
        if (eqIndexOf(visited, vertex) == -1) {
            visited.push(vertex);
            let neighbours = runGraph.getAllNeighbours(vertex, usingOrientation);
            $.each(neighbours, function (_index, neighbour) {
                stack.push(neighbour);
            });
        }
    }
    return visited;
}

function rightDepthFirstSearch(startVertex, endVertex, runGraph, orientUnorientedEdges, doIndex = true) {
    console.log("rightDepthFirstSearch");
    if (doIndex) {
        runGraph.indexAllEdges();
    }
    let visited = [];
    let stack = [];
    // Take first incident edge
    let incidentEdges = runGraph.getIncidentEdges(startVertex, true);
    if (incidentEdges.length == 0) {
        console.error("incidentEdges.length == 0");
        return;
    }
    let incidentEdge = incidentEdges[0];
    if (incidentEdge.v1nr == startVertex.number) {
        incidentEdge.orientation = EdgeOrientation.NORMAL;
    } else {
        incidentEdge.orientation = EdgeOrientation.REVERSED;
    }
    stack.push(incidentEdge);
    while (stack.length > 0) {
        let entryEdge = stack.pop();
        console.log('visiting ' + entryEdge.prt());
        visited.push(entryEdge);
        let vertex = null;
        if (entryEdge.orientation == EdgeOrientation.NORMAL) {
            vertex = runGraph.getVertexByNumber(entryEdge.v2nr);
        } else if (entryEdge.orientation == EdgeOrientation.REVERSED) {
            vertex = runGraph.getVertexByNumber(entryEdge.v1nr);
        }
        if (vertex == null) {
            console.error("vertex == null");
            return;
        }
        if (vertex.number == endVertex.number) {
            console.log('Found target');
            // Reconstruct path
            let result = [];
            let lastConfirmed = endVertex.number;
            for (let i = visited.length - 1; i >= 0; i--) {
                let visitedEdge = visited[i];
                if (visitedEdge.getEndVertexNr() != lastConfirmed) {
                    continue;
                }
                if (visitedEdge.v1nr == lastConfirmed) {
                    result.push(visitedEdge);
                    lastConfirmed = visitedEdge.v2nr;
                } else if (visitedEdge.v2nr == lastConfirmed) {
                    result.push(visitedEdge);
                    lastConfirmed = visitedEdge.v1nr;
                }
                if (lastConfirmed == startVertex.number) {
                    break;
                }
            }
            return result;
        }
        if (entryEdge == null) {
            console.error("entryEdge == null");
            return;
        }
        let edgesRightOfEntryEdge = this.getEdgesRightOfEntryEdge(vertex, entryEdge, runGraph);
        // Reverse order because stack is LIFO
        edgesRightOfEntryEdge.reverse();
        edgesRightOfEntryEdge.forEach(e => {
            if (eqIndexOf(visited, e, true, true) == -1) {
                if (orientUnorientedEdges) {
                    if (e.v1nr == vertex.number) {
                        e.orientation = EdgeOrientation.NORMAL;
                    } else {
                        e.orientation = EdgeOrientation.REVERSED;
                    }
                }
                stack.push(e);
            }
        });
    }
    return null;
}

function getEdgesRightOfEntryEdge(vertex, entryEdge, runGraph = graph) {
    let entryEdgeAngle = getAngle(vertex, runGraph.getOtherVertex(entryEdge, vertex));
    let incidentEdges = runGraph.getIncidentEdges(vertex, true);
    incidentEdges.sort((e1, e2) => {
        let otherVertex1 = runGraph.getOtherVertex(e1, vertex);
        let otherVertex2 = runGraph.getOtherVertex(e2, vertex);
        let angle1 = getAngle(vertex, otherVertex1);
        let angle2 = getAngle(vertex, otherVertex2);
        return angle2 - angle1;
    });
    let edgesRightOfEntryEdge = [];
    let nextSmallerEdgeIndex = -1;
    for (let i = 0; i < incidentEdges.length; i++) {
        let currAngle = getAngle(vertex, runGraph.getOtherVertex(incidentEdges[i], vertex));
        if (currAngle < entryEdgeAngle) {
            nextSmallerEdgeIndex = i;
            break;
        }
    }
    if (nextSmallerEdgeIndex == -1) {
        nextSmallerEdgeIndex = 0;
    }
    for (let i = nextSmallerEdgeIndex; i < incidentEdges.length; i++) {
        edgesRightOfEntryEdge.push(incidentEdges[i]);
    }
    for (let i = 0; i < nextSmallerEdgeIndex; i++) {
        edgesRightOfEntryEdge.push(incidentEdges[i]);
    }
    return edgesRightOfEntryEdge;
}