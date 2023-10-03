class WeightMaxMatchingAlgo extends Algorithm {

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("Graph is not planar embedded!");
            fulfilled = false;
        }
        $.each(graph.edges, function (_index, edge) {
            if (edge.weight == null) {
                alert("can't calculate weight max matching, " + edge.print() + " has no weight!");
                fulfilled = false;
                return false;
            }
        });
        return fulfilled;
    }

    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        await super.pause("Divide the graph",
            "Divide the graph using the Planar Separator algorithm."
            + "<br> If a subgraph has <= 5 vertices, calculate the local weight max matching using brute force."
            + "<br> Finally, unite the weight max matchings found in the subgraphs.");
        let [maxWeightEdges, separators] = await this.divide(graph);
        let stepColorSet = new ColorSet();
        maxWeightEdges.forEach(edge => {
            stepColorSet.addEdgeColor(edge, "red");
        });
        console.log('S=( ');
        printArr(separators);
        console.log(')');
        separators.forEach(separatorVertex => {
            stepColorSet.addVertexColor(separatorVertex.number, "green");
        });
        redrawAll(stepColorSet);
        this.numSteps = this.currentStep + separators.length + 1;
        await super.pause("Optimal matchings have been calculated in subgraphs", "");

        let gApostrophe = graph.getCopy();
        separators.forEach(function (separatorVertex) {
            gApostrophe.deleteVertex(separatorVertex);
        });

        while (separators.length > 0) {
            // Choose v ∈ S.
            let v = separators.pop();
            console.log('We chose v=' + v.print());
            // Find alternating path P in G′ + v with endpoint v and w(P − M′) − w(P ∩ M′) maximal
            let gApostropheWithV = graph.getSubgraph(gApostrophe.vertices.concat([v]));
            let path = this.findMaxWay(maxWeightEdges, gApostropheWithV, v);
            console.log('path=', path);
            // If P is increasing, replace M′ with M′△P.
            if (path != null && this.wayIsIncreasing(path.edges, maxWeightEdges)) {
                maxWeightEdges = this.getSymmDiff(path.edges, maxWeightEdges);
            }

            let loopColorSet = new ColorSet();
            separators.forEach(separatorVertex => {
                loopColorSet.addVertexColor(separatorVertex.number, "green");
            });
            maxWeightEdges.forEach(edge => {
                loopColorSet.addEdgeColor(edge, "red");
            });
            if (path != null) {
                path.edges.forEach(edge => {
                    if (eqIndexOf(maxWeightEdges, edge) != -1) {
                        loopColorSet.addEdgeColor(edge, "purple");
                    } else {
                        loopColorSet.addEdgeColor(edge, "blue");
                    }
                });
            }
            loopColorSet.addVertexColor(v.number, "red");
            globalColorSet = loopColorSet;
            redrawAll(loopColorSet);
            await super.pause("Unite the weight max matchings in subgraphs",
                "The weight max matching is optimal in each subgraph."
                + "<br> Now, we unite the weight max matching in the subgraphs."
                + "<br> We took vertex " + v.number + " (red) from the separator set."
                + "<br> We looked for an increasing alternating path P (blue, edges also in matching violet)"
                + " in G' + v with end point " + v.number + "."
                + "<br> If P exists, we replace the current matching M' with M'△P.");
            gApostrophe.addVertex(v);
        }

        console.log('maxWeightEdges=(');
        printArr(maxWeightEdges);
        console.log(')');
        let resColorSet = new ColorSet();
        graph.edges.forEach(function (edge) {
            if (eqIndexOf(maxWeightEdges, edge) != -1) {
                edge.color = "red";
                resColorSet.addEdgeColor(edge, "red");
            }
        });
        redrawAll(resColorSet);

        let weight = 0;
        maxWeightEdges.forEach(function (edge) {
            weight += edge.weight;
        });
        super.onFinished(true, "The weight max matching has weight " + weight);
    }

    async divide(toDivideGraph) {
        console.log('currJson', getCurrJSON(toDivideGraph));
        const N = toDivideGraph.vertices.length;
        if (N <= 5) {
            let maxWeightEdges = this.bruteForce(toDivideGraph);
            let bfMaxMatchingColorSet = new ColorSet();
            maxWeightEdges.forEach(edge => {
                bfMaxMatchingColorSet.addEdgeColor(edge, "red");
            });
            drawTwoGraphs(graph, toDivideGraph, stdBackColorSet, bfMaxMatchingColorSet);
            await super.pause("Subgraph is small enough",
                "The graph has <= 5 vertices and therefore is small enough."
                + "<br> The weight max matching for this subgraph has been calculated using brute force.");

            return [maxWeightEdges, []];
        }

        let planarSeparatorAlgo = new PlanarSeparatorAlgo();
        planarSeparatorAlgo.shouldContinue = true;
        planarSeparatorAlgo.runComplete = true;
        planarSeparatorAlgo.isSubAlgo = true;
        let graphCopy = graph.getCopy();
        graph = toDivideGraph.getCopy();
        let result = await planarSeparatorAlgo.run();
        graph = graphCopy;
        console.log('result=', result);
        if (result == null) {
            alert("No separator found, can't calculate weight max matching");
            super.onFinished();
            return;
        }
        let [v1, separator, v2] = result;
        console.log('v1', v1, "separator", separator, "v2", v2);

        let planSepColorSet = new ColorSet();
        v1.forEach(vertex => {
            planSepColorSet.addVertexColor(vertex.number, "red");
        });
        separator.forEach(vertex => {
            planSepColorSet.addVertexColor(vertex.number, "green");
        });
        v2.forEach(vertex => {
            planSepColorSet.addVertexColor(vertex.number, "blue");
        });
        drawTwoGraphs(graph, toDivideGraph, stdBackColorSet, planSepColorSet);
        await super.pause("Divide the graph further",
            "This subgraph isn't small enough yet."
            + "<br> The Planar Separator algorithm has found a separator (green) between V1 (blue) and V2 (red).");

        let v1Graph = toDivideGraph.getSubgraph(v1);
        let v2Graph = toDivideGraph.getSubgraph(v2);

        let res1 = await this.divide(v1Graph);
        let res2 = await this.divide(v2Graph);
        let maxWeightEdges = res1[0].concat(res2[0]);
        let separators = res1[1].concat(res2[1]).concat(separator);
        return [maxWeightEdges, separators];
    }

    bruteForce(runGraph) {
        let includeEdge = [];
        for (var i = 0; i < runGraph.edges.length; i++) {
            includeEdge.push(false);
        }
        let maxWeight = 0;
        let maxWeightEdges = [];
        let lastTrueIdx = -1;
        while (includeEdge != null) {
            // Valid if no two edges to same vertex
            let valid = true;
            for (var i = 0; i < runGraph.edges.length; i++) {
                if (includeEdge[i]) {
                    let edge = runGraph.edges[i];
                    let v1nr = edge.v1nr;
                    let v2nr = edge.v2nr;
                    for (var j = i + 1; j < runGraph.edges.length; j++) {
                        if (includeEdge[j]) {
                            let edge2 = runGraph.edges[j];
                            if (edge2.v1nr == v1nr || edge2.v1nr == v2nr || edge2.v2nr == v1nr || edge2.v2nr == v2nr) {
                                valid = false;
                            }
                        }
                    }
                }
            }
            if (valid) {
                let weight = 0;
                let edges = [];
                for (var i = 0; i < runGraph.edges.length; i++) {
                    if (includeEdge[i]) {
                        weight += runGraph.edges[i].weight;
                        edges.push(runGraph.edges[i]);
                    }
                }
                if (weight > maxWeight) {
                    maxWeight = weight;
                    maxWeightEdges = edges;
                }
            }

            includeEdge = nextBruteForceIter(includeEdge);
            if (includeEdge != null) {
                for (let i = includeEdge.length - 1; i >= 0; i--) {
                    if (includeEdge[i]) {
                        if (lastTrueIdx != i) {
                            console.log(i + '/' + includeEdge.length);
                        }
                        lastTrueIdx = i;
                        break;
                    }
                }
            }
        }
        $.each(maxWeightEdges, function (_index, edge) {
            edge.color = "red";
        });
        redrawAll();
        return maxWeightEdges;
    }

    // Finde alternierenden Weg P in G′ + v mit Endpunkt v mit w(P − M′) − w(P ∩ M′) maximal.
    /**
     * 
     * @param {Edge[]} weightMaxEdges 
     * @param {Graph} gApostropheWithV 
     * @param {Vertex} v Start vertex
     * @returns {AlternatingPath} May be null
     */
    findMaxWay(weightMaxEdges, gApostropheWithV, v) {
        let isVmatched = this.isVertexMatched(v, weightMaxEdges);
        if (isVmatched) {
            console.log('v is matched');
            // V is matched -> P has to take matched edge
            return this.findWayRec(weightMaxEdges, gApostropheWithV,
                new AlternatingPath([], 0, v, v), false);
        }

        return this.findWayRec(weightMaxEdges, gApostropheWithV,
            new AlternatingPath([], 0, v, v), true);
    }

    findWayRec(weightMaxEdges, runGraph, currPath, lastEdgeMatched) {
        let v = currPath.end;
        let incidentEdges = runGraph.getIncidentEdges(v);
        let considerableEdges = [];
        // Alternating condition
        incidentEdges.forEach(edge => {
            let edgeMatched = eqIndexOf(weightMaxEdges, edge) != -1;
            if (edgeMatched != lastEdgeMatched) {
                considerableEdges.push(edge);
            }
        });
        // No edges left to pick
        if (considerableEdges.length == 0) {
            if (currPath.edges.length == 0) {
                return null;
            }
            let lastPathEdge = currPath.edges[currPath.edges.length - 1];
            let lastPathEdgeMatched = eqIndexOf(weightMaxEdges, lastPathEdge) != -1;
            let isEndMatched = this.isVertexMatched(currPath.end, weightMaxEdges);
            if (!isEndMatched || isEndMatched && lastPathEdgeMatched) {
                if (currPath.end.number == currPath.start.number) {
                    let firstPathEdge = currPath.edges[0];
                    let firstPathEdgeMatched = eqIndexOf(weightMaxEdges, firstPathEdge) != -1;
                    if (firstPathEdgeMatched == lastPathEdgeMatched) {
                        return null;
                    }
                }
                currPath.valid = true;
            }
            return currPath;
        }

        let maxPath = null;
        let maxWeight = 0;
        for (let i = 0; i < considerableEdges.length; i++) {
            let edge = considerableEdges[i];
            let newWay = currPath.edges.concat([edge]);
            let newWeight = currPath.weight + edge.weight;
            let newVNr = edge.v1nr == v.number ? edge.v2nr : edge.v1nr;
            let newV = runGraph.getVertexByNumber(newVNr);
            if (eqIndexOf(currPath.edges, edge) == -1) {
                let res = this.findWayRec(weightMaxEdges, runGraph,
                    new AlternatingPath(newWay, newWeight, currPath.start, newV), !lastEdgeMatched);
                if (res != null && res.valid
                    && this.getRelevantWeight(res.edges, weightMaxEdges) > maxWeight) {
                    maxPath = res;
                    maxWeight = this.getRelevantWeight(res.edges, weightMaxEdges);
                }
            }
        }
        if (currPath.weight > maxWeight && currPath.valid) {
            return currPath;
        }
        return maxPath;
    }

    wayIsIncreasing(path, weightMaxEdges) {
        return this.getRelevantWeight(path, weightMaxEdges) > 0;
    }

    isVertexMatched(vertex, weightMaxEdges) {
        for (var i = 0; i < weightMaxEdges.length; i++) {
            let edge = weightMaxEdges[i];
            if (edge.v1nr == vertex.number || edge.v2nr == vertex.number) {
                return true;
            }
        }
        return false;
    }

    // Calculate w(M′ /_\ P) − w(M′) = w(P − M′) − w(P ∩ M′)
    getRelevantWeight(path, weightMaxEdges) {
        let symmDiff = this.getSymmDiff(path, weightMaxEdges);
        let symmDiffWeight = 0;
        symmDiff.forEach(function (edge) {
            symmDiffWeight += edge.weight;
        });
        let weightMaxEdgesWeight = 0;
        weightMaxEdges.forEach(function (edge) {
            weightMaxEdgesWeight += edge.weight;
        });
        return symmDiffWeight - weightMaxEdgesWeight;
    }

    getSymmDiff(edges1, edges2) {
        let symmDiff = [];
        edges1.forEach(function (edge) {
            if (eqIndexOf(edges2, edge) == -1) {
                symmDiff.push(edge);
            }
        });
        edges2.forEach(function (edge) {
            if (eqIndexOf(edges1, edge) == -1) {
                symmDiff.push(edge);
            }
        });
        return symmDiff;
    }
}

class AlternatingPath {
    constructor(edges, weight, start, end) {
        this.edges = edges;
        this.weight = weight;
        this.start = start;
        this.end = end;
        this.valid = false;
    }
}
