var fgCanvas = $("#fgCanvas")[0];
var vertexCount = 0;

var vertexRadius = 15;

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
        this.highlightColor = "red";
        this.color = "gray";
    }

    draw(selectedVertex) {
        var ctx = fgCanvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = this.color;
        let metrics = ctx.measureText(this.number);
        let txtWidth = metrics.width;
        let txtHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        ctx.fillText(this.number, this.x - txtWidth / 2, this.y + txtHeight / 2);
        ctx.closePath();

        if (selectedVertex == this) {
            // Draw highlighting circle around vertex
            ctx.strokeStyle = this.highlightColor;
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

class Edge {
    constructor(v1nr, v2nr, id = null, weight = null) {
        this.v1nr = v1nr;
        this.v2nr = v2nr;
        this.id = id;
        this.weight = weight;
        this.thickness = 5;
        this.color = "gray";
    }

    draw(pGraph, selectedEdge, multiEdge = false, loop = false, occurences = 1) {
        let v1 = pGraph.getVertexByNumber(this.v1nr);
        let v2 = pGraph.getVertexByNumber(this.v2nr);
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        var ctx = fgCanvas.getContext("2d");
        if (selectedEdge == this) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 7;
        } else {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
        }
        if (occurences == 1 || occurences % 2 != 0) {
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
            ctx.closePath();
            if (this.weight != null) {
                let vecLen = this.weight.toString().length * 7;
                ctx.fillStyle = "gray";
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, vecLen);
                controlVec = controlVec.y < 0 ? controlVec : changeVectorLength(new Point(-dy, dx), vecLen);
                ctx.fillText(this.weight, (v1.x + v2.x) / 2 + controlVec.x, (v1.y + v2.y) / 2 + controlVec.y);
            }
        }
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
                ctx.fillStyle = this.color;
                ctx.fillText(occurences, vertex.x + length / 2, vertex.y + 5);
            }
        } else if (multiEdge) {
            // Draw multiple edges with bezier curves
            let vectorLen = 60;
            let steps = vectorLen * 2 / (occurences - 1);
            console.log("occurences " + occurences);
            console.log("step " + steps);

            for (let i = vectorLen; i > 0; i -= steps) {
                console.log(i);
                // Control points are perpendicular to edge
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, i);

                let control1 = new Point(v1.x + controlVec.x, v1.y + controlVec.y);
                let control2 = new Point(v2.x + controlVec.x, v2.y + controlVec.y);

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, v2.x, v2.y);
                ctx.stroke();
                ctx.closePath();

                controlVec = new Point(-dy, dx);
                controlVec = changeVectorLength(controlVec, i);

                control1 = new Point(v1.x + controlVec.x, v1.y + controlVec.y);
                control2 = new Point(v2.x + controlVec.x, v2.y + controlVec.y);

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, v2.x, v2.y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    eq(other, withId = false) {
        let idEq = withId ? this.id == other.id : true;
        return (this.v1nr == other.v1nr && this.v2nr == other.v2nr && idEq)
            || (this.v1nr == other.v2nr && this.v2nr == other.v1nr && idEq);
        // Also equal if edges are reversed
        // return (this.v1.eq(other.v1) && this.v2.eq(other.v2) && idEq)
        //     || (this.v1.eq(other.v2) && this.v2.eq(other.v1) && idEq);
    }

    print() {
        let idString = (this.id == null ? "" : " id: " + this.id);
        return "Edge " + this.v1nr + " " + this.v2nr + idString;
    }
}

