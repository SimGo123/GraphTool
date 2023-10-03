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
