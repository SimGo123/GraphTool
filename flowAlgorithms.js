class MaxFlowAlgo extends Algorithm {

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("graph is not planar embedded!");
            fulfilled = false;
        }
        $.each(graph.edges, function (_index, edge) {
            if (edge.weight == null) {
                alert("can't calculate max flow, " + edge.print() + " has no weight!");
                fulfilled = false;
                return false;
            }
        });
        if (graph.source == -1 || graph.target == -1) {
            alert("can't calculate max flow, source or target not set!");
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

        await super.pause("Check if S and T are on same facet", "Check if the source and the target are on the same facet. That would reduce complexity from O(nlogn) to O(n)");

        let facets = getAllFacets();
        let onSameFacet = false;
        facets.forEach((facet) => {
            let verticeNumbers = getUniqueVerticeNrsOnFacet(facet);
            if (verticeNumbers.includes(graph.source) && verticeNumbers.includes(graph.target)) {
                onSameFacet = true;
            }
        });

        let outerFacetPoss = tryGetOuterFacet();
        let onOuterFacet = outerFacetPoss.length == 1
            && getUniqueVerticeNrsOnFacet(outerFacetPoss[0]).includes(graph.source)
            && getUniqueVerticeNrsOnFacet(outerFacetPoss[0]).includes(graph.target);
        if (onSameFacet && onOuterFacet) {
            await super.pause("S and T are on the same facet", "Furthermore, they are both on the outer facet. So the fast approach can be used.");
            await this.fastApproach(outerFacetPoss[0]);
        } else if (onSameFacet) {
            await super.pause("S and T are on the same facet, but...", "... they are not on the outer facet. Normally, the fast method is used, but instead, we use the slow method.");
            this.slowApproach();
        } else {
            await super.pause("S and T are not on the same facet", "This means that there is no faster approach then the O(nlogn) one.");
            this.slowApproach();
        }
        //{"canvasWidth":986,"canvasHeight":538,"source":5,"target":7,"vertices":[{"x":233,"y":107,"nr":0},{"x":614,"y":139,"nr":1},{"x":638,"y":397,"nr":2},{"x":289,"y":398,"nr":3},{"x":464,"y":235,"nr":4},{"x":265,"y":229,"nr":5},{"x":453,"y":108,"nr":6},{"x":632,"y":259,"nr":7}],"edges":[{"v1nr":0,"v2nr":6,"weight":"4","orientation":"N"},{"v1nr":6,"v2nr":1,"weight":"5","orientation":"N"},{"v1nr":1,"v2nr":7,"weight":"8","orientation":"N"},{"v1nr":7,"v2nr":2,"weight":"5","orientation":"N"},{"v1nr":2,"v2nr":3,"weight":"0","orientation":"N"},{"v1nr":3,"v2nr":5,"weight":"1","orientation":"N"},{"v1nr":5,"v2nr":0,"weight":"8","orientation":"N"},{"v1nr":0,"v2nr":4,"weight":"2","orientation":"N"},{"v1nr":4,"v2nr":6,"weight":"2","orientation":"N"},{"v1nr":4,"v2nr":1,"weight":"9","orientation":"N"},{"v1nr":4,"v2nr":2,"weight":"1","orientation":"N"},{"v1nr":4,"v2nr":3,"weight":"3","orientation":"N"}]}

        super.onFinished();
    }

    async fastApproach(outerFacet) {
        await super.pause("Construct dual graph", "");
        let copyGraph = graph.getCopy();
        let [dualGraph, edgeEqualities, vertexFacets] = graph.getDualGraph();
        graph = dualGraph;
        this.drawTwoGraphs(copyGraph, graph);

        await super.pause("Split outer facet", "Split it into two parts, as if an edge were inserted in outer facet between S and T");
        let edgesToNewFacet = [];
        for (let i = 0; i < outerFacet.length; i++) {
            let edge = outerFacet[i];
            if (edgesToNewFacet.length == 0 && (edge.v1nr == copyGraph.source || edge.v1nr == copyGraph.target)) {
                edgesToNewFacet.push(edge);
            } else if (edgesToNewFacet.length > 0) {
                edgesToNewFacet.push(edge);
            }
            if (edgesToNewFacet.length != 0 && (edge.v2nr == copyGraph.source || edge.v2nr == copyGraph.target)) {
                break;
            }
        }
        let oldFacetVertexNr = -1;
        vertexFacets.forEach(vf => {
            if (getUniqueVerticeNrsOnFacet(vf.facet).join(',') == getUniqueVerticeNrsOnFacet(outerFacet).join(',')) {
                oldFacetVertexNr = vf.vertexNumber;
            }
        });
        let newFacetVertex = new Vertex(100, 100);
        graph.addVertex(newFacetVertex);
        for (let i = 0; i < edgesToNewFacet.length; i++) {
            for (let j = 0; j < edgeEqualities.length; j++) {
                if (edgesToNewFacet[i].eq(edgeEqualities[j].edge2)) {
                    let dualId = eqIndexOf(graph.edges, edgeEqualities[j].edge1, false, true);
                    if (graph.edges[dualId].v1nr == oldFacetVertexNr) {
                        graph.edges[dualId].v1nr = newFacetVertex.number;
                    } else if (graph.edges[dualId].v2nr == oldFacetVertexNr) {
                        graph.edges[dualId].v2nr = newFacetVertex.number;
                    }
                }
            }
        }
        this.drawTwoGraphs(copyGraph, graph);

        await super.pause("Calculate shortest distance between the new facet node and every other node",
            "Calculate distance from vertex " + newFacetVertex.number + " to every other vertex using Dijekstra.");
        let distances = getDijekstraResults(newFacetVertex);
        graph = copyGraph;
        this.drawTwoGraphs(dualGraph, graph);

        // Combine each facet with its dual vertex.
        // Facets can be identical, but have to be mapped to different vertices
        let facets = getAllFacets();
        let verticesForFacets = [];
        let visited = [];
        for (let i = 0; i < facets.length; i++) {
            let facet = facets[i];
            let vn = -1;
            for (let j = 0; j < vertexFacets.length; j++) {
                if (!visited.includes(j)) {
                    let vertFac = vertexFacets[j];
                    if (getUniqueVerticeNrsOnFacet(facet).join(',') == getUniqueVerticeNrsOnFacet(vertFac.facet).join(',')) {
                        visited.push(j);
                        vn = vertFac.vertexNumber;
                        break;
                    }
                }
            }
            verticesForFacets.push(vn);
        }

        facets.forEach((facet, i) => {
            let facetVertex = dualGraph.getVertexByNumber(verticesForFacets[i]);
            let dist = distances[eqIndexOf(dualGraph.vertices, facetVertex)];
            let facetCenter = getFacetCenter(facet);
            var ctx = fgCanvas.getContext("2d");
            ctx.fillStyle = "green";
            ctx.fillText(dist, facetCenter.x, facetCenter.y);
        });

        await super.pause("Set flow for each edge", "");
        graph.edges.forEach(e => {
            for (var i = 0; i < facets.length; i++) {
                let facet = facets[i];
                if (eqIndexOf(facet, e) != -1) {
                    for (var j = i + 1; j < facets.length; j++) {
                        let facet2 = facets[j];
                        if (eqIndexOf(facet2, e) != -1) {
                            let facetVertex1 = dualGraph.getVertexByNumber(verticesForFacets[i]);
                            let facetVertex2 = dualGraph.getVertexByNumber(verticesForFacets[j]);
                            if (eqIndexOf(edgesToNewFacet, e) != -1) {
                                if (facetVertex1.number == oldFacetVertexNr && eqIndexOf(edgesToNewFacet, e) != -1) {
                                    facetVertex1 = newFacetVertex;
                                }
                                if (facetVertex2.number == oldFacetVertexNr && eqIndexOf(edgesToNewFacet, e) != -1) {
                                    facetVertex2 = newFacetVertex;
                                }
                            }
                            let dist1 = distances[eqIndexOf(dualGraph.vertices, facetVertex1)];
                            let dist2 = distances[eqIndexOf(dualGraph.vertices, facetVertex2)];
                            let oldWeight = e.weight;
                            e.weight = (dist1 - dist2) + "/" + oldWeight;
                            if (dist1 > dist2) {
                                e.orientation = "N";
                            } else if (dist1 < dist2) {
                                e.orientation = "R";
                                e.weight = (-dist1 - -dist2) + "/" + oldWeight;
                            }
                            break;
                        }
                    }
                }
            }
        });
        redrawAll();

        let maxFlow = distances[dualGraph.getVertexIdByNumber(oldFacetVertexNr)];
        await super.pause("Result", "Max flow is " + maxFlow);
    }

    // TODO implement
    async slowApproach() {

    }

    drawTwoGraphs(backGraph, foreGraph) {
        clearFgCanvas();
        drawCanvasWalls();
        backGraph.draw(null, null, new ColorSet("#D3D3D3", "#D3D3D3", "red"));
        foreGraph.draw(selectedVertex, selectedEdge, new ColorSet("gray", "gray", "red"));
    }
}
