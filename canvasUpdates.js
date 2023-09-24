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

class VertexColor {
    constructor(vertexNr, color) {
        this.vertexNr = vertexNr;
        this.color = color;
    }
}

class EdgeColor {
    constructor(edge, color) {
        this.edge = edge;
        this.color = color;
    }
}

class ColorSet {
    vertexColors = [];
    edgeColors = [];
    constructor(vertexColor = "gray", edgeColor = "gray", highlightColor = "red") {
        this.vertexColor = vertexColor;
        this.edgeColor = edgeColor;
        this.highlightColor = highlightColor;
    }

    addVertexColor(vertexNr, color) {
        this.vertexColors.push(new VertexColor(vertexNr, color));
    }
    addEdgeColor(edge, color) {
        this.edgeColors.push(new EdgeColor(edge, color));
    }

    getVertexColor(vertexNr) {
        for (let i = 0; i < this.vertexColors.length; i++) {
            if (this.vertexColors[i].vertexNr == vertexNr) {
                return this.vertexColors[i].color;
            }
        }
        return this.vertexColor;
    }
    getEdgeColor(edge) {
        for (let i = 0; i < this.edgeColors.length; i++) {
            if (this.edgeColors[i].edge.eq(edge)) {
                return this.edgeColors[i].color;
            }
        }
        return this.edgeColor;
    }
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
    var ctx = fgCanvas.getContext("2d");
    ctx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
}

function redrawAll(colorSet = new ColorSet()) {
    clearFgCanvas();
    drawCanvasWalls();
    graph.draw(selectedVertex, selectedEdge, colorSet);
}