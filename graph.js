var fgCanvas = $("#fgCanvas")[0];
var vertexCount = 0;

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.number = vertexCount++;
        this.radius = 15;
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
        ctx.fillText(this.number, this.x, this.y);
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
        return this.x == other.x && this.y == other.y;
    }

    print() {
        return "Vertex " + this.number;
    }
}

class Edge {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
        this.thickness = 5;
        this.color = "gray";
    }

    draw(selectedEdge, multiEdge = false) {
        var ctx = fgCanvas.getContext("2d");
        if (selectedEdge == this) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 7;
        } else {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
        }
        if (!multiEdge) {
            ctx.beginPath();
            ctx.moveTo(this.v1.x, this.v1.y);
            ctx.lineTo(this.v2.x, this.v2.y);
            ctx.stroke();
            ctx.closePath();
        } else {
            // Draw multiple edges with bezier curves
            let dx = this.v2.x - this.v1.x;
            let dy = this.v2.y - this.v1.y;
            let vectorLen = 60;
            
            // Control points are perpendicular to edge
            let controlVec = new Point(dy, -dx);
            controlVec = changeVectorLength(controlVec, vectorLen);
            
            let control1 = new Point(this.v1.x + controlVec.x, this.v1.y + controlVec.y);
            let control2 = new Point(this.v2.x + controlVec.x, this.v2.y + controlVec.y);

            ctx.moveTo(this.v1.x, this.v1.y);
            ctx.beginPath();
            ctx.moveTo(this.v1.x, this.v1.y);
            ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, this.v2.x, this.v2.y);
            ctx.stroke();
            ctx.closePath();

            controlVec = new Point(-dy, dx);
            controlVec = changeVectorLength(controlVec, vectorLen);
            
            control1 = new Point(this.v1.x + controlVec.x, this.v1.y + controlVec.y);
            control2 = new Point(this.v2.x + controlVec.x, this.v2.y + controlVec.y);

            ctx.beginPath();
            ctx.moveTo(this.v1.x, this.v1.y);
            ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, this.v2.x, this.v2.y);
            ctx.stroke();
            ctx.closePath();
        }
    }

    eq(other) {
        // Also equal if edges are reversed
        return (this.v1.x == other.v1.x && this.v1.y == other.v1.y && this.v2.x == other.v2.x && this.v2.y == other.v2.y)
            || (this.v1.x == other.v2.x && this.v1.y == other.v2.y && this.v2.x == other.v1.x && this.v2.y == other.v1.y);
    }

    print() {
        return "Edge " + this.v1.number + " " + this.v2.number;
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
            console.log("edge dist " + pointLineDist(edge.v1, edge.v2, clickPoint));
            if (pointLineDist(edge.v1, edge.v2, clickPoint) <= 20) {
                return edge;
            }
        }
        console.log("getEdgeAt: no edge found");
        return null;
    }

    draw(selectedVertex, selectedEdge) {
        console.log("drawGraph");
        let multiEdges = this.getMultiEdges();
        $.each(multiEdges, function (_i, edge) {
            edge.draw(selectedEdge, true);
        });
        let otherEdgesToDraw = [];
        $.each(graph.edges, function (_i, edge) {
            if (eqIndexOf(multiEdges, edge) == -1) {
                otherEdgesToDraw.push(edge);
            }
        });
        $.each(otherEdgesToDraw, function (_i, edge) {
            edge.draw(selectedEdge);
        });
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].draw(selectedVertex);
        }
    }

    expandEdge(edge) {
        let middleVertex = new Vertex((edge.v1.x + edge.v2.x) / 2, (edge.v1.y + edge.v2.y) / 2);
        let edge1 = new Edge(edge.v1, middleVertex);
        let edge2 = new Edge(middleVertex, edge.v2);
        addVertex(middleVertex);
        this.edges.push(edge1);
        this.edges.push(edge2);
        this.edges.splice(this.edges.indexOf(edge), 1);
    }

    contractEdge(edge) {
        let middleVertex = new Vertex((edge.v1.x + edge.v2.x) / 2, (edge.v1.y + edge.v2.y) / 2);
        let vertexLeft = edge.v1;
        let vertexRight = edge.v2;
        $.each(this.edges, function (_index, edge) {
            if (edge.v1 == vertexLeft || edge.v1 == vertexRight) {
                edge.v1 = middleVertex;
            }
            if (edge.v2 == vertexLeft || edge.v2 == vertexRight) {
                edge.v2 = middleVertex;
            }
        });
        deleteVertex(vertexLeft);
        deleteVertex(vertexRight);
        addVertex(middleVertex);
    }

    // Gets all edges incident to vertex
    getIncidentEdges(vertex) {
        let x = vertex.x;
        let y = vertex.y;
        let incidentEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if (edge.v1.eq(vertex) || edge.v2.eq(vertex)) {
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
        $.each(this.getIncidentEdges(vertex), function (_index, edge) {
            if (edge.v1.eq(vertex)) {
                neighbours.push(edge.v2);
            }
            if (edge.v2.eq(vertex)) {
                neighbours.push(edge.v1);
            }
        });
        //console.log("getAllNeighbours: " + JSON.stringify(sortClockwise(vertex, neighbours)));

        return sortClockwise(vertex, neighbours);
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

    isPlanarEmbedded() {
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            for (let j = i + 1; j < this.edges.length; j++) {
                let other = this.edges[j];
                if (doIntersect(edge.v1, edge.v2, other.v1, other.v2)) {
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
}

graph = new Graph();

function sortClockwise(vertex, vertices) {
    return vertices.sort(function (x, y) {
        if (getAngle(vertex, x) < getAngle(vertex, y)) {
            return -1;
        }
        if (getAngle(vertex, x) > getAngle(vertex, y)) {
            return 1;
        }
        return 0;
    });
}

// Get the angle in degrees between 0 o'clock from the vertex and the vertex's neighbor
function getAngle(vertex, neighbour) {
    var dAx = 0;
    var dAy = -1;
    var dBx = neighbour.x - vertex.x;
    var dBy = neighbour.y - vertex.y;
    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);

    var degree_angle = Math.abs(angle * (180 / Math.PI));
    if (angle < 0) degree_angle = 360 - Math.abs(degree_angle);

    return degree_angle;
}

function changeVectorLength(vector, length) {
    let vectorLength = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    return new Point(vector.x * length / vectorLength, vector.y * length / vectorLength);
}