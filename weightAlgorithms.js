class WeightMaxMatchingAlgo extends Algorithm {

    async run() {
        super.numSteps = "X";

        // if (!this.preconditionsCheck()) {
        //     super.onFinished();
        //     return;
        // }

        // const N = graph.vertices.length;
        // await super.pause("Check if n <= 5", "If n <= 5, use brute force");
        // if (N <= 5) {
        //     await super.pause("Brute force", "Brute force in O(1)");
        //     let maxWeightEdges = this.bruteForce(graph);

        //     super.onFinished();
        //     return maxWeightEdges;
        // }

        // await super.pause("Calculate planar separator", "Calculate planar separator");
        // let planarSeparatorAlgo = new PlanarSeparatorAlgo();
        // planarSeparatorAlgo.shouldContinue = true;
        // planarSeparatorAlgo.runComplete = true;
        // planarSeparatorAlgo.isSubAlgo = true;
        // let result = await planarSeparatorAlgo.run(graph.getCopy());
        // if (result == null) {
        //     alert("No separator found, can't calculate weight max matching");
        //     super.onFinished();
        //     return;
        // }
        // console.log('result=' + result);
        // let [v1, separator, v2] = result;
        // console.log('v1=' + printArr(v1) + ' separator=' + printArr(separator) + ' v2=' + printArr(v2));

        let [maxWeightEdges, separators] = await this.divide(graph);
        console.log('S=' + printArr(separators));

        let gApostrophe = graph.getCopy();
        separators.forEach(function (separatorVertex) {
            gApostrophe.deleteVertex(separatorVertex);
        });

        while (separators.length > 0) {
            // Wähle v ∈ S.
            let v = separators.pop();
            console.log('We chose v=' + v.print());
            // Finde alternierenden Weg P in G′ + v mit Endpunkt v mit w (P − M′) − w (P ∩ M′) maximal.
            let gApostropheWithV = graph.getCopy();
            for (let i = 1; i < separators.length; i++) {
                gApostropheWithV.deleteVertex(separators[i]);
            }
            let way = this.findMaxWay(maxWeightEdges, gApostropheWithV, v);
            console.log('way=' + printArr(way));
            // Falls P erhöhend, ersetze M′ durch M′ /_\ P.
            if (this.wayIsIncreasing(way, maxWeightEdges)) {
                maxWeightEdges = this.getSymmDiff(way, maxWeightEdges);
            }
            // Lösche v aus S. (oben ^)
            // Ersetze G′ durch G′ + v .
            gApostrophe.addVertex(v);
        }

        console.log('maxWeightEdges=' + printArr(maxWeightEdges));
        graph.edges.forEach(function (edge) {
            if (eqIndexOf(maxWeightEdges, edge) != -1) {
                edge.color = "red";
            }
        });
        redrawAll();

        super.onFinished();
    }

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

    async divide(toDivideGraph) {
        const N = toDivideGraph.vertices.length;
        if (N <= 5) {
            let maxWeightEdges = this.bruteForce(toDivideGraph);
            console.log('divEnd ' + printArr(toDivideGraph.vertices));

            return [maxWeightEdges, []];
        }

        let planarSeparatorAlgo = new PlanarSeparatorAlgo();
        planarSeparatorAlgo.shouldContinue = true;
        planarSeparatorAlgo.runComplete = true;
        planarSeparatorAlgo.isSubAlgo = true;
        let result = await planarSeparatorAlgo.run(toDivideGraph);
        if (result == null) {
            alert("No separator found, can't calculate weight max matching");
            super.onFinished();
            return;
        }
        let [v1, separator, v2] = result;
        console.log('v1=' + printArr(v1) + ' separator=' + printArr(separator) + ' v2=' + printArr(v2));

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
        }
        $.each(maxWeightEdges, function (_index, edge) {
            edge.color = "red";
        });
        redrawAll();
        return maxWeightEdges;
    }

    // Finde alternierenden Weg P in G′ + v mit Endpunkt v mit w(P − M′) − w(P ∩ M′) maximal.
    findMaxWay(weightMaxEdges, gApostropheWithV, v) {
        let res1 = this.findWayRec(weightMaxEdges, gApostropheWithV, v, [], 0, false);
        let res2 = this.findWayRec(weightMaxEdges, gApostropheWithV, v, [], 0, true);
        console.log('r1 ' + res1 + ' r2 ' + res2);
        if (res1[1] > res2[1]) {
            return res1[0];
        } else {
            return res2[0];
        }
    }

    findWayRec(weightMaxEdges, graph, v, currWay, currWeight, lastEdgeMatched) {
        let incidentEdges = graph.getIncidentEdges(v);
        let considerableEdges = [];
        incidentEdges.forEach(function (edge) {
            let edgeMatched = eqIndexOf(weightMaxEdges, edge) != -1;
            if (edgeMatched != lastEdgeMatched) {
                considerableEdges.push(edge);
            }
        });
        if (considerableEdges.length == 0) {
            return [currWay, currWeight];
        } else {
            let maxWay = null;
            let maxWeight = 0;
            for (let i = 0; i < considerableEdges.length; i++) {
                let edge = considerableEdges[i];
                let newWay = currWay.concat([edge]);
                let newWeight = currWeight + edge.weight;
                let newV = edge.v1nr == v ? edge.v2nr : edge.v1nr;
                let res = this.findWayRec(weightMaxEdges, graph, newV, newWay, newWeight, !lastEdgeMatched);
                if (this.getRelevantWeight(res[0], weightMaxEdges) > maxWeight) {
                    maxWay = res[0];
                    maxWeight = this.getRelevantWeight(res[0], weightMaxEdges);
                }
            }
            if (currWeight > maxWeight) {
                maxWay = currWay;
                maxWeight = currWeight;
            }
            return [maxWay, maxWeight];
        }
    }

    wayIsIncreasing(path, weightMaxEdges) {
        return this.getRelevantWeight(path, weightMaxEdges) > 0;
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

class MixedMaxCutAlgo extends Algorithm {
    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        let originalGraph = graph.getCopy();

        await super.pause("Triangulate the graph", "Triangulate the graph, new edges get weight 0");
        let triangulationAlgo = new TriangulationAlgo();
        triangulationAlgo.shouldContinue = true;
        triangulationAlgo.runComplete = true;
        triangulationAlgo.isSubAlgo = true;
        await triangulationAlgo.run();
        for (var i = 0; i < graph.edges.length; i++) {
            if (graph.edges[i].weight == null) {
                graph.edges[i].weight = 0;
            }
        }
        let triangulatedGraph = graph.getCopy();
        redrawAll();

        await super.pause("Calculate dual graph", "Build the dual graph from the current graph, keep edges");
        let [dualGraph, edgeEqualities] = graph.getDualGraph();
        let dualCopy = dualGraph.getCopy();
        graph = dualGraph;
        redrawAll();

        await super.pause("Out of one vertex, make three", "Replace every vertex by three interconnected (w=0) vertices");
        let vertexEqualities = this.oneVertexToThree();
        let modifiedGraph = graph.getCopy();

        await super.pause("Calculate weight min. 1-factor",
            "C in the original graph is a cut <-> C* in the dual graph is an even set"
            + "C' in current graph is weight max. 2-factor <-> E'-C' is weight min. 1-factor");

        await super.pause("Calculate weight min. 1-factor",
            "First, w'(e) = -w(e), so that we can calc. a weight max. 1-factor");
        for (var i = 0; i < graph.edges.length; i++) {
            graph.edges[i].weight = -graph.edges[i].weight;
        }
        redrawAll();

        const W = graph.vertices.length * Math.max(...graph.edges.map(e => Math.abs(e.weight))) + 1;
        await super.pause("Calculate weight min. 1-factor",
            "Next, w''(e) = W + w'(e), with W > |V| * max(|w(e)|) = " + (W - 1)
            + ". This leads to every matching having the max. amount of edges, therefore being perfect");
        for (var i = 0; i < graph.edges.length; i++) {
            graph.edges[i].weight += W;
        }
        redrawAll();

        await super.pause("Calculate weight min. 1-factor",
            "Run max matching algorithm to get a weight max. 1-factor M for w'' in O(n^(3/2))");
        let weightMaxMatchAlgo = new WeightMaxMatchingAlgo();
        weightMaxMatchAlgo.shouldContinue = true;
        weightMaxMatchAlgo.runComplete = true;
        weightMaxMatchAlgo.isSubAlgo = true;
        // TODO await weightMaxMatchAlgo.run();
        // console.log('Starting brute force...');
        // let weightMaxEdges = weightMaxMatchAlgo.bruteForce(graph);
        // let wmeString = "";
        // weightMaxEdges.forEach(function(edge) {
        //     wmeString += edge.print() + " ";
        // });
        // console.log(wmeString);
        // console.log('...finished brute force');

        // Weight max edges for the mixed-max-graph
        // TODO Delte when non-brute-force weight max matching is implemented
        let weightMaxEdges = [];
        weightMaxEdges.push(new Edge(19, 25));
        weightMaxEdges.push(new Edge(13, 26));
        weightMaxEdges.push(new Edge(22, 27));
        weightMaxEdges.push(new Edge(16, 28));
        weightMaxEdges.push(new Edge(11, 12));
        weightMaxEdges.push(new Edge(14, 15));
        weightMaxEdges.push(new Edge(17, 18));
        weightMaxEdges.push(new Edge(20, 21));
        weightMaxEdges.push(new Edge(23, 24));
        for (let i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(weightMaxEdges, graph.edges[i]) != -1) {
                graph.edges[i].color = "red";
            }
        }
        redrawAll();

        await super.pause("Calculate weight max. 2-factor in G'",
            "C' = E' - M is a weight max. 2-factor in G'");
        graph = modifiedGraph;
        let cApostrophe = [];
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(weightMaxEdges, graph.edges[i]) == -1) {
                cApostrophe.push(graph.edges[i]);
                graph.edges[i].color = "green";
            }
        }
        redrawAll();

        let cApostropheEq = [];
        $.each(cApostrophe, function (_index, edge) {
            let v1nr = -1;
            let v2nr = -1;
            $.each(vertexEqualities, function (_index, vertexEquality) {
                if (vertexEquality.vertexNumber1 == edge.v1nr) {
                    v1nr = vertexEquality.vertexNumber2;
                }
                if (vertexEquality.vertexNumber1 == edge.v2nr) {
                    v2nr = vertexEquality.vertexNumber2;
                }
            });
            cApostropheEq.push(new Edge(v1nr, v2nr));
        });

        await super.pause("Calculate weight max. even set in G*",
            "C* = C' n E* is a weight max. even set in G*");
        graph = dualCopy;
        let cStar = [];
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(cApostropheEq, graph.edges[i]) != -1) {
                cStar.push(graph.edges[i]);
                graph.edges[i].color = "blue";
            }
        }
        redrawAll();

        await super.pause("Calculate mixed max cut in G",
            "C = (C*)* is a mixed max cut in G");
        graph = triangulatedGraph;
        let c = [];
        for (var i = 0; i < cStar.length; i++) {
            let cStarEdge = cStar[i];
            $.each(edgeEqualities, function (_index, edgeEquality) {
                if (edgeEquality.edge1.eq(cStarEdge)) {
                    c.push(edgeEquality.edge2);
                    return false;
                }
            });
        }
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(c, graph.edges[i]) != -1) {
                graph.edges[i].color = "orange";
            }
        }
        redrawAll();

        await super.pause("Calculate mixed max cut in G_0",
            "C_0 = C n E_0 is a mixed max cut in G_0");
        graph = originalGraph;
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(c, graph.edges[i]) != -1) {
                graph.edges[i].color = "red";
            }
        }
        redrawAll();

        super.onFinished();
    }

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("Graph is not planar embedded!");
            fulfilled = false;
        }
        $.each(graph.edges, function (_index, edge) {
            if (edge.weight == null) {
                alert("can't calculate mixed max cut, " + edge.print() + " has no weight!");
                fulfilled = false;
                return false;
            }
        });
        return fulfilled;
    }

    oneVertexToThree() {
        let vertexEqualities = [];
        let newVertices = [];
        let newEdges = [];
        for (var i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            let dist = 40;
            let v1 = new Vertex(vertex.x + dist, vertex.y);
            let v2 = new Vertex(vertex.x, vertex.y + dist);
            let v3 = new Vertex(vertex.x + dist, vertex.y + dist);
            let currNewVertices = [v1, v2, v3];
            vertexEqualities.push(new VertexEquality(v1.number, vertex.number));
            vertexEqualities.push(new VertexEquality(v2.number, vertex.number));
            vertexEqualities.push(new VertexEquality(v3.number, vertex.number));
            newVertices.push(v1);
            newVertices.push(v2);
            newVertices.push(v3);
            newEdges.push(new Edge(v1.number, v2.number, 0));
            newEdges.push(new Edge(v2.number, v3.number, 0));
            newEdges.push(new Edge(v1.number, v3.number, 0));
            let edges = graph.getIncidentEdges(vertex);
            for (let j = 0; j < edges.length; j++) {
                let edge = edges[j];
                let currNewVertexNr = currNewVertices[j].number;
                if (edge.v1nr == vertex.number) {
                    edge.v1nr = currNewVertexNr;
                } else {
                    edge.v2nr = currNewVertexNr;
                }
            }
        }
        graph.vertices = newVertices;
        graph.edges = graph.edges.concat(newEdges);
        redrawAll();

        return vertexEqualities;
    }
}