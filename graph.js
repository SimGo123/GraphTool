var fgCanvas = $("#fgCanvas")[0];
var vertexCount = 0;

var vertexRadius = 18;

class Vertex {
    constructor(x, y, number = -1) {
        this.x = x;
        this.y = y;
        if (number != -1) {
            this.number = number;
            if (number >= vertexCount) {
                vertexCount = number + 1;
            }
        } else {
            this.number = vertexCount++;
        }
        this.radius = vertexRadius;
    }

    draw(selectedVertex, sources, targets, colorSet) {
        var ctx = fgCanvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = colorSet.getVertexColor(this.number);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = colorSet.getVertexColor(this.number);
        let text = this.number;
        let sIndex = sources.indexOf(this.number);
        let tIndex = targets.indexOf(this.number);
        if (this.number != -1 && sIndex != -1) {
            if (sources.length > 1) {
                text = "S" + sIndex + "(" + text + ")";
            } else {
                text = "S" + text;
            }
        } else if (this.number != -1 && tIndex != -1) {
            if (sources.length > 1) {
                text = "T" + tIndex + "(" + text + ")";
            } else {
                text = "T" + text;
            }
        }
        let metrics = ctx.measureText(text);
        let txtWidth = metrics.width;
        let txtHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        ctx.fillText(text, this.x - txtWidth / 2, this.y + txtHeight / 2);
        ctx.closePath();

        if (selectedVertex == this) {
            // Draw highlighting circle around vertex
            ctx.strokeStyle = colorSet.highlightColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    }

    eq(other) {
        return this.number == other.number;
    }

    print() {
        return "Vertex " + this.number;
    }
}

const EdgeOrientation = {
    UNDIRECTED: 'U',
    NORMAL: 'N',
    REVERSED: 'R'
};

class Edge {
    constructor(v1nr, v2nr, id = null, weight = null, orientation = EdgeOrientation.UNDIRECTED) {
        this.v1nr = v1nr;
        this.v2nr = v2nr;
        this.id = id;
        this.weight = weight;
        this.orientation = orientation;
        this.thickness = 5;
    }

