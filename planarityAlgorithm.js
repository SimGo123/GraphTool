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
        super.numSteps = 7;

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        let originalGraph = graph.getCopy();
        let dfsColor = "green";
        let dfsTreeEdges = await this.preparation(dfsColor);

        await super.pause("Find conflicts and create the H Graph",
            "The H Graph is a graph that has a vertex for every edge in the original graph. "
            + "There is an edge between two vertices in the H Graph if there is an unequality conflict between the corresponding vertices. "
            + "Vertices whose edges have equality conflicts are combined.");
        let conflicts = this.getConflicts(graph, dfsTreeEdges);
        let hGraph = await this.createHGraph(conflicts, graph);

        await super.pause("Check for bipartiteness", "If H is bipartite, G is planar");
        let result = isBipartite(hGraph);
        let colorSet = new ColorSet();
        if (result['isBipartite']) {
            result['sets'][0].forEach(vertexIndex => {
                colorSet.addVertexColor(hGraph.vertices[vertexIndex].number, "red");
            });
            result['sets'][1].forEach(vertexIndex => {
                colorSet.addVertexColor(hGraph.vertices[vertexIndex].number, "blue");
            });
            this.drawTwoGraphs(graph, hGraph,
                new ColorSet("#D3D3D3", "#D3D3D3", "red"), colorSet);
            await super.pause("Graph is planar",
                "H is bipartite, therefore there is a LR decomposition of G, therefore G is planar");
        } else {
            await super.pause("Graph is not planar",
                "H is not bipartite, therefore there is no LR decomposition of G, therefore G isn't planar");
        }
        graph = originalGraph;
        redrawAll();

        super.onFinished();
    }

    async preparation(dfsColor) {
        await super.pause("Remove multi-edges and loops", "");
        this.removeLoopsMultiEdges(graph);
        redrawAll();

        if (graph.vertices.length === 0) {
            return;
        }

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
        let dfsTreeEdges = [];
        let dfsColorSet = new ColorSet();
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
                    dfsTreeEdges.push(edge);
                    dfsColorSet.addEdgeColor(edge, dfsColor);
                    break;
                }
            }
        }
        redrawAll(dfsColorSet);

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
        redrawAll(dfsColorSet);
        return dfsTreeEdges;
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

    /**
     * Gets all equality and unequality conflicts in the runGraph.
     * 
     * @param {Graph} runGraph
     * @param {Edge[]} dfsTreeEdges
     * @returns {[Conflict[], Conflict[]]} Lists of equality and unequality conflicts
     */
    getConflicts(runGraph, dfsTreeEdges) {
        console.log('dfsTreeEdges', dfsTreeEdges);
        let equalityConflicts = [];
        let unequalityConflicts = [];

        this.getForks(runGraph).forEach(fork => {
            /*
               r12 = {e back edge of e1 with deepPoint(e2) < deepPoint(e) < commonVertexNr}
               r21 = {e back edge of e2 with deepPoint(e1) < deepPoint(e) < commonVertexNr}
            */
            let r12 = [];
            let r21 = [];
            let deep1 = this.getDeepPoint(fork.edge1, dfsTreeEdges);
            let deep2 = this.getDeepPoint(fork.edge2, dfsTreeEdges);
            let backEdges1 = this.getBackEdges(fork.edge1, dfsTreeEdges);
            let backEdges2 = this.getBackEdges(fork.edge2, dfsTreeEdges);
            console.log('Fork ', fork.edge1, fork.edge2);
            backEdges1.forEach(backEdge1 => {
                let deepE = backEdge1.getEndVertexNr();
                if (deep2 < deepE && deepE < fork.commonVertexNr) {
                    r12.push(backEdge1);
                }
            });
            backEdges2.forEach(backEdge2 => {
                let deepE = backEdge2.getEndVertexNr();
                if (deep1 < deepE && deepE < fork.commonVertexNr) {
                    r21.push(backEdge2);
                }
            });
            console.log('r12', r12);
            console.log('r21', r21);
            /*
               f1,f2 ∈ r12 or f1,f2 ∈ r21 (equality conflict).
               f1 ∈ r12 and f2 ∈ r21 or vice versa
               (unequality conflict)
            */
            for (let i = 0; i < r12.length; i++) {
                let f1 = r12[i];
                for (let j = i + 1; j < r12.length; j++) {
                    let f2 = r12[j];
                    if (eqIndexOf(equalityConflicts, new Conflict(f1, f2)) === -1) {
                        console.log('equality conflict', f1, f2);
                        equalityConflicts.push(new Conflict(f1, f2));
                    }
                }
                for (let j = 0; j < r21.length; j++) {
                    let f2 = r21[j];
                    if (eqIndexOf(unequalityConflicts, new Conflict(f1, f2)) === -1) {
                        console.log('unequality conflict', f1, f2);
                        unequalityConflicts.push(new Conflict(f1, f2));
                    }
                }
            }
        });

        return [equalityConflicts, unequalityConflicts];
    }

    /**
     * Gets all forks in the runGraph.
     * A fork is a pair of edges that share a common start vertex.
     * 
     * @param {Graph} runGraph 
     * @returns {Fork[]} List of all forks in the runGraph
     */
    getForks(runGraph) {
        let forks = [];
        for (let i = 0; i < runGraph.edges.length; i++) {
            const edge1 = runGraph.edges[i];
            for (let j = i + 1; j < runGraph.edges.length; j++) {
                const edge2 = runGraph.edges[j];
                if (edge1.getStartVertexNr() === edge2.getStartVertexNr()) {
                    forks.push(new Fork(edge1, edge2, edge1.getStartVertexNr()));
                }
            }
        }
        forks.sort((a, b) => a.commonVertexNr - b.commonVertexNr);
        return forks;
    }

    /**
     * Gets the deep point of an edge.
     * The deep point of an edge is the lowest vertex number that can be reached
     * by one of its back edges.
     * 
     * @param {Edge} edge 
     * @param {Edge[]} dfsTreeEdges
     * @returns {number} The vertex number of the deep point
     */
    getDeepPoint(edge, dfsTreeEdges) {
        let backEdges = this.getBackEdges(edge, dfsTreeEdges);
        let deepPoint = edge.getStartVertexNr();
        backEdges.forEach(backEdge => {
            deepPoint = Math.min(deepPoint, backEdge.getEndVertexNr());
        });
        return deepPoint;
    }


    /**
     * Finds all back edges.
     * A back edge is a non-DFS-tree edge that lies on a fundamental cycle.
     * If edge is a non-DFS-tree edge, then it itself is its only back edge.
     * Otherwise, find all edges that go from >= end vertex to <= start vertex.
     * 
     * @param {Edge} edge 
     * @param {Edge[]} dfsTreeEdges
     * @returns {Edge[]} List of all back edges
     */
    getBackEdges(edge, dfsTreeEdges) {
        let isNonDFSEdge = edge.getStartVertexNr() > edge.getEndVertexNr();
        if (isNonDFSEdge) {
            return [edge];
        }
        let pseudoGraph = new Graph();
        pseudoGraph.vertices = graph.vertices;
        pseudoGraph.edges = dfsTreeEdges;
        let reachableVertices = depthFirstSearch(
            pseudoGraph.getVertexByNumber(edge.getEndVertexNr()), pseudoGraph, true);
        let backEdges = [];
        console.log(edge.print(),'reachableVertices', reachableVertices);
        reachableVertices.forEach(vertex => {
            let incidentEdges = graph.getIncidentEdges(vertex, true);
            incidentEdges.forEach(incidentEdge => {
                if (incidentEdge.getStartVertexNr() == vertex.number
                    && incidentEdge.getEndVertexNr() <= edge.getStartVertexNr()) {
                    backEdges.push(incidentEdge);
                }
            });
        });
        return backEdges;
    }

    /**
     * Creates the H Graph from the runGraph and the conflicts.
     * The H Graph is a graph that has a vertex for every edge in the runGraph.
     * There is an edge between two vertices if there is an unequality conflict between the corresponding vertices.
     * Vertices whose edges have equality conflicts are combined.
     * 
     * @param {[Conflict[], Conflict[]]} conflicts The equality and unequality conflicts 
     * @param {Graph} runGraph 
     * @returns {Graph}
     */
    async createHGraph([equalConflicts, unequalConflicts], runGraph) {
        let hGraph = new Graph();
        // A vertex for every edge in the original graph
        runGraph.edges.forEach(edge => {
            let v1 = runGraph.getVertexByNumber(edge.v1nr);
            let v2 = runGraph.getVertexByNumber(edge.v2nr);
            let vertex = new Vertex((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
            hGraph.addVertex(vertex);
        });
        // An edge for every unequality conflict
        unequalConflicts.forEach(conflict => {
            let edge1 = conflict.edge1;
            let edge2 = conflict.edge2;
            let v1 = hGraph.vertices[eqIndexOf(runGraph.edges, edge1)];
            let v2 = hGraph.vertices[eqIndexOf(runGraph.edges, edge2)];
            hGraph.addEdge(new Edge(v1.number, v2.number));
        });
        this.drawTwoGraphs(graph, hGraph);
        await super.pause("Combine vertices whose edges have equality conflicts", "");
        // Convert conflict of G-edges to conflict of H-vertices
        let conflictVertices = [];
        equalConflicts.forEach(conflict => {
            let v1nr = hGraph.vertices[eqIndexOf(runGraph.edges, conflict.edge1)].number;
            let v2nr = hGraph.vertices[eqIndexOf(runGraph.edges, conflict.edge2)].number;
            conflictVertices.push([v1nr, v2nr]);
        });

        conflictVertices.forEach((conflict, i) => {
            let [v1nr, v2nr] = conflict;
            let newVertexNr = hGraph.contractEdge(new Edge(v1nr, v2nr));
            console.log('combining ' + v1nr + ' and ' + v2nr + ' to ' + newVertexNr);
            for (let j = i + 1; j < conflictVertices.length; j++) {
                let otherConflict = conflictVertices[j];
                if (otherConflict[0] === v1nr) {
                    otherConflict[0] = newVertexNr;
                }
                if (otherConflict[0] === v2nr) {
                    otherConflict[0] = newVertexNr;
                }
                if (otherConflict[1] === v1nr) {
                    otherConflict[1] = newVertexNr;
                }
                if (otherConflict[1] === v2nr) {
                    otherConflict[1] = newVertexNr;
                }
            }
        });
        this.drawTwoGraphs(graph, hGraph);

        return hGraph;
    }

    drawTwoGraphs(backGraph, foreGraph,
        backColorSet = new ColorSet("#D3D3D3", "#D3D3D3", "red"),
        foreColorSet = new ColorSet()) {
        clearFgCanvas();
        drawCanvasWalls();
        backGraph.draw(null, null, backColorSet);
        foreGraph.draw(selectedVertex, selectedEdge, foreColorSet);
    }
}

class Fork {
    constructor(edge1, edge2, commonVertexNr) {
        this.edge1 = edge1;
        this.edge2 = edge2;
        this.commonVertexNr = commonVertexNr;
    }
}

class Conflict {
    constructor(edge1, edge2) {
        this.edge1 = edge1;
        this.edge2 = edge2;
    }

    eq(other) {
        return this.edge1.eq(other.edge1) && this.edge2.eq(other.edge2)
            || this.edge1.eq(other.edge2) && this.edge2.eq(other.edge1);
    }
}