const PREDEFINEDS = {
    GET_CURR: 0,
    FROM_JSON: 1,
    DEBUG_GRAPH: 2,
    SIGMA_GRAPH: 3,
    STAR_GRAPH: 4,
    TRIANGULATED_STAR_GRAPH: 5,
    BIG_MY_GRAPH: 6,
    WHEEL_GRAPH: 7,
};

function predefinedClick(param) {
    if (param == PREDEFINEDS.GET_CURR) {
        let jsonGraph = {};
        jsonGraph.vertices = [];
        for (let i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            jsonGraph.vertices.push({ "x": vertex.x, "y": vertex.y, "nr": vertex.number });
        }
        jsonGraph.edges = [];
        for (let i = 0; i < graph.edges.length; i++) {
            let edge = graph.edges[i];
            let v1nr = -1;
            let v2nr = -1;
            for (let j = 0; j < graph.vertices.length; j++) {
                if (graph.vertices[j].eq(edge.v1)) {
                    v1nr = graph.vertices[j].number;
                }
                if (graph.vertices[j].eq(edge.v2)) {
                    v2nr = graph.vertices[j].number;
                }
            }
            jsonGraph.edges.push({ "v1nr": v1nr, "v2nr": v2nr });
        }
        window.alert(JSON.stringify(jsonGraph));
    } else if (param == PREDEFINEDS.FROM_JSON) {
        let jsonGraphStr = window.prompt("Enter JSON graph:");
        try {
            loadGraphFromJson(jsonGraphStr);
        } catch (e) {
            window.alert("Invalid JSON graph!");
        }
    } else if (param == PREDEFINEDS.DEBUG_GRAPH) {
        const debugGraph = '{"vertices":[{"x":100,"y":300,"nr":0},{"x":200,"y":300,"nr":1},{"x":300,"y":300,"nr":2},{"x":200,"y":200,"nr":3},{"x":200,"y":100,"nr":4}],"edges":[{"v1nr":4,"v2nr":3},{"v1nr":3,"v2nr":0},{"v1nr":0,"v2nr":1},{"v1nr":1,"v2nr":2},{"v1nr":2,"v2nr":3},{"v1nr":3,"v2nr":1}]}';
        loadGraphFromJson(debugGraph);
    } else if (param == PREDEFINEDS.SIGMA_GRAPH) {
        const sigmaGraph = '{"vertices":[{"x":242,"y":121.80000305175781,"nr":0},{"x":534,"y":135.8000030517578,"nr":1},{"x":394,"y":259.8000030517578,"nr":2},{"x":255,"y":348.8000030517578,"nr":3},{"x":515,"y":339.8000030517578,"nr":4}],"edges":[{"v1nr":0,"v2nr":1},{"v1nr":1,"v2nr":2},{"v1nr":2,"v2nr":4},{"v1nr":4,"v2nr":3}]}';
        loadGraphFromJson(sigmaGraph);
    } else if (param == PREDEFINEDS.STAR_GRAPH) {
        const starGraph = '{"vertices":[{"x":348,"y":251.8000030517578,"nr":0},{"x":351,"y":140.8000030517578,"nr":1},{"x":456,"y":198.8000030517578,"nr":2},{"x":445,"y":308.8000030517578,"nr":3},{"x":299,"y":327.8000030517578,"nr":4},{"x":252,"y":215.8000030517578,"nr":5}],"edges":[{"v1nr":1,"v2nr":0},{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5}]}';
        loadGraphFromJson(starGraph);
    } else if (param == PREDEFINEDS.TRIANGULATED_STAR_GRAPH) {
        const triangulatedStarGraph = '{"vertices":[{"x":210,"y":89.19999694824219,"nr":0},{"x":542,"y":80.19999694824219,"nr":1},{"x":608,"y":337.1999969482422,"nr":2},{"x":505,"y":227.1999969482422,"nr":3},{"x":465,"y":174.1999969482422,"nr":4},{"x":397,"y":125.19999694824219,"nr":5}],"edges":[{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5},{"v1nr":1,"v2nr":2},{"v1nr":3,"v2nr":4},{"v1nr":5,"v2nr":1},{"v1nr":1,"v2nr":4},{"v1nr":1,"v2nr":3},{"v1nr":5,"v2nr":4},{"v1nr":3,"v2nr":2},{"v1nr":1,"v2nr":0}]}';
        loadGraphFromJson(triangulatedStarGraph);
    } else if (param == PREDEFINEDS.BIG_MY_GRAPH) {
        const bigMyGraph = '{"vertices":[{"x":393,"y":19.199996948242188,"nr":0},{"x":23,"y":201.1999969482422,"nr":1},{"x":66,"y":189.1999969482422,"nr":2},{"x":102,"y":178.1999969482422,"nr":3},{"x":138,"y":166.1999969482422,"nr":4},{"x":166,"y":158.1999969482422,"nr":5},{"x":190,"y":149.1999969482422,"nr":6},{"x":218,"y":137.1999969482422,"nr":7},{"x":242,"y":129.1999969482422,"nr":8},{"x":261,"y":118.19999694824219,"nr":9},{"x":282,"y":109.19999694824219,"nr":10},{"x":304,"y":105.19999694824219,"nr":11},{"x":326,"y":101.19999694824219,"nr":12},{"x":342,"y":89.19999694824219,"nr":13},{"x":359,"y":77.19999694824219,"nr":14},{"x":377,"y":69.19999694824219,"nr":15},{"x":394,"y":63.19999694824219,"nr":16},{"x":420,"y":59.19999694824219,"nr":17},{"x":658,"y":154.1999969482422,"nr":18}],"edges":[{"v1nr":0,"v2nr":1},{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5},{"v1nr":0,"v2nr":6},{"v1nr":0,"v2nr":7},{"v1nr":0,"v2nr":8},{"v1nr":0,"v2nr":9},{"v1nr":0,"v2nr":10},{"v1nr":0,"v2nr":11},{"v1nr":0,"v2nr":12},{"v1nr":0,"v2nr":13},{"v1nr":0,"v2nr":14},{"v1nr":0,"v2nr":15},{"v1nr":0,"v2nr":16},{"v1nr":0,"v2nr":17},{"v1nr":0,"v2nr":18},{"v1nr":17,"v2nr":18},{"v1nr":16,"v2nr":18},{"v1nr":15,"v2nr":18},{"v1nr":14,"v2nr":18},{"v1nr":13,"v2nr":18},{"v1nr":12,"v2nr":18},{"v1nr":11,"v2nr":18},{"v1nr":10,"v2nr":18},{"v1nr":9,"v2nr":18},{"v1nr":8,"v2nr":18},{"v1nr":7,"v2nr":18},{"v1nr":6,"v2nr":18},{"v1nr":5,"v2nr":18},{"v1nr":4,"v2nr":18},{"v1nr":3,"v2nr":18},{"v1nr":2,"v2nr":18},{"v1nr":1,"v2nr":18},{"v1nr":1,"v2nr":2},{"v1nr":2,"v2nr":3},{"v1nr":3,"v2nr":4},{"v1nr":4,"v2nr":5},{"v1nr":5,"v2nr":6},{"v1nr":6,"v2nr":7},{"v1nr":7,"v2nr":8},{"v1nr":8,"v2nr":9},{"v1nr":9,"v2nr":10},{"v1nr":10,"v2nr":11},{"v1nr":11,"v2nr":12},{"v1nr":12,"v2nr":13},{"v1nr":13,"v2nr":14},{"v1nr":14,"v2nr":15},{"v1nr":15,"v2nr":16},{"v1nr":16,"v2nr":17}]}';
        loadGraphFromJson(bigMyGraph);
    } else if (param == PREDEFINEDS.WHEEL_GRAPH) {
        let nodes = 40;
        let radius = (nodes * 40) / (2 * Math.PI);
        let fgCanvas = $('#fgCanvas')[0];
        let center = { x: fgCanvas.width / 2, y: fgCanvas.height / 2 };
        let anglePerNode = (2 * Math.PI) / nodes;
        graph = new Graph();
        for (let i = 0; i < nodes; i++) {
            let angle = i * anglePerNode;
            console.log('angle: ' + angle + ' rad');
            let x = center.x + radius * Math.cos(angle);
            let y = center.y + radius * Math.sin(angle);
            graph.addVertex(new Vertex(x, y, i));
        }
        redrawAll();
    }
    // const Graph = '{"vertices":[{"x":318,"y":262.8000030517578,"nr":0},{"x":289,"y":160.8000030517578,"nr":1},{"x":315,"y":162.8000030517578,"nr":2},{"x":349,"y":168.8000030517578,"nr":3},{"x":370,"y":177.8000030517578,"nr":4},{"x":385,"y":200.8000030517578,"nr":5},{"x":398,"y":234.8000030517578,"nr":6},{"x":398,"y":257.8000030517578,"nr":7},{"x":389,"y":289.8000030517578,"nr":8},{"x":378,"y":310.8000030517578,"nr":9},{"x":350,"y":330.8000030517578,"nr":10},{"x":317,"y":335.8000030517578,"nr":11},{"x":291,"y":334.8000030517578,"nr":12},{"x":274,"y":330.8000030517578,"nr":13},{"x":258,"y":314.8000030517578,"nr":14},{"x":238,"y":284.8000030517578,"nr":15},{"x":230,"y":263.8000030517578,"nr":16},{"x":226,"y":237.8000030517578,"nr":17},{"x":227,"y":212.8000030517578,"nr":18},{"x":233,"y":186.8000030517578,"nr":19},{"x":254,"y":169.8000030517578,"nr":20},{"x":312,"y":22.800003051757812,"nr":21},{"x":34,"y":494.8000030517578,"nr":22},{"x":658,"y":505.8000030517578,"nr":23}],"edges":[{"v1nr":22,"v2nr":23},{"v1nr":23,"v2nr":21},{"v1nr":21,"v2nr":22},{"v1nr":14,"v2nr":22},{"v1nr":14,"v2nr":13},{"v1nr":13,"v2nr":12},{"v1nr":12,"v2nr":11},{"v1nr":11,"v2nr":10},{"v1nr":10,"v2nr":9},{"v1nr":9,"v2nr":8},{"v1nr":8,"v2nr":7},{"v1nr":7,"v2nr":6},{"v1nr":6,"v2nr":5},{"v1nr":5,"v2nr":4},{"v1nr":4,"v2nr":3},{"v1nr":3,"v2nr":2},{"v1nr":2,"v2nr":1},{"v1nr":1,"v2nr":20},{"v1nr":20,"v2nr":19},{"v1nr":19,"v2nr":18},{"v1nr":18,"v2nr":17},{"v1nr":17,"v2nr":16},{"v1nr":16,"v2nr":15},{"v1nr":15,"v2nr":14},{"v1nr":2,"v2nr":21},{"v1nr":9,"v2nr":23},{"v1nr":14,"v2nr":0},{"v1nr":0,"v2nr":13},{"v1nr":0,"v2nr":12},{"v1nr":0,"v2nr":11},{"v1nr":0,"v2nr":10},{"v1nr":0,"v2nr":9}]}';
    //let otherCase2graph = '{"vertices":[{"x":318,"y":262.8000030517578,"nr":0},{"x":289,"y":160.8000030517578,"nr":1},{"x":315,"y":162.8000030517578,"nr":2},{"x":349,"y":168.8000030517578,"nr":3},{"x":370,"y":177.8000030517578,"nr":4},{"x":396,"y":206.1999969482422,"nr":5},{"x":421,"y":230.1999969482422,"nr":6},{"x":398,"y":257.8000030517578,"nr":7},{"x":389,"y":289.8000030517578,"nr":8},{"x":378,"y":310.8000030517578,"nr":9},{"x":350,"y":330.8000030517578,"nr":10},{"x":317,"y":335.8000030517578,"nr":11},{"x":291,"y":334.8000030517578,"nr":12},{"x":274,"y":330.8000030517578,"nr":13},{"x":258,"y":314.8000030517578,"nr":14},{"x":238,"y":284.8000030517578,"nr":15},{"x":230,"y":263.8000030517578,"nr":16},{"x":226,"y":237.8000030517578,"nr":17},{"x":227,"y":212.8000030517578,"nr":18},{"x":233,"y":186.8000030517578,"nr":19},{"x":254,"y":169.8000030517578,"nr":20},{"x":312,"y":22.800003051757812,"nr":21},{"x":34,"y":494.8000030517578,"nr":22},{"x":658,"y":505.8000030517578,"nr":23}],"edges":[{"v1nr":22,"v2nr":23},{"v1nr":23,"v2nr":21},{"v1nr":21,"v2nr":22},{"v1nr":14,"v2nr":22},{"v1nr":14,"v2nr":13},{"v1nr":13,"v2nr":12},{"v1nr":12,"v2nr":11},{"v1nr":11,"v2nr":10},{"v1nr":10,"v2nr":9},{"v1nr":9,"v2nr":8},{"v1nr":8,"v2nr":7},{"v1nr":7,"v2nr":6},{"v1nr":6,"v2nr":5},{"v1nr":5,"v2nr":4},{"v1nr":4,"v2nr":3},{"v1nr":3,"v2nr":2},{"v1nr":2,"v2nr":1},{"v1nr":1,"v2nr":20},{"v1nr":20,"v2nr":19},{"v1nr":19,"v2nr":18},{"v1nr":18,"v2nr":17},{"v1nr":17,"v2nr":16},{"v1nr":16,"v2nr":15},{"v1nr":15,"v2nr":14},{"v1nr":2,"v2nr":21},{"v1nr":9,"v2nr":23},{"v1nr":14,"v2nr":0},{"v1nr":0,"v2nr":13},{"v1nr":0,"v2nr":12},{"v1nr":0,"v2nr":11},{"v1nr":0,"v2nr":10},{"v1nr":0,"v2nr":9},{"v1nr":0,"v2nr":15},{"v1nr":0,"v2nr":16},{"v1nr":0,"v2nr":17},{"v1nr":0,"v2nr":18},{"v1nr":0,"v2nr":19},{"v1nr":0,"v2nr":20},{"v1nr":0,"v2nr":1},{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5},{"v1nr":0,"v2nr":6},{"v1nr":0,"v2nr":7},{"v1nr":0,"v2nr":8},{"v1nr":10,"v2nr":23},{"v1nr":23,"v2nr":11},{"v1nr":13,"v2nr":22},{"v1nr":22,"v2nr":12},{"v1nr":22,"v2nr":11},{"v1nr":8,"v2nr":23},{"v1nr":23,"v2nr":7},{"v1nr":23,"v2nr":6},{"v1nr":3,"v2nr":21},{"v1nr":21,"v2nr":4},{"v1nr":21,"v2nr":5},{"v1nr":21,"v2nr":6},{"v1nr":21,"v2nr":1},{"v1nr":21,"v2nr":20},{"v1nr":21,"v2nr":19},{"v1nr":22,"v2nr":15},{"v1nr":22,"v2nr":16},{"v1nr":22,"v2nr":17},{"v1nr":22,"v2nr":18},{"v1nr":22,"v2nr":19}]}';

}

function loadGraphFromJson(graphString) {
    let jsonGraph = JSON.parse(graphString);
    graph = new Graph();
    vertexCount = 0;
    for (var i = 0; i < jsonGraph.vertices.length; i++) {
        var jsonVertex = jsonGraph.vertices[i];
        let nr = -1;
        // Check for new format
        if (jsonVertex.hasOwnProperty('nr')) {
            nr = jsonVertex.nr;
        }
        graph.addVertex(new Vertex(jsonVertex.x, jsonVertex.y, nr));
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
        graph.addEdge(new Edge(graph.vertices[v1idx], graph.vertices[v2idx]));
    }
    redrawAll();
}