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
