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
        super.numSteps = graph.sources.length * 2 + 11;
        let oldSources = graph.sources;
        let oldTargets = graph.targets;
        let originalGraph = graph.getCopy();
        await this.convertToBracketStructure(verticeNrsOnOuterFacet);
        let oldToNewVertexNrs = await this.addDummyEdges(verticeNrsOnOuterFacet);
        let helpGraph = await this.rdfsPaths();
        await this.convertPathsToOriginalStructure(helpGraph, originalGraph,
            oldSources, oldTargets, oldToNewVertexNrs);
        await super.pause("Result", "These are the disjunct si-ti paths");

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
        await super.pause("Convert to bracket structure (I)",
            "In order to find disjunct paths, we first have to convert the graph to a simpler bracket structure."
            + " A bracket structure has the advantage that we can easily find disjunct paths by right depth-first search."
            + "<br> To do this, we first determine the current bracket structure.");
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
        await super.pause("Current bracket structure",
            "Current bracket structure: " + bracketString
            + "<br>Now correct the bracket structure."
            + "<br>This is done by associating each pair of opening and closing brackets with one (s,t) pair");
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
        await super.pause("Add dummy edges",
            "For every source/target vertex, we add a new edge extending into the outer facet."
            + " The vertex at the end of the new edge becomes the new source/target."
            + " This is done for technical reasons.");
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
            await super.pause("Right depth first search from source " + i + " to target " + i,
                "We now perform a right depth-first search from each source to its target."
                + " Each edge on a path is oriented towards the target.");
            let copyDummyGraph = dummyHelpGraph.getCopy();
            let sourceVertex = dummyHelpGraph.getVertexByNumber(source);
            let targetVertex = dummyHelpGraph.getVertexByNumber(dummyHelpGraph.targets[i]);
            let visited = rightDepthFirstSearch(
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
        await super.pause("Remove all unoriented edges from help graph",
            "All unoriented edges weren't part of any s-t-path in the bracket structure."
            + " They therefore also aren't relevant for any s-t-path in the original graph.");
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
        await super.pause("Revert bracket structure", 
        "We use the original (s,t)-pairs again.");
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
                visited = rightDepthFirstSearch(
                    sourceVertex, targetVertex, copyDummyHelpGraph, false);
            } else {
                visited = rightDepthFirstSearch(
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
}

const BRACKETS = {
    OPEN: 0,
    CLOSE: 1
}