    changeOrientation() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
                this.orientation = EdgeOrientation.NORMAL;
                break;
            case EdgeOrientation.NORMAL:
                this.orientation = EdgeOrientation.REVERSED;
                break;
            case EdgeOrientation.REVERSED:
                this.orientation = EdgeOrientation.UNDIRECTED;
                break;
        }
    }

    /**
     * 
     * @returns {number} The number of the vertex at the start of the edge, depending on the orientation.
     */
    getStartVertexNr() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
            case EdgeOrientation.NORMAL:
                return this.v1nr;
            case EdgeOrientation.REVERSED:
                return this.v2nr;
        }
    }

    /**
     * 
     * @returns {number} The number of the vertex at the end of the edge, depending on the orientation.
     */
    getEndVertexNr() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
            case EdgeOrientation.NORMAL:
                return this.v2nr;
            case EdgeOrientation.REVERSED:
                return this.v1nr;
        }
    }

    draw(pGraph, selectedEdge, colorSet,
        multiEdge = false, loop = false, occurences = 1, multiEdgeIndex = -1, revPoints = false) {
        let v1r = pGraph.getVertexByNumber(this.v1nr);
        let v2r = pGraph.getVertexByNumber(this.v2nr);
        let v1 = new Point(v1r.x, v1r.y);
        let v2 = new Point(v2r.x, v2r.y);
        if (revPoints) {
            let temp = v1;
            v1 = v2;
            v2 = temp;
        }
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        var ctx = fgCanvas.getContext("2d");
        if (selectedEdge == this) {
            ctx.strokeStyle = colorSet.highlightColor;
            ctx.lineWidth = 7;
        } else {
            ctx.strokeStyle = colorSet.getEdgeColor(this);
            ctx.lineWidth = 3;
        }
        if ((occurences == 1 || occurences % 2 != 0)
            && (multiEdgeIndex == -1 || multiEdgeIndex == Math.floor(occurences / 2))) {
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
            ctx.closePath();
            if (this.weight != null) {
                let vecLen = this.weight.toString().length * 7;
                ctx.fillStyle = colorSet.getEdgeColor(this);
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, vecLen);
                controlVec = controlVec.y < 0 ? controlVec : changeVectorLength(new Point(-dy, dx), vecLen);
                ctx.fillText(this.weight, (v1.x + v2.x) / 2 + controlVec.x, (v1.y + v2.y) / 2 + controlVec.y);
            }
        }
        let startPoint = new Point(v1.x + dx / 2, v1.y + dy / 2);
        if (loop) {
            // Draw loop
            let vertex = v1;
            let length = 50;
            let height = 20;

            ctx.beginPath();
            ctx.moveTo(vertex.x, vertex.y);
            ctx.bezierCurveTo(vertex.x + length / 2, vertex.y + height, vertex.x + length, vertex.y + height, vertex.x + length, vertex.y);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(vertex.x, vertex.y);
            ctx.bezierCurveTo(vertex.x + length / 2, vertex.y - height, vertex.x + length, vertex.y - height, vertex.x + length, vertex.y);
            ctx.stroke();
            ctx.closePath();

            // Write loop count into loop, if > 1
            if (occurences > 1) {
                ctx.fillStyle = colorSet.getEdgeColor(this);
                ctx.fillText(occurences, vertex.x + length / 2, vertex.y + 5);
            }
        } else if (multiEdge) {
            // Draw multiple edges with bezier curves
            let vectorLen = 20;
            let steps = vectorLen * 2 / (occurences - 1);
            let curr = vectorLen - multiEdgeIndex * steps;

            let update = vectorLen / 4;
            if (curr > 0) {
                // Control points are perpendicular to edge
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, curr);

                let control1 = new Point(v1.x + controlVec.x, v1.y + controlVec.y);
                let control2 = new Point(v2.x + controlVec.x, v2.y + controlVec.y);
                controlVec = changeVectorLength(controlVec, curr - update);
                startPoint.x += controlVec.x;
                startPoint.y += controlVec.y;

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, v2.x, v2.y);
                ctx.stroke();
                ctx.closePath();
                // Log control1.x, control1.y, control2.x, control2.y, v2.x, v2.y
            } else if (curr < 0) {
                curr = -1 * curr;

                let controlVec = new Point(-dy, dx);
                controlVec = changeVectorLength(controlVec, curr);

                let control1 = new Point(v1.x + controlVec.x, v1.y + controlVec.y);
                let control2 = new Point(v2.x + controlVec.x, v2.y + controlVec.y);
                controlVec = changeVectorLength(controlVec, curr - update);
                startPoint.x += controlVec.x;
                startPoint.y += controlVec.y;

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, v2.x, v2.y);
                ctx.stroke();
                ctx.closePath();
            }
            if (this.weight != null) {
                let vecLen = this.weight.toString().length * 7;
                ctx.fillStyle = colorSet.getEdgeColor(this);
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, vecLen);
                controlVec = controlVec.y < 0 ? controlVec : changeVectorLength(new Point(-dy, dx), vecLen);
                ctx.fillText(this.weight, startPoint.x + controlVec.x, startPoint.y + controlVec.y);
            }
        }

        // Arrow for normal edge direction
        let deg90Vec = new Point(dy, -dx);
        let deg45Vec1 = new Point(dx - (dx - deg90Vec.x) / 2, dy - (dy - deg90Vec.y) / 2);
        deg45Vec1 = changeVectorLength(deg45Vec1, 10);
        let deg90Vec2 = new Point(-deg90Vec.x, -deg90Vec.y);
        let deg45Vec2 = new Point(dx - (dx - deg90Vec2.x) / 2, dy - (dy - deg90Vec2.y) / 2);
        deg45Vec2 = changeVectorLength(deg45Vec2, 10);

        // Changes if reverse edge direction
        if ((this.orientation == EdgeOrientation.REVERSED && !revPoints)
            || (this.orientation == EdgeOrientation.NORMAL && revPoints)) {
            deg45Vec1 = new Point(-deg45Vec1.x, -deg45Vec1.y);
            deg45Vec2 = new Point(-deg45Vec2.x, -deg45Vec2.y);
        }
        // Draw direction arrow
        if (this.orientation != EdgeOrientation.UNDIRECTED) {
            //let startPoint = new Point(v1.x + dx / 2, v1.y + dy / 2);
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(startPoint.x - deg45Vec1.x, startPoint.y - deg45Vec1.y);
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(startPoint.x - deg45Vec2.x, startPoint.y - deg45Vec2.y);
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }
    }

    eq(other, withId = false, withWeightAndOrient = false) {
        let idEq = withId ? this.id == other.id : true;
        let weightOrientEq = withWeightAndOrient ? (this.weight == other.weight && this.orientation == other.orientation) : true;
        return (this.v1nr == other.v1nr && this.v2nr == other.v2nr && idEq && weightOrientEq)
            || (this.v1nr == other.v2nr && this.v2nr == other.v1nr && idEq && weightOrientEq);
        // Also equal if edges are reversed
        // return (this.v1.eq(other.v1) && this.v2.eq(other.v2) && idEq)
        //     || (this.v1.eq(other.v2) && this.v2.eq(other.v1) && idEq);
    }

    print() {
        let idString = (this.id == null ? "" : " id: " + this.id);
        return "Edge " + this.v1nr + " " + this.v2nr + " (" + this.orientation + ")" + idString;
    }

    /**
     * A short string representation of the edge, depending on the orientation.
     * 
     * @returns {string} A string representation of the edge, depending on the orientation.
     */
    prt() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
                return this.v1nr + " -- " + this.v2nr;
            case EdgeOrientation.NORMAL:
                return this.v1nr + " -> " + this.v2nr;
            case EdgeOrientation.REVERSED:
                return this.v2nr + " -> " + this.v1nr;
        }
    }
}

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