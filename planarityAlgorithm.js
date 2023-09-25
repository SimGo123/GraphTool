class PlanarityTestAlgo extends Algorithm {

    preconditionsCheck() {
        let fulfilled = true;
        if (graph.getConnectedComponents().length > 1) {
            window.alert("can't check for planarity, graph is not connected");
            fulfilled = false;
        }
        let copyGraph = graph.getCopy();
        this.removeLoopsMultiEdges(copyGraph);
        console.log('bridges: ' + copyGraph.getBridges().length);
        if (copyGraph.getBridges().length > 0) {
            window.alert("can't check for planarity, graph contains bridges");
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

        await this.preparation();

        super.onFinished();
    }

    async preparation() {
        await super.pause("Remove multi-edges and loops", "");
        this.removeLoopsMultiEdges(graph);
        redrawAll();

        await super.pause("Depth first search",
            "Start at any vertex, choose " + graph.vertices[0].number + "."
            + " Number vertices in exploration order."
            + " Orient tree edges in exploration order.");
        let visited = depthFirstSearch(graph.vertices[0], graph);
        console.log('visited: ', visited);
        let oldAssignments = {};
        visited.forEach((vertex, i) => {
            oldAssignments[vertex.number] = i;
            vertex.number = i;
        });
        // Update edge vertex numbers to new numbering
        graph.edges.forEach(edge => {
            edge.v1nr = oldAssignments[edge.v1nr];
            edge.v2nr = oldAssignments[edge.v2nr];
        });
        for (let i = 0; i < visited.length - 1; i++) {
            for (let j = i; j >= 0; j--) {
                let vertex = visited[j];
                let nextVertex = visited[i + 1];
                let edge = graph.getEdgeByStartEnd(vertex.number, nextVertex.number);
                if (edge != null) {
                    if (edge.v1nr === vertex.number) {
                        edge.orientation = EdgeOrientation.NORMAL;
                    } else {
                        edge.orientation = EdgeOrientation.REVERSED;
                    }
                    break;
                }
            }
        }
        redrawAll();

        await super.pause("Orient non-tree edges from higher vertex number to lower", "");
        graph.edges.forEach(edge => {
            if (edge.orientation === EdgeOrientation.UNDIRECTED) {
                if (edge.v1nr > edge.v2nr) {
                    edge.orientation = EdgeOrientation.NORMAL;
                } else {
                    edge.orientation = EdgeOrientation.REVERSED;
                }
            }
        });
        redrawAll();
    }

    // Remove loops and multi-edges until there is at most one edge between two vertices
    removeLoopsMultiEdges(runGraph) {
        let multiEdges = runGraph.getMultiEdges();
        let loops = runGraph.getLoops();
        let toRemove = multiEdges.concat(loops);

        let newEdges = [];
        runGraph.edges.forEach(edge => {
            if (!toRemove.includes(edge)) {
                newEdges.push(edge);
            }
        });
        newEdges.concat(multiEdges);
        runGraph.edges = newEdges;
    }
}