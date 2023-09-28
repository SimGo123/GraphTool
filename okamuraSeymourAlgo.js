class OkamuraSeymourAlgo extends Algorithm {

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("graph is not planar embedded!");
            fulfilled = false;
        }
        if (graph.sources.length != graph.targets.length) {
            alert("can't run okamura-seymour, different number of sources and targets!");
            fulfilled = false;
        }
        console.log('sources: ' + graph.sources.length);
        if (graph.sources.length == 0) {
            alert("can't run okamura-seymour, no sources / targets!");
            fulfilled = false;
        }
        return fulfilled;
    }

    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        await super.pause("Check if all sources and targets are on outer facet", "");

        let outerFacetPoss = tryGetOuterFacet(graph);
        let onOuterFacet = outerFacetPoss.length == 1;
        let verticeNrsOnOuterFacet = getUniqueVerticeNrsOnFacet(outerFacetPoss[0]);
        graph.sources.forEach(source => {
            if (!verticeNrsOnOuterFacet.includes(source)) {
                onOuterFacet = false;
            }
        });
        graph.targets.forEach(target => {
            if (!verticeNrsOnOuterFacet.includes(target)) {
                onOuterFacet = false;
            }
        });
        if (!onOuterFacet) {
            await super.pause("Not all sources and targets are on the outer facet", "");
            super.onFinished();
            return;
        }
        if (!await this.testEulerCondition()) {
            super.onFinished();
            return;
        }
        let oldSources = graph.sources;
        let oldTargets = graph.targets;
        let originalGraph = graph.getCopy();
        await this.convertToBracketStructure(verticeNrsOnOuterFacet);
        let oldToNewVertexNrs = await this.addDummyEdges(verticeNrsOnOuterFacet);
        let helpGraph = await this.rdfsPaths();
        await this.convertPathsToOriginalStructure(helpGraph, originalGraph,
            oldSources, oldTargets, oldToNewVertexNrs);

        super.onFinished();
    }

    async testEulerCondition() {
        await super.pause("Test for the euler condition",
            "For each vertex, calculate the capacity as the number of incident edges"
            + " and the density as 1 if the vertex is a source or target, 0 otherwise."
            + " Then calculate fcap({v}) = cap({v}) - dens({v})."
            + " If fcap({v}) < 0 or fcap({v}) is odd for any vertex v, the euler condition is not fulfilled.");
        for (let i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            let incidentEdges = graph.getIncidentEdges(vertex);
            let capacity = incidentEdges.length;
            let density = (graph.sources.includes(vertex.number)
                || graph.targets.includes(vertex.number)) ? 1 : 0;
            let fcap = capacity - density;
            if (fcap < 0 || fcap % 2 != 0) {
                let violatingColorSet = new ColorSet();
                violatingColorSet.addVertexColor(vertex.number, "red");
                redrawAll(violatingColorSet);
                await super.pause("Vertex " + vertex.number + " violates the euler condition",
                    "It has capacity " + capacity + " and density " + density + ", so fcap({" + vertex.number + "}) = " + fcap);
                return false;
            }
        }
        return true;
    }

    async convertToBracketStructure(outerFacetVertexNrs) {
        await super.pause("Get bracket structure", "");
        let bracketString = "";
        let bracketStructure = [];
        let visited = [];
        let bracketVertexNrs = [];
        outerFacetVertexNrs.forEach(vertexNr => {
            let sIndex = graph.sources.indexOf(vertexNr);
            let tIndex = graph.targets.indexOf(vertexNr);
            if (sIndex != -1) {
                if (!visited.includes(sIndex)) {
                    bracketString += "(S" + sIndex + " ";
                    bracketStructure.push(BRACKETS.OPEN);
                } else {
                    bracketString += "S" + sIndex + ") ";
                    bracketStructure.push(BRACKETS.CLOSE);

                }
                visited.push(sIndex);
                bracketVertexNrs.push(vertexNr);
            } else if (tIndex != -1) {
                if (!visited.includes(tIndex)) {
                    bracketString += "(T" + tIndex + " ";
                    bracketStructure.push(BRACKETS.OPEN);
                } else {
                    bracketString += "T" + tIndex + ") ";
                    bracketStructure.push(BRACKETS.CLOSE);
                }
                visited.push(tIndex);
                bracketVertexNrs.push(vertexNr);
            }
        });
        await super.pause("Current bracket structure", bracketString + "<br>Now correct it.");
        let correctedSources = [];
        let correctedTargets = new Array(graph.targets.length).fill(-1);
        let indexStack = [];
        let correctedBracketStr = "";
        bracketStructure.forEach((bracket, i) => {
            if (bracket == BRACKETS.OPEN) {
                correctedSources.push(bracketVertexNrs[i]);
                correctedBracketStr += "(S" + (correctedSources.length - 1) + " ";
                indexStack.push(correctedSources.length - 1);
            } else if (bracket == BRACKETS.CLOSE) {
                console.log('is', indexStack);
                let index = indexStack.pop();
                correctedTargets[index] = bracketVertexNrs[i];
                correctedBracketStr += "T" + index + ") ";
            }
        });
        graph.sources = correctedSources;
        graph.targets = correctedTargets;
        redrawAll();
        await super.pause("Corrected bracket structure", correctedBracketStr);
    }

    async addDummyEdges(outerFacetVertexNrs) {
        await super.pause("Add dummy edges", "");
        let oldToNewVertexNrs = {};
        for (let i = 0; i < outerFacetVertexNrs.length; i++) {
            let vertexNr = outerFacetVertexNrs[i];
            let sourceIndex = graph.sources.indexOf(vertexNr);
            let targetIndex = graph.targets.indexOf(vertexNr);
            let terminalNr = sourceIndex != -1 ? graph.sources[sourceIndex] : -1;
            terminalNr = targetIndex != -1 ? graph.targets[targetIndex] : terminalNr;
            if (terminalNr == -1) {
                continue;
            }
            let terminalVertex = graph.getVertexByNumber(terminalNr);
            let awayVec = this.getVectorAwayFrom(
                graph.getVertexByNumber(outerFacetVertexNrs[mod(i - 1, outerFacetVertexNrs.length)]),
                terminalVertex,
                graph.getVertexByNumber(outerFacetVertexNrs[mod(i + 1, outerFacetVertexNrs.length)]));
            let newVertex = new Vertex(
                terminalVertex.x + awayVec.x, terminalVertex.y + awayVec.y);
            let newEdge = new Edge(terminalNr, newVertex.number);
            graph.addVertex(newVertex);
            graph.addEdge(newEdge);
            if (sourceIndex != -1) {
                oldToNewVertexNrs[graph.sources[sourceIndex]] = newVertex.number;
                graph.sources[sourceIndex] = newVertex.number;
            }
            if (targetIndex != -1) {
                oldToNewVertexNrs[graph.targets[targetIndex]] = newVertex.number;
                graph.targets[targetIndex] = newVertex.number;
            }
        }
        redrawAll();
        return oldToNewVertexNrs;
    }

    async rdfsPaths() {
        let dummyHelpGraph = graph.getCopy();
        let helpGraph = graph.getCopy();
        let colors = ["green", "orange", "blue", "purple", "yellow", "pink"];
        let rdfsColorSet = new ColorSet();
        for (let i = 0; i < dummyHelpGraph.sources.length; i++) {
            let source = dummyHelpGraph.sources[i];
            await super.pause("Right depth first search from source " + i + " to target " + i, "");
            let copyDummyGraph = dummyHelpGraph.getCopy();
            let sourceVertex = dummyHelpGraph.getVertexByNumber(source);
            let targetVertex = dummyHelpGraph.getVertexByNumber(dummyHelpGraph.targets[i]);
            let visited = this.rightDepthFirstSearch(
                sourceVertex, targetVertex, copyDummyGraph, true);
            console.log('visited', visited);
            if (visited != null) {
                visited.forEach(edge => {
                    let index = eqIndexOf(dummyHelpGraph.edges, edge);
                    if (index != -1) {
                        dummyHelpGraph.edges.splice(index, 1);
                    } else {
                        console.error("edge not found in dummyHelpGraph");
                    }
                    let helpGraphEdge = helpGraph.getEdgeByStartEnd(edge.v1nr, edge.v2nr);
                    if (helpGraphEdge == null) {
                        console.error("helpGraphEdge == null");
                    }
                    helpGraphEdge.orientation = edge.orientation;
                    rdfsColorSet.addEdgeColor(helpGraphEdge, colors[i % colors.length]);
                });
            } else {
                console.error("visited == null");
            }
            redrawAll(rdfsColorSet, helpGraph);
        }
        await super.pause("Remove unoriented edges from help graph", "");
        let onlyOrientedEdges = helpGraph.edges.filter(e => e.orientation != EdgeOrientation.UNDIRECTED);
        helpGraph.edges = onlyOrientedEdges;
        redrawAll(rdfsColorSet, helpGraph);

        return helpGraph;
    }

    async convertPathsToOriginalStructure(helpGraph, originalGraph,
        oldSources, oldTargets, oldToNewVertexNrs) {
        let newToOldVertexNrs = {};
        for (let key in oldToNewVertexNrs) {
            newToOldVertexNrs[oldToNewVertexNrs[key]] = key;
        }
        await super.pause("Revert bracket structure", "");
        let newOldSources = [];
        let newOldTargets = [];
        oldSources.forEach(source => {
            let newVertexNr = oldToNewVertexNrs[source];
            newOldSources.push(newVertexNr);
        });
        oldTargets.forEach(target => {
            let newVertexNr = oldToNewVertexNrs[target];
            newOldTargets.push(newVertexNr);
        });
        helpGraph.sources = newOldSources;
        helpGraph.targets = newOldTargets;
        graph = helpGraph;

        redrawAll(new ColorSet(), helpGraph);

        await super.pause("Start right depth-first search for the original (s,t)-paths",
            "");
        let dummyHelpGraph = helpGraph.getCopy();
        let rdfsColorSet = new ColorSet();
        let colors = ["green", "orange", "blue", "purple", "yellow", "pink"];
        for (let i = 0; i < dummyHelpGraph.sources.length; i++) {
            let source = dummyHelpGraph.sources[i];
            await super.pause("Right depth first search from source " + i + " to target " + i, "");
            let copyDummyHelpGraph = dummyHelpGraph.getCopy();
            let sourceVertex = dummyHelpGraph.getVertexByNumber(source);
            let targetVertex = dummyHelpGraph.getVertexByNumber(dummyHelpGraph.targets[i]);
            let visited = null;
            if (copyDummyHelpGraph.getIncidentEdges(sourceVertex, true).length > 0) {
                visited = this.rightDepthFirstSearch(
                    sourceVertex, targetVertex, copyDummyHelpGraph, false);
            } else {
                visited = this.rightDepthFirstSearch(
                    targetVertex, sourceVertex, copyDummyHelpGraph, false);
            }
            console.log('visited', visited);
            if (visited != null) {
                visited.forEach(edge => {
                    let index = eqIndexOf(dummyHelpGraph.edges, edge);
                    if (index != -1) {
                        dummyHelpGraph.edges.splice(index, 1);
                    } else {
                        console.error("edge not found in dummyHelpGraph");
                    }
                    let helpGraphEdge = helpGraph.getEdgeByStartEnd(edge.v1nr, edge.v2nr);
                    if (helpGraphEdge == null) {
                        console.error("helpGraphEdge == null");
                    }
                    rdfsColorSet.addEdgeColor(helpGraphEdge, colors[i % colors.length]);
                    // The original graph doesn't contain dummy edges -> check for it
                    let is1DummyVertex = newToOldVertexNrs.hasOwnProperty(edge.v1nr);
                    let is2DummyVertex = newToOldVertexNrs.hasOwnProperty(edge.v2nr);
                    if (!is1DummyVertex && !is2DummyVertex) {
                        let graphEdge = originalGraph.getEdgeByStartEnd(edge.v1nr, edge.v2nr);
                        rdfsColorSet.addEdgeColor(graphEdge, colors[i % colors.length]);
                    }
                });
            } else {
                console.error("visited == null");
            }
            redrawAll(rdfsColorSet, helpGraph);
        }
        await super.pause("Convert graph back to original structure", "");
        graph = originalGraph;
        redrawAll(rdfsColorSet);
    }

    getVectorAwayFrom(vertexLeft, vertex, vertexRight) {
        console.log('vertexLeft', vertexLeft, 'vertex', vertex, 'vertexRight', vertexRight);
        let leftVec = new Point(vertexLeft.x - vertex.x, vertexLeft.y - vertex.y);
        leftVec = changeVectorLength(leftVec, 1);
        let rightVec = new Point(vertexRight.x - vertex.x, vertexRight.y - vertex.y);
        rightVec = changeVectorLength(rightVec, 1);
        // Vector addition
        let awayVec = new Point(leftVec.x + rightVec.x, leftVec.y + rightVec.y);
        awayVec.x *= -1;
        awayVec.y *= -1;
        return changeVectorLength(awayVec, 50);
    }

    rightDepthFirstSearch(startVertex, endVertex, runGraph, orientUnorientedEdges) {
        console.log("rightDepthFirstSearch");
        runGraph.indexAllEdges();
        let visited = [];
        let stack = [];
        let incidentEdges = runGraph.getIncidentEdges(startVertex, true);
        if (incidentEdges.length == 0) {
            console.error("incidentEdges.length == 0");
            console.log('startVertex', startVertex);
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
                        console.log('adding ' + visitedEdge.prt() + ' to result');
                        lastConfirmed = visitedEdge.v2nr;
                    } else if (visitedEdge.v2nr == lastConfirmed) {
                        result.push(visitedEdge);
                        console.log('adding ' + visitedEdge.prt() + ' to result');
                        lastConfirmed = visitedEdge.v1nr;
                    }
                    if (lastConfirmed == startVertex.number) {
                        console.log('breaking');
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
                if (eqIndexOf(visited, e) == -1) {
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

    getEdgesRightOfEntryEdge(vertex, entryEdge, runGraph) {
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
}

const BRACKETS = {
    OPEN: 0,
    CLOSE: 1
}