class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
    }

    addVertex(vertex) {
        this.vertices.push(vertex);
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    deleteEdge(edge) {
        this.edges.splice(eqIndexOf(this.edges, edge), 1);
    }

    deleteVertex(vertex) {
        // Delete all edges connected to vertex
        for (let i = this.edges.length - 1; i >= 0; i--) {
            let edge = this.edges[i];
            if (edge.v1 == vertex || edge.v2 == vertex) {
                this.edges.splice(i, 1);
            }
        }
        this.vertices.splice(this.vertices.indexOf(vertex), 1);
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

    draw(selectedVertex, selectedEdge) {
        let loops = this.getLoops();
        for (let i = 0; i < loops.length; i++) {
            let loop = loops[i];
            let occurrences = 0;
            $.each(this.edges, function (_j, otherEdge) {
                if (loop.eq(otherEdge)) {
                    occurrences++;
                }
            });
            loop.draw(this, selectedEdge, false, true, occurrences);
        }
        let multiEdges = this.getMultiEdges();
        for (let i = 0; i < multiEdges.length; i++) {
            let multiEdge = multiEdges[i];
            if (eqIndexOf(loops, multiEdge) != -1) {
                continue;
            }
            let occurrences = 0;
            console.log(this.edges.length + " edges");
            $.each(this.edges, function (_j, otherEdge) {
                if (multiEdge.eq(otherEdge)) {
                    occurrences++;
                }
            });
            multiEdge.draw(this, selectedEdge, true, false, occurrences);
        }
        let otherEdgesToDraw = [];
        $.each(this.edges, function (_i, edge) {
            if (eqIndexOf(multiEdges, edge) == -1) {
                otherEdgesToDraw.push(edge);
            }
        });
        for (let i = 0; i < otherEdgesToDraw.length; i++) {
            let edge = otherEdgesToDraw[i];
            edge.draw(this, selectedEdge);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].draw(selectedVertex);
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
    }

    // Gets all edges incident to vertex
    getIncidentEdges(vertex) {
        let incidentEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if (edge.v1nr == vertex.number || edge.v2nr == vertex.number) {
                incidentEdges.push(edge);
            }
        }
        return incidentEdges;
    }

    getVertexDegree(vertex) {
        return this.getIncidentEdges(vertex).length;
    }

    // Returns an array of all vertices connected to vertex, in clockwise embedding order
    getAllNeighbours(vertex) {
        let neighbours = [];
        for (let i = 0; i < this.getIncidentEdges(vertex).length; i++) {
            let edge = this.getIncidentEdges(vertex)[i];
            if (edge.v1nr == vertex.number) {
                neighbours.push(this.getVertexByNumber(edge.v2nr));
            }
            if (edge.v2nr == vertex.number) {
                neighbours.push(this.getVertexByNumber(edge.v1nr));
            }
        }
        //console.log("getAllNeighbours: " + JSON.stringify(sortClockwise(vertex, neighbours)));

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
                let newVisited = depthFirstSearch(this.vertices[i]);
                components.push(newVisited);
                visited = visited.concat(newVisited);
            }
        }
        console.log("Found " + components.length + " connected components");
        return components;
    }

    isTriangulated() {
        if (this.getMultiEdges().length > 0 || this.getLoops().length > 0
            || this.getConnectedComponents().length > 1) {
            console.log('isTriangulated: preconditions failed');
            return false;
        }
        let isTriangulated = true;
        let allFacets = getAllFacets();
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
        let allFacets = getAllFacets();
        let vertexFacets = [];
        for (let i = 0; i < allFacets.length; i++) {
            let facet = allFacets[i];
            let facetCenter = getFacetCenter(facet);
            let vertex = new Vertex(facetCenter.x, facetCenter.y);
            dualGraph.addVertex(vertex);
            vertexFacets.push(new VertexFacet(vertex.number, facet));
        }
        $.each(graph.edges, function (_index, edge) {
            let v1nr = -1;
            let v2nr = -1;
            for (let i = 0; i < allFacets.length; i++) {
                if (eqIndexOf(allFacets[i], edge) != -1) {
                    for (let j = i + 1; j < allFacets.length; j++) {
                        if (eqIndexOf(allFacets[j], edge) != -1) {
                            $.each(vertexFacets, function (_index, vFac) {
                                if (allFacets[i] == vFac.facet) {
                                    v1nr = vFac.vertexNumber;
                                }
                                if (allFacets[j] == vFac.facet) {
                                    v2nr = vFac.vertexNumber;
                                }
                            });
                        }
                    }
                }
            }
            if (v1nr == -1 || v2nr == -1) {
                console.log("Error: didn't find adjacent facets of edge " + edge.print());
                console.log('v1 ' + v1nr + ' v2 ' + v2nr);
            } else {
                // Keep weights in dual graph
                dualGraph.addEdge(new Edge(v1nr, v2nr, null, edge.weight));
            }
        });
        return dualGraph;
    }

    getCopy() {
        let copy = new Graph();
        $.each(this.vertices, function (_index, vertex) {
            copy.addVertex(new Vertex(vertex.x, vertex.y, vertex.number));
        });
        $.each(this.edges, function (_index, edge) {
            copy.addEdge(new Edge(edge.v1nr, edge.v2nr, edge.id, edge.weight));
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
}

graph = new Graph();