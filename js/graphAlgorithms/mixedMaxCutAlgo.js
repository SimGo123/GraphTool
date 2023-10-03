class MixedMaxCutAlgo extends Algorithm {
    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        let originalGraph = graph.getCopy();

        await super.pause("Triangulate the graph",
            "Triangulate the graph, new edges get weight 0");
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

        // TODO When running to completion (runComplete = true), this will loop forever
        if (this.runComplete) {
            alert("Can't run to completion, a step requires manually changing the graph");
            super.onFinished();
            return;
        }
        while (!graph.isPlanarEmbedded()) {
            await super.pause("Problem: Graph is not planar embedded",
                "Graph is not planar embedded, try to find a planar embedding first");
        }
        let weightMaxMatchAlgo = new WeightMaxMatchingAlgo();
        weightMaxMatchAlgo.shouldContinue = true;
        weightMaxMatchAlgo.runComplete = true;
        weightMaxMatchAlgo.isSubAlgo = true;
        let weightMaxEdges = await weightMaxMatchAlgo.run();
        let wmeColorSet = new ColorSet();
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
        let twoFactorColorSet = new ColorSet();
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(weightMaxEdges, graph.edges[i]) == -1) {
                cApostrophe.push(graph.edges[i]);
                twoFactorColorSet.addEdgeColor(graph.edges[i], "green");
            }
        }
        redrawAll(twoFactorColorSet);

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
        let evenSetColorSet = new ColorSet();
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(cApostropheEq, graph.edges[i]) != -1) {
                cStar.push(graph.edges[i]);
                evenSetColorSet.addEdgeColor(graph.edges[i], "blue");
            }
        }
        redrawAll(evenSetColorSet);

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
        let mixedMaxCutColorSet = new ColorSet();
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(c, graph.edges[i]) != -1) {
                mixedMaxCutColorSet.addEdgeColor(graph.edges[i], "orange");
            }
        }
        redrawAll(mixedMaxCutColorSet);

        await super.pause("Calculate mixed max cut in G_0",
            "C_0 = C n E_0 is a mixed max cut in G_0");
        graph = originalGraph;
        let mixedMaxCutColorSet0 = new ColorSet();
        for (var i = 0; i < graph.edges.length; i++) {
            if (eqIndexOf(c, graph.edges[i]) != -1) {
                mixedMaxCutColorSet0.addEdgeColor(graph.edges[i], "red");
            }
        }
        redrawAll(mixedMaxCutColorSet0);

        super.onFinished(true, "Mixed max cut calculated");
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
