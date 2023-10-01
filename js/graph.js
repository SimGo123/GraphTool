var fgCanvas = $("#fgCanvas")[0];

class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];

        this.sources = [];
        this.targets = [];
    }

    addVertex(vertex) {
        this.vertices.push(vertex);
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    deleteEdge(edge) {
        let index = eqIndexOf(this.edges, edge);
        if (index != -1) {
            this.edges.splice(index, 1);
        } else {
            console.error("deleteEdge: edge {" + edge.print() + "} not found");
        }
    }

    deleteVertex(vertex) {
        // Delete all edges connected to vertex
        for (let i = this.edges.length - 1; i >= 0; i--) {
            let edge = this.edges[i];
            if (edge.v1nr == vertex.number || edge.v2nr == vertex.number) {
                this.edges.splice(i, 1);
            }
        }
        let index = this.vertices.indexOf(vertex);
        if (index != -1) {
            this.vertices.splice(this.vertices.indexOf(vertex), 1);
        } else {
            console.error("deleteVertex: vertex {" + vertex.print() + "} not found");
        }
    }

    makeSource(vertexNr) {
        console.log('sources',this.sources);
        if (this.targets.includes(vertexNr) && vertexNr != -1) {
            window.alert("Can't have same source & target");
            return;
        }
        if (!this.sources.includes(vertexNr) && vertexNr != -1) {
            this.sources.push(vertexNr);
        } else if (vertexNr != -1) {
            window.alert("Vertex is already a source");
        }
    }

    makeTarget(vertexNr) {
        if (this.sources.includes(vertexNr) && vertexNr != -1) {
            window.alert("Can't have same source & target");
            return;
        }
        if (!this.targets.includes(vertexNr) && vertexNr != -1) {
            this.targets.push(vertexNr);
        } else if (vertexNr != -1) {
            window.alert("Vertex is already a target");
        }
    }

    deleteSource(vertexNr) {
        let index = this.sources.indexOf(vertexNr);
        if (index != -1) {
            this.sources.splice(index, 1);
        } else {
            window.alert("This vertex is not a source");
        }
    }

    deleteTarget(vertexNr) {
        let index = this.targets.indexOf(vertexNr);
        if (index != -1) {
            this.targets.splice(index, 1);
        } else {
            window.alert("This vertex is not a target");
        }
    }

    getVertexAt(x, y) {
        const clickPoint = new Point(x, y);
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            if (distance(vertex, clickPoint) <= vertex.radius) {
                return vertex;
            }
        }
        console.log("getVertexAt: no vertex found");
        return null;
    }

    getEdgeAt(x, y) {
        const clickPoint = new Point(x, y);
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            let v1 = this.getVertexByNumber(edge.v1nr);
            let v2 = this.getVertexByNumber(edge.v2nr);
            console.log("edge dist " + pointLineDist(v1, v2, clickPoint));
            if (pointLineDist(v1, v2, clickPoint) <= 20) {
                return edge;
            }
        }
        console.log("getEdgeAt: no edge found");
        return null;
    }

    /**
    * Returns one edge that connects startNr and endNr.
    * Doesn't consider multi-edges or edge orientation
    * @param {number} startNr - The number of the starting vertex.
    * @param {number} endNr - The number of the ending vertex.
    * @returns {Edge} The edge that starts at the starting vertex and ends at the ending vertex, or null if no such edge exists.
    */
    getEdgeByStartEnd(startNr, endNr) {
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if ((edge.v1nr == startNr && edge.v2nr == endNr)
                || (edge.v1nr == endNr && edge.v2nr == startNr)) {
                return edge;
            }
        }
        return null;
    }

    draw(selectedVertex, selectedEdge, colorSet) {
        let loops = this.getLoops();
        for (let i = 0; i < loops.length; i++) {
            let loop = loops[i];
            let occurrences = 0;
            $.each(this.edges, function (_j, otherEdge) {
                if (loop.eq(otherEdge)) {
                    occurrences++;
                }
            });
            loop.draw(this, selectedEdge, colorSet, false, true, occurrences);
        }
        let multiEdges = this.getMultiEdges();
        for (let i = 0; i < multiEdges.length; i++) {
            let multiEdge = multiEdges[i];
            if (eqIndexOf(loops, multiEdge) != -1) {
                continue;
            }
            let occurrences = 0;
            $.each(this.edges, function (_j, otherEdge) {
                if (multiEdge.eq(otherEdge)) {
                    occurrences++;
                }
            });
            let j = 0;
            this.edges.forEach(edge => {
                if (multiEdge.eq(edge)) {
                    let revPoints = multiEdge.v1nr != edge.v1nr;
                    edge.draw(this, selectedEdge, colorSet, true, false, occurrences, j, revPoints);
                    j++;
                }
            });
            //multiEdge.draw(this, selectedEdge, colorSet, true, false, occurrences);
        }
        let otherEdgesToDraw = [];
        $.each(this.edges, function (_i, edge) {
            if (eqIndexOf(multiEdges, edge) == -1) {
                otherEdgesToDraw.push(edge);
            }
        });
        for (let i = 0; i < otherEdgesToDraw.length; i++) {
            let edge = otherEdgesToDraw[i];
            edge.draw(this, selectedEdge, colorSet);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].draw(selectedVertex, this.sources, this.targets, colorSet);
        }
    }

    expandEdge(edge) {
        let v1 = this.getVertexByNumber(edge.v1nr);
        let v2 = this.getVertexByNumber(edge.v2nr);
        let middleVertex = new Vertex((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
        this.addVertex(middleVertex);
        let edge1 = new Edge(edge.v1nr, middleVertex.number);
        let edge2 = new Edge(middleVertex.number, edge.v2nr);
        this.edges.push(edge1);
        this.edges.push(edge2);
        this.edges.splice(this.edges.indexOf(edge), 1);
    }

    /**
     * 
     * @param {Edge} edge 
     * @returns The number of the newly added vertex that replaces the edge
     */
    contractEdge(edge) {
        let v1 = this.getVertexByNumber(edge.v1nr);
        let v2 = this.getVertexByNumber(edge.v2nr);
        let vertexLeft = edge.v1nr;
        let vertexRight = edge.v2nr;
        let middleVertex = new Vertex((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
        $.each(this.edges, function (_index, edge) {
            if (edge.v1nr == vertexLeft || edge.v1nr == vertexRight) {
                edge.v1nr = middleVertex.number;
            }
            if (edge.v2nr == vertexLeft || edge.v2nr == vertexRight) {
                edge.v2nr = middleVertex.number;
            }
        });
        this.deleteVertex(v1);
        this.deleteVertex(v2);
        this.deleteEdge(edge);
        this.addVertex(middleVertex);
        return middleVertex.number;
    }

    // Gets all edges incident to vertex
    // If usingOrientation is true, only edges originating from the vertex are returned
    getIncidentEdges(vertex, usingOrientation = false) {
        let incidentEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if (usingOrientation && edge.orientation != EdgeOrientation.UNDIRECTED) {
                if (edge.v1nr == vertex.number && edge.orientation == EdgeOrientation.NORMAL) {
                    incidentEdges.push(edge);
                } else if (edge.v2nr == vertex.number && edge.orientation == EdgeOrientation.REVERSED) {
                    incidentEdges.push(edge);
                }
            } else {
                if (edge.v1nr == vertex.number || edge.v2nr == vertex.number) {
                    incidentEdges.push(edge);
                }
            }
        }
        return incidentEdges;
    }

    indexAllEdges() {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].id = i;
        }
    }

    getVertexDegree(vertex) {
        return this.getIncidentEdges(vertex).length;
    }

    replaceUnorientedEdges() {
        let newEdges = [];
        this.edges.forEach(e => {
            if (e.orientation == EdgeOrientation.UNDIRECTED) {
                let edge = new Edge(e.v1nr, e.v2nr, null, e.weight, EdgeOrientation.NORMAL);
                let revEdge = new Edge(e.v1nr, e.v2nr, null, e.weight, EdgeOrientation.REVERSED);
                newEdges.push(edge);
                newEdges.push(revEdge);
            } else {
                newEdges.push(e);
            }
        });
        this.edges = newEdges;
    }

    /**
     * Returns an array of all vertices connected to vertex, in clockwise embedding order
     * 
     * @param {Vertex} vertex 
     * @param {boolean} usingOrientation 
     * @returns {Vertex[]}
     */
    getAllNeighbours(vertex, usingOrientation = false) {
        let neighbours = [];
        let incidentEdges = this.getIncidentEdges(vertex, usingOrientation);
        for (let i = 0; i < incidentEdges.length; i++) {
            let edge = incidentEdges[i];
            if (edge.v1nr == vertex.number) {
                neighbours.push(this.getVertexByNumber(edge.v2nr));
            }
            if (edge.v2nr == vertex.number) {
                neighbours.push(this.getVertexByNumber(edge.v1nr));
            }
        }

        return sortClockwise(vertex, neighbours);
    }

    getEmbedding() {
        let embedding = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            let neighbours = this.getAllNeighbours(vertex);
            embedding.push([vertex, neighbours]);
        }
        return embedding;
    }

    getMultiEdges() {
        let multiEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            for (let j = i + 1; j < this.edges.length; j++) {
                let other = this.edges[j];
                if (edge.eq(other)) {
                    multiEdges.push(edge);
                }
            }
        }
        return multiEdges;
    }

    getLoops() {
        let loops = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if (edge.v1nr == edge.v2nr) {
                loops.push(edge);
            }
        }
        return loops;
    }

    // Get bridges of graph, these are edges that,
    // when removed, increase the number of connected components
    // Requires the graph to be connected and not to contain loops or multi-edges
    getBridges() {
        let bridges = [];
        this.edges.forEach(edge => {
            let copyGraph = this.getCopy();
            copyGraph.deleteEdge(edge);
            if (copyGraph.getConnectedComponents().length > 1) {
                bridges.push(edge);
            }
        });
        return bridges;
    }

    isPlanarEmbedded() {
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            for (let j = i + 1; j < this.edges.length; j++) {
                let other = this.edges[j];
                let v1 = this.getVertexByNumber(edge.v1nr);
                let v2 = this.getVertexByNumber(edge.v2nr);
                let otherv1 = this.getVertexByNumber(other.v1nr);
                let otherv2 = this.getVertexByNumber(other.v2nr);
                if (doIntersect(v1, v2, otherv1, otherv2)) {
                    console.log("isPlanarEmbedded: " + edge.print() + " and " + other.print() + " intersect");
                    return false;
                }
            }
        }
        return true;
    }

    getConnectedComponents() {
        let components = [];
        let visited = [];
        for (let i = 0; i < this.vertices.length; i++) {
            if (eqIndexOf(visited, this.vertices[i]) == -1) {
                let newVisited = depthFirstSearch(this.vertices[i], this);
                components.push(newVisited);
                visited = visited.concat(newVisited);
            }
        }
        return components;
    }

    isTriangulated() {
        if (this.getMultiEdges().length > 0 || this.getLoops().length > 0
            || this.getConnectedComponents().length > 1) {
            console.log('isTriangulated: preconditions failed');
            return false;
        }
        let isTriangulated = true;
        let allFacets = getAllFacets(this);
        for (let i = 0; i < allFacets.length; i++) {
            let facet = allFacets[i];
            if (facet.length != 3) {
                console.log('Facet ' + printArr(facet) + ' is not a triangle');
                isTriangulated = false;
            }
        }
        return isTriangulated;
    }

    getDualGraph() {
        let dualGraph = new Graph();
        let allFacets = getAllFacets(this);
        let vertexFacets = [];
        let edgeEqualities = [];
        let outerFacetPoss = tryGetOuterFacet(this);
        let outerFacDone = false;
        for (let i = 0; i < allFacets.length; i++) {
            let facet = allFacets[i];
            let facetCenter = getFacetCenter(facet, this);
            let vertex = new Vertex(facetCenter.x, facetCenter.y);
            if (outerFacetPoss.length == 1 && outerFacetPoss[0].join(',') == facet.join(',') && !outerFacDone) {
                vertex = new Vertex(fgCanvas.width - 50, 250);
                outerFacDone = true;
            }
            dualGraph.addVertex(vertex);
            vertexFacets.push(new VertexFacet(vertex.number, facet));
        }
        this.edges.forEach(edge => {
            let v1nr = -1;
            let v2nr = -1;
            let statusEdges = [];
            $.each(this.edges, function (_index, edge) {
                statusEdges.push(new StatusEdge(edge, false, false));
            });
            let rightFacet = facetWalk(edge, true, statusEdges, this);
            let leftFacet = facetWalk(edge, false, statusEdges, this);
            $.each(vertexFacets, function (_index, vFac) {
                if (facets_equal(rightFacet, vFac.facet)) {
                    v1nr = vFac.vertexNumber;
                }
                if (facets_equal(leftFacet, vFac.facet)) {
                    v2nr = vFac.vertexNumber;
                }
            });

            if (v1nr == -1 || v2nr == -1) {
                console.log("Error: didn't find adjacent facets of edge " + edge.print());
                console.log('v1 ' + v1nr + ' v2 ' + v2nr);
            } else {
                // Keep weights, id & orientation in dual graph
                let newEdge = new Edge(v1nr, v2nr, null, edge.weight, edge.orientation);
                dualGraph.addEdge(newEdge);
                edgeEqualities.push(new EdgeEquality(newEdge, edge));
            }
        });
        return [dualGraph, edgeEqualities, vertexFacets];
    }

    getCopy() {
        let copy = new Graph();
        $.each(this.vertices, function (_index, vertex) {
            copy.addVertex(new Vertex(vertex.x, vertex.y, vertex.number));
        });
        $.each(this.edges, function (_index, edge) {
            copy.addEdge(new Edge(edge.v1nr, edge.v2nr, edge.id, edge.weight, edge.orientation));
        });
        this.sources.forEach(source => {
            copy.sources.push(source);
        });
        this.targets.forEach(target => {
            copy.targets.push(target);
        });
        return copy;
    }

    getSubgraph(vertices) {
        let subgraph = new Graph();
        $.each(vertices, function (_index, vertex) {
            subgraph.addVertex(vertex);
        });
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            let v1 = this.getVertexByNumber(edge.v1nr);
            let v2 = this.getVertexByNumber(edge.v2nr);
            if (eqIndexOf(vertices, v1) != -1 && eqIndexOf(vertices, v2) != -1) {
                subgraph.addEdge(edge);
            }
        }
        return subgraph;
    }

    getVertexByNumber(number) {
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            if (vertex.number == number) {
                return vertex;
            }
        }
        return null;
    }

    getVertexIdByNumber(number) {
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            if (vertex.number == number) {
                return i;
            }
        }
        return -1;
    }

    getOtherVertex(edge, vertex) {
        return vertex.number == edge.v1nr ? this.getVertexByNumber(edge.v2nr)
            : this.getVertexByNumber(edge.v1nr);
    }
}

graph = new Graph();