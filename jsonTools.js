const JSON_TOOLS = {
    GET_CURR: 0,
    FROM_JSON: 1,
};

function jsonClick(param) {
    switch (param) {
        case JSON_TOOLS.GET_CURR:
            let jsonGraph = {};
            jsonGraph["canvasWidth"] = $("#fgCanvas")[0].width;
            jsonGraph["canvasHeight"] = $("#fgCanvas")[0].height;
            jsonGraph["sources"] = graph.sources;
            jsonGraph["targets"] = graph.targets;
            jsonGraph.vertices = [];
            for (let i = 0; i < graph.vertices.length; i++) {
                let vertex = graph.vertices[i];
                jsonGraph.vertices.push({ "x": Math.round(vertex.x), "y": Math.round(vertex.y), "nr": vertex.number });
            }
            jsonGraph.edges = [];
            for (let i = 0; i < graph.edges.length; i++) {
                let edge = graph.edges[i];
                jsonGraph.edges.push({ "v1nr": edge.v1nr, "v2nr": edge.v2nr, "weight": edge.weight, "orientation": edge.orientation });
            }
            window.alert(JSON.stringify(jsonGraph));
            break;
        case JSON_TOOLS.FROM_JSON:
            let jsonGraphStr = window.prompt("Enter JSON graph:");
            if (jsonGraphStr == null || jsonGraphStr == "") {
                return;
            }
            try {
                loadGraphFromJson(jsonGraphStr);
            } catch (e) {
                window.alert("Invalid JSON graph!");
            }
            break;
    }
}

function loadGraphFromJson(graphString) {
    let jsonGraph = JSON.parse(graphString);
    graph = new Graph();
    vertexCount = 0;
    if (jsonGraph.hasOwnProperty('source') && jsonGraph.hasOwnProperty('target')) {
        graph.makeSource(jsonGraph['source']);
        graph.makeTarget(jsonGraph['target']);
    }
    if (jsonGraph.hasOwnProperty('sources') && jsonGraph.hasOwnProperty('targets')) {
        graph.sources = jsonGraph['sources'];
        graph.targets = jsonGraph['targets'];
    }
    for (var i = 0; i < jsonGraph.vertices.length; i++) {
        var jsonVertex = jsonGraph.vertices[i];
        let nr = -1;
        // Check for new format
        if (jsonVertex.hasOwnProperty('nr')) {
            nr = jsonVertex.nr;
        }
        if (jsonGraph.hasOwnProperty('canvasWidth')) {
            // New format
            let originalCanvasWidth = jsonGraph.canvasWidth;
            let originalCanvasHeight = jsonGraph.canvasHeight;
            let newCanvasWidth = $("#fgCanvas")[0].width;
            let newCanvasHeight = $("#fgCanvas")[0].height;
            jsonVertex.x = (jsonVertex.x / originalCanvasWidth) * newCanvasWidth;
            jsonVertex.y = (jsonVertex.y / originalCanvasHeight) * newCanvasHeight;
        }
        let vertex = new Vertex(jsonVertex.x, jsonVertex.y, nr);
        graph.addVertex(vertex);
    }
    for (var i = 0; i < jsonGraph.edges.length; i++) {
        let jsonEdge = jsonGraph.edges[i];
        let v1idx = -1;
        let v2idx = -1;
        if (jsonEdge.hasOwnProperty('v1nr')) {
            // New format
            for (let j = 0; j < graph.vertices.length; j++) {
                if (graph.vertices[j].number == jsonEdge.v1nr) {
                    v1idx = j;
                }
                if (graph.vertices[j].number == jsonEdge.v2nr) {
                    v2idx = j;
                }
            }
        } else {
            // Old format
            console.log("Old format");
            let v1 = jsonEdge.v1;
            let v2 = jsonEdge.v2;
            v1idx = eqIndexOf(graph.vertices, v1);
            v2idx = eqIndexOf(graph.vertices, v2);
            for (var j = 0; j < graph.vertices.length; j++) {
                if (graph.vertices[j].x == v1.x && graph.vertices[j].y == v1.y) {
                    v1idx = j;
                }
                if (graph.vertices[j].x == v2.x && graph.vertices[j].y == v2.y) {
                    v2idx = j;
                }
            }
        }
        graph.addEdge(new Edge(graph.vertices[v1idx].number, graph.vertices[v2idx].number,
            null, jsonEdge.hasOwnProperty('weight') ? jsonEdge.weight : null,
            jsonEdge.hasOwnProperty('orientation') ? jsonEdge.orientation : EdgeOrientation.UNDIRECTED));
    }
    redrawAll();
}