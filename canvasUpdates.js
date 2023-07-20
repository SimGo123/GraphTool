var fgCanvas = $("#fgCanvas")[0];

var canvasWalls = [];

var vertices = [];
var selectedVertex = null;

var edges = [];
var selectedEdge = null;

const Orientation = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

class Wall {
    constructor(x, y, width, orientation = Orientation.HORIZONTAL) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.orientation = orientation;
    }

    static get thickness() {
        return 10;
    }

    static get color() {
        return "gray";
    }
}

fgCanvas.addEventListener("click", function (event) {
    console.log("fgCanvas click");
    var rect = fgCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (currentMode == Modes.VERTICES) {
        var vertex = new Vertex(x, y);
        graph.addVertex(vertex);
        changeVertexToolsVisible(false);
        changeEdgeToolsVisible(false);
    } else if (currentMode == Modes.EDGES) {
        if (selectedVertex == null) {
            var vertex = graph.getVertexAt(x, y);
            if (vertex != null) {
                selectedVertex = vertex;
            }
        } else if (selectedVertex != null) {
            var vertex = graph.getVertexAt(x, y);
            if (vertex != null) {
                var edge = new Edge(selectedVertex.number, vertex.number);
                graph.addEdge(edge);
                selectedVertex = null;
            }
        }
        changeVertexToolsVisible(false);
        changeEdgeToolsVisible(false);
    } else if (currentMode == Modes.SELECTION) {
        var vertex = graph.getVertexAt(x, y);
        var edge = graph.getEdgeAt(x, y);
        if (vertex != null) {
            if (selectedVertex == null) {
                selectedVertex = vertex;
                changeVertexToolsVisible(true);
            }
            else {
                selectedVertex = null;
                changeVertexToolsVisible(false);
            }
            selectedEdge = null;
            changeEdgeToolsVisible(false);
        } else {
            if (selectedVertex != null) {
                selectedVertex.x = x;
                selectedVertex.y = y;
                selectedVertex = null;
                selectedEdge = null;
                changeVertexToolsVisible(true);
                changeEdgeToolsVisible(false);
            } else {
                selectedVertex = null;
                if (edge != null && edge != selectedEdge) {
                    selectedEdge = edge;
                    changeEdgeToolsVisible(true);
                } else {
                    selectedEdge = null;
                    changeEdgeToolsVisible(false);
                }
                changeVertexToolsVisible(false);
            }
        }
    }

    redrawAll();
});

function vertexToolClick(param) {
    if (selectedVertex == null) {
        return;
    }
    if (param == VertexTools.DELETE) {
        graph.deleteVertex(selectedVertex);
        selectedVertex = null;
        changeVertexToolsVisible(false);
        redrawAll();
    }
}

function edgeToolClick(param) {
    if (selectedEdge == null) {
        return;
    }
    if (param == EdgeTools.DELETE) {
        graph.deleteEdge(selectedEdge);
        selectedEdge = null;
    } else if (param == EdgeTools.EXPAND) {
        graph.expandEdge(selectedEdge);
    } else if (param == EdgeTools.CONTRACT) {
        graph.contractEdge(selectedEdge);
    }
    changeEdgeToolsVisible(false);
    redrawAll();
}


// Called initially
function onload() {
    drawCanvases();
    redrawAll();
}

// Called on resize
function onresize() {
    drawCanvases();
    redrawAll();
}

function drawCanvases() {
    fgCanvas.width = window.innerWidth - 50;
    fgCanvas.height = window.innerHeight - 310;
}

// Draw the outer walls of the canvas
function drawCanvasWalls() {
    console.log("drawCanvasWalls");

    canvasWalls = [];
    canvasWalls.push(new Wall(0, 0, fgCanvas.width, Orientation.HORIZONTAL));
    canvasWalls.push(new Wall(0, fgCanvas.height - Wall.thickness, fgCanvas.width, Orientation.HORIZONTAL));
    canvasWalls.push(new Wall(0, 0, fgCanvas.height, Orientation.VERTICAL));
    canvasWalls.push(new Wall(fgCanvas.width - Wall.thickness, 0, fgCanvas.height, Orientation.VERTICAL));

    var ctx = fgCanvas.getContext("2d");
    ctx.fillStyle = Wall.color;
    for (let i = 0; i < canvasWalls.length; i++) {
        let wall = canvasWalls[i];
        if (wall.orientation == Orientation.HORIZONTAL) {
            ctx.fillRect(wall.x, wall.y, wall.width, Wall.thickness);
        } else {
            ctx.fillRect(wall.x, wall.y, Wall.thickness, wall.width);
        }
    }
}

function clearFgCanvas() {
    console.log("clearFgCanvas");
    var ctx = fgCanvas.getContext("2d");
    ctx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
}

function redrawAll() {
    console.log("redrawAll");
    clearFgCanvas();
    drawCanvasWalls();
    graph.draw(selectedVertex, selectedEdge);
}