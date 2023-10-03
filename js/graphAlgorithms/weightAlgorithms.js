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
    /*
    {"canvasWidth":1069,"canvasHeight":538,"sources":[],"targets":[],"vertices":[{"x":1059,"y":250,"nr":12},{"x":1019,"y":290,"nr":13},{"x":1059,"y":290,"nr":14},{"x":385,"y":247,"nr":15},{"x":345,"y":287,"nr":16},{"x":385,"y":287,"nr":17},{"x":385,"y":371,"nr":18},{"x":345,"y":411,"nr":19},{"x":385,"y":411,"nr":20},{"x":559,"y":470,"nr":21},{"x":519,"y":510,"nr":22},{"x":559,"y":510,"nr":23},{"x":711,"y":372,"nr":24},{"x":671,"y":412,"nr":25},{"x":711,"y":412,"nr":26},{"x":559,"y":346,"nr":27},{"x":519,"y":386,"nr":28},{"x":559,"y":386,"nr":29}],"edges":[{"v1nr":12,"v2nr":15,"weight":273,"orientation":"U"},{"v1nr":18,"v2nr":16,"weight":289,"orientation":"U"},{"v1nr":19,"v2nr":21,"weight":278,"orientation":"U"},{"v1nr":24,"v2nr":22,"weight":288,"orientation":"U"},{"v1nr":25,"v2nr":13,"weight":284,"orientation":"U"},{"v1nr":26,"v2nr":20,"weight":295,"orientation":"U"},{"v1nr":27,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":23,"v2nr":28,"weight":289,"orientation":"U"},{"v1nr":29,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":12,"v2nr":13,"weight":289,"orientation":"U"},{"v1nr":13,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":12,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":15,"v2nr":16,"weight":289,"orientation":"U"},{"v1nr":16,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":15,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":18,"v2nr":19,"weight":289,"orientation":"U"},{"v1nr":19,"v2nr":20,"weight":289,"orientation":"U"},{"v1nr":18,"v2nr":20,"weight":289,"orientation":"U"},{"v1nr":21,"v2nr":22,"weight":289,"orientation":"U"},{"v1nr":22,"v2nr":23,"weight":289,"orientation":"U"},{"v1nr":21,"v2nr":23,"weight":289,"orientation":"U"},{"v1nr":24,"v2nr":25,"weight":289,"orientation":"U"},{"v1nr":25,"v2nr":26,"weight":289,"orientation":"U"},{"v1nr":24,"v2nr":26,"weight":289,"orientation":"U"},{"v1nr":27,"v2nr":28,"weight":289,"orientation":"U"},{"v1nr":28,"v2nr":29,"weight":289,"orientation":"U"},{"v1nr":27,"v2nr":29,"weight":289,"orientation":"U"}]}
    Edge 26 20 (U)
    Edge 27 14 (U)
    Edge 23 28 (U)
    Edge 29 17 (U)
    Edge 12 13 (U)
    id: 0 Edge 15 16 (U)
    id: 0 Edge 18 19 (U)
    id: 0 Edge 21 22 (U)
    id: 0 Edge 24 25 (U)
    id: 0
    Planar embedd.: {"canvasWidth":1119,"canvasHeight":538,"sources":[],"targets":[],"vertices":[{"x":1109,"y":250,"nr":12},{"x":1067,"y":290,"nr":13},{"x":1028,"y":264,"nr":14},{"x":403,"y":247,"nr":15},{"x":361,"y":287,"nr":16},{"x":403,"y":287,"nr":17},{"x":403,"y":371,"nr":18},{"x":442,"y":420,"nr":19},{"x":422,"y":505,"nr":20},{"x":518,"y":440,"nr":21},{"x":550,"y":460,"nr":22},{"x":578,"y":407,"nr":23},{"x":750,"y":412,"nr":24},{"x":806,"y":413,"nr":25},{"x":727,"y":480,"nr":26},{"x":585,"y":346,"nr":27},{"x":508,"y":373,"nr":28},{"x":526,"y":330,"nr":29}],"edges":[{"v1nr":12,"v2nr":15,"weight":273,"orientation":"U"},{"v1nr":18,"v2nr":16,"weight":289,"orientation":"U"},{"v1nr":19,"v2nr":21,"weight":278,"orientation":"U"},{"v1nr":24,"v2nr":22,"weight":288,"orientation":"U"},{"v1nr":25,"v2nr":13,"weight":284,"orientation":"U"},{"v1nr":26,"v2nr":20,"weight":295,"orientation":"U"},{"v1nr":27,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":23,"v2nr":28,"weight":289,"orientation":"U"},{"v1nr":29,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":12,"v2nr":13,"weight":289,"orientation":"U"},{"v1nr":13,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":12,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":15,"v2nr":16,"weight":289,"orientation":"U"},{"v1nr":16,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":15,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":18,"v2nr":19,"weight":289,"orientation":"U"},{"v1nr":19,"v2nr":20,"weight":289,"orientation":"U"},{"v1nr":18,"v2nr":20,"weight":289,"orientation":"U"},{"v1nr":21,"v2nr":22,"weight":289,"orientation":"U"},{"v1nr":22,"v2nr":23,"weight":289,"orientation":"U"},{"v1nr":21,"v2nr":23,"weight":289,"orientation":"U"},{"v1nr":24,"v2nr":25,"weight":289,"orientation":"U"},{"v1nr":25,"v2nr":26,"weight":289,"orientation":"U"},{"v1nr":24,"v2nr":26,"weight":289,"orientation":"U"},{"v1nr":27,"v2nr":28,"weight":289,"orientation":"U"},{"v1nr":28,"v2nr":29,"weight":289,"orientation":"U"},{"v1nr":27,"v2nr":29,"weight":289,"orientation":"U"}]}
    {"canvasWidth":906,"canvasHeight":538,"sources":[],"targets":[],"vertices":[{"x":853,"y":220,"nr":12},{"x":864,"y":290,"nr":13},{"x":750,"y":276,"nr":14},{"x":82,"y":215,"nr":15},{"x":32,"y":262,"nr":16},{"x":151,"y":262,"nr":17},{"x":183,"y":418,"nr":18},{"x":230,"y":444,"nr":19},{"x":169,"y":483,"nr":20},{"x":382,"y":417,"nr":21},{"x":445,"y":460,"nr":22},{"x":468,"y":407,"nr":23},{"x":607,"y":412,"nr":24},{"x":653,"y":413,"nr":25},{"x":642,"y":494,"nr":26},{"x":474,"y":346,"nr":27},{"x":362,"y":349,"nr":28},{"x":372,"y":286,"nr":29}],"edges":[{"v1nr":12,"v2nr":15,"weight":273,"orientation":"U"},{"v1nr":18,"v2nr":16,"weight":289,"orientation":"U"},{"v1nr":19,"v2nr":21,"weight":278,"orientation":"U"},{"v1nr":24,"v2nr":22,"weight":288,"orientation":"U"},{"v1nr":25,"v2nr":13,"weight":284,"orientation":"U"},{"v1nr":26,"v2nr":20,"weight":295,"orientation":"U"},{"v1nr":27,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":23,"v2nr":28,"weight":289,"orientation":"U"},{"v1nr":29,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":12,"v2nr":13,"weight":289,"orientation":"U"},{"v1nr":13,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":12,"v2nr":14,"weight":289,"orientation":"U"},{"v1nr":15,"v2nr":16,"weight":289,"orientation":"U"},{"v1nr":16,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":15,"v2nr":17,"weight":289,"orientation":"U"},{"v1nr":18,"v2nr":19,"weight":289,"orientation":"U"},{"v1nr":19,"v2nr":20,"weight":289,"orientation":"U"},{"v1nr":18,"v2nr":20,"weight":289,"orientation":"U"},{"v1nr":21,"v2nr":22,"weight":289,"orientation":"U"},{"v1nr":22,"v2nr":23,"weight":289,"orientation":"U"},{"v1nr":21,"v2nr":23,"weight":289,"orientation":"U"},{"v1nr":24,"v2nr":25,"weight":289,"orientation":"U"},{"v1nr":25,"v2nr":26,"weight":289,"orientation":"U"},{"v1nr":24,"v2nr":26,"weight":289,"orientation":"U"},{"v1nr":27,"v2nr":28,"weight":289,"orientation":"U"},{"v1nr":28,"v2nr":29,"weight":289,"orientation":"U"},{"v1nr":27,"v2nr":29,"weight":289,"orientation":"U"}]}
    */
    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        let [maxWeightEdges, separators] = await this.divide(graph);
        let stepColorSet = new ColorSet();
        console.log('mwel ' + maxWeightEdges.length + " sl " + separators.length);
        maxWeightEdges.forEach(edge => {
            console.log('edge=' + edge.print() + ' color=red');
            stepColorSet.addEdgeColor(edge, "red");
        });
        console.log('S=( ');
        printArr(separators);
        console.log(')');
        separators.forEach(separatorVertex => {
            stepColorSet.addVertexColor(separatorVertex.number, "green");
        });
        redrawAll(stepColorSet);
        await super.pause("Optimal matchings have been calculated in subgraphs", "");

        let gApostrophe = graph.getCopy();
        separators.forEach(function (separatorVertex) {
            gApostrophe.deleteVertex(separatorVertex);
        });

        while (separators.length > 0) {
            // Wähle v ∈ S.
            let v = separators.pop();
            console.log('We chose v=' + v.print());
            // Finde alternierenden Weg P in G′ + v mit Endpunkt v mit w (P − M′) − w (P ∩ M′) maximal.
            let gApostropheWithV = graph.getSubgraph(gApostrophe.vertices.concat([v]));
            let path = this.findMaxWay(maxWeightEdges, gApostropheWithV, v);
            console.log('path=', path);
            // Falls P erhöhend, ersetze M′ durch M′ /_\ P.
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
            gApostrophe.vertices.forEach(vertex => {
                loopColorSet.addVertexColor(vertex.number, "blue");
            });
            loopColorSet.addVertexColor(v.number, "red");
            globalColorSet = loopColorSet;
            redrawAll(loopColorSet);
            await super.pause("a", "");
            // Lösche v aus S. (oben ^)
            // Ersetze G′ durch G′ + v .
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

        super.onFinished();
    }

    async divide(toDivideGraph) {
        redrawAll(new ColorSet(), toDivideGraph);
        console.log('currJson',getCurrJSON(toDivideGraph));
        await super.pause("Divide graph", "Divide graph into subgraphs with <= 5 vertices");
        const N = toDivideGraph.vertices.length;
        if (N <= 5) {
            let maxWeightEdges = this.bruteForce(toDivideGraph);
            console.log('divEnd ', toDivideGraph.vertices);
            console.log('bf res', maxWeightEdges);

            return [maxWeightEdges, []];
        }

        let planarSeparatorAlgo = new PlanarSeparatorAlgo();
        planarSeparatorAlgo.shouldContinue = true;
        planarSeparatorAlgo.runComplete = true;
        planarSeparatorAlgo.isSubAlgo = true;
        let divideCopy = toDivideGraph.getCopy();
        let graphCopy = graph.getCopy();
        graph = toDivideGraph.getCopy();
        let result = await planarSeparatorAlgo.run();
        graph = graphCopy;
        toDivideGraph = divideCopy;
        console.log('result=', result);
        if (result == null) {
            alert("No separator found, can't calculate weight max matching");
            super.onFinished();
            return;
        }
        let [v1, separator, v2] = result;
        console.log('v1', v1, "separator", separator, "v2", v2);
        redrawAll(new ColorSet(), toDivideGraph);
        await super.pause("Q", "");

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
        let [dualGraph, edgeEqualities, vertexFacets] = graph.getDualGraph();
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
        let wmeColorSet = new ColorSet();
        let wmeBf = weightMaxMatchAlgo.bruteForce(graph);
        let wmeString = "";
        wmeBf.forEach(function (edge) {
            wmeColorSet.addEdgeColor(edge, "red");
            wmeString += edge.print() + " ";
        });
        console.log(wmeString);
        // console.log('...finished brute force');

        // Weight max edges for the mixed-max-graph
        // TODO Delete when non-brute-force weight max matching is implemented
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
                wmeColorSet.addEdgeColor(graph.edges[i], "red");
            }
        }
        redrawAll(wmeColorSet);

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