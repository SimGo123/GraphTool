const PREDEFINEDS = {
    GET_CURR: 0,
    FROM_JSON: 1,
    DEBUG_GRAPH: 2,
    SIGMA_GRAPH: 3,
    STAR_GRAPH: 4,
    TRIANGULATED_STAR_GRAPH: 5,
    BIG_MY_GRAPH: 6,
    CASE_1_GRAPH: 7,
    WHEEL_GRAPH: 8,
    MIXED_MAX_GRAPH: 9,
    WEIGHT_MAX_GRAPH_2: 10,
};

function predefinedClick(param) {
    if (param == PREDEFINEDS.GET_CURR) {
        let jsonGraph = {};
        jsonGraph["canvasWidth"] = $("#fgCanvas")[0].width;
        jsonGraph["canvasHeight"] = $("#fgCanvas")[0].height;
        jsonGraph.vertices = [];
        for (let i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            jsonGraph.vertices.push({ "x": Math.round(vertex.x), "y": Math.round(vertex.y), "nr": vertex.number });
        }
        jsonGraph.edges = [];
        for (let i = 0; i < graph.edges.length; i++) {
            let edge = graph.edges[i];
            jsonGraph.edges.push({ "v1nr": edge.v1nr, "v2nr": edge.v2nr, "weight": edge.weight });
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
        const debugGraph = '{"canvasWidth":428,"canvasHeight":538,"vertices":[{"x":100,"y":300,"nr":0},{"x":200,"y":300,"nr":1},{"x":300,"y":300,"nr":2},{"x":200,"y":200,"nr":3},{"x":200,"y":100,"nr":4}],"edges":[{"v1nr":4,"v2nr":3},{"v1nr":3,"v2nr":0},{"v1nr":0,"v2nr":1},{"v1nr":1,"v2nr":2},{"v1nr":2,"v2nr":3},{"v1nr":3,"v2nr":1}]}';
        loadGraphFromJson(debugGraph);
    } else if (param == PREDEFINEDS.SIGMA_GRAPH) {
        const sigmaGraph = '{"canvasWidth":711,"canvasHeight":538,"vertices":[{"x":242,"y":121.80000305175781,"nr":0},{"x":534,"y":135.8000030517578,"nr":1},{"x":394,"y":259.8000030517578,"nr":2},{"x":255,"y":348.8000030517578,"nr":3},{"x":515,"y":339.8000030517578,"nr":4}],"edges":[{"v1nr":0,"v2nr":1},{"v1nr":1,"v2nr":2},{"v1nr":2,"v2nr":4},{"v1nr":4,"v2nr":3}]}';
        loadGraphFromJson(sigmaGraph);
    } else if (param == PREDEFINEDS.STAR_GRAPH) {
        const starGraph = '{"canvasWidth":839,"canvasHeight":538,"vertices":[{"x":348,"y":251.8000030517578,"nr":0},{"x":351,"y":140.8000030517578,"nr":1},{"x":456,"y":198.8000030517578,"nr":2},{"x":445,"y":308.8000030517578,"nr":3},{"x":299,"y":327.8000030517578,"nr":4},{"x":252,"y":215.8000030517578,"nr":5}],"edges":[{"v1nr":1,"v2nr":0},{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5}]}';
        loadGraphFromJson(starGraph);
    } else if (param == PREDEFINEDS.TRIANGULATED_STAR_GRAPH) {
        const triangulatedStarGraph = '{"canvasWidth":852,"canvasHeight":538,"vertices":[{"x":210,"y":89.19999694824219,"nr":0},{"x":542,"y":80.19999694824219,"nr":1},{"x":608,"y":337.1999969482422,"nr":2},{"x":505,"y":227.1999969482422,"nr":3},{"x":465,"y":174.1999969482422,"nr":4},{"x":397,"y":125.19999694824219,"nr":5}],"edges":[{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5},{"v1nr":1,"v2nr":2},{"v1nr":3,"v2nr":4},{"v1nr":5,"v2nr":1},{"v1nr":1,"v2nr":4},{"v1nr":1,"v2nr":3},{"v1nr":5,"v2nr":4},{"v1nr":3,"v2nr":2},{"v1nr":1,"v2nr":0}]}';
        loadGraphFromJson(triangulatedStarGraph);
    } else if (param == PREDEFINEDS.BIG_MY_GRAPH) {
        const bigMyGraph = '{"canvasWidth":692,"canvasHeight":538,"vertices":[{"x":393,"y":19.199996948242188,"nr":0},{"x":23,"y":201.1999969482422,"nr":1},{"x":66,"y":189.1999969482422,"nr":2},{"x":102,"y":178.1999969482422,"nr":3},{"x":138,"y":166.1999969482422,"nr":4},{"x":166,"y":158.1999969482422,"nr":5},{"x":190,"y":149.1999969482422,"nr":6},{"x":218,"y":137.1999969482422,"nr":7},{"x":242,"y":129.1999969482422,"nr":8},{"x":261,"y":118.19999694824219,"nr":9},{"x":282,"y":109.19999694824219,"nr":10},{"x":304,"y":105.19999694824219,"nr":11},{"x":326,"y":101.19999694824219,"nr":12},{"x":342,"y":89.19999694824219,"nr":13},{"x":359,"y":77.19999694824219,"nr":14},{"x":377,"y":69.19999694824219,"nr":15},{"x":394,"y":63.19999694824219,"nr":16},{"x":420,"y":59.19999694824219,"nr":17},{"x":658,"y":154.1999969482422,"nr":18}],"edges":[{"v1nr":0,"v2nr":1},{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5},{"v1nr":0,"v2nr":6},{"v1nr":0,"v2nr":7},{"v1nr":0,"v2nr":8},{"v1nr":0,"v2nr":9},{"v1nr":0,"v2nr":10},{"v1nr":0,"v2nr":11},{"v1nr":0,"v2nr":12},{"v1nr":0,"v2nr":13},{"v1nr":0,"v2nr":14},{"v1nr":0,"v2nr":15},{"v1nr":0,"v2nr":16},{"v1nr":0,"v2nr":17},{"v1nr":0,"v2nr":18},{"v1nr":17,"v2nr":18},{"v1nr":16,"v2nr":18},{"v1nr":15,"v2nr":18},{"v1nr":14,"v2nr":18},{"v1nr":13,"v2nr":18},{"v1nr":12,"v2nr":18},{"v1nr":11,"v2nr":18},{"v1nr":10,"v2nr":18},{"v1nr":9,"v2nr":18},{"v1nr":8,"v2nr":18},{"v1nr":7,"v2nr":18},{"v1nr":6,"v2nr":18},{"v1nr":5,"v2nr":18},{"v1nr":4,"v2nr":18},{"v1nr":3,"v2nr":18},{"v1nr":2,"v2nr":18},{"v1nr":1,"v2nr":18},{"v1nr":1,"v2nr":2},{"v1nr":2,"v2nr":3},{"v1nr":3,"v2nr":4},{"v1nr":4,"v2nr":5},{"v1nr":5,"v2nr":6},{"v1nr":6,"v2nr":7},{"v1nr":7,"v2nr":8},{"v1nr":8,"v2nr":9},{"v1nr":9,"v2nr":10},{"v1nr":10,"v2nr":11},{"v1nr":11,"v2nr":12},{"v1nr":12,"v2nr":13},{"v1nr":13,"v2nr":14},{"v1nr":14,"v2nr":15},{"v1nr":15,"v2nr":16},{"v1nr":16,"v2nr":17}]}';
        loadGraphFromJson(bigMyGraph);
    } else if (param == PREDEFINEDS.CASE_1_GRAPH) {
        const case1Graph = '{"canvasWidth":711,"canvasHeight":538,"vertices":[{"x":354,"y":269,"nr":0},{"x":354,"y":20,"nr":1},{"x":20,"y":518,"nr":2},{"x":688,"y":518,"nr":3},{"x":453.4718394324346,"y":269,"nr":4},{"x":450.3467486807471,"y":293.7376405245327,"nr":5},{"x":441.16783737089304,"y":316.9209241162313,"nr":6},{"x":426.5118502581449,"y":337.09315980487634,"nr":7},{"x":407.2996769137468,"y":352.98685183385703,"nr":8},{"x":384.73848884635834,"y":363.60334108008215,"nr":9},{"x":360.245888476499,"y":368.27555447949504,"nr":10},{"x":335.3608359628903,"y":366.70991968101174,"nr":11},{"x":311.64695067578333,"y":359.00481127702295,"nr":12},{"x":290.5942632413365,"y":345.6443695659578,"nr":13},{"x":273.5255914374244,"y":327.46808023678994,"nr":14},{"x":261.5134226876706,"y":305.61802639578707,"nr":15},{"x":255.31252573228846,"y":281.46712728465627,"nr":16},{"x":255.31252573228846,"y":256.53287271534373,"nr":17},{"x":261.5134226876706,"y":232.38197360421287,"nr":18},{"x":273.5255914374244,"y":210.53191976321003,"nr":19},{"x":290.59426324133653,"y":192.35563043404218,"nr":20},{"x":311.6469506757834,"y":178.995188722977,"nr":21},{"x":335.3608359628903,"y":171.29008031898826,"nr":22},{"x":360.24588847649903,"y":169.72444552050496,"nr":23},{"x":384.7384888463583,"y":174.39665891991785,"nr":24},{"x":407.2996769137468,"y":185.01314816614297,"nr":25},{"x":426.51185025814493,"y":200.90684019512372,"nr":26},{"x":441.16783737089304,"y":221.07907588376875,"nr":27},{"x":450.3467486807471,"y":244.26235947546732,"nr":28},{"x":350,"y":117.80000305175781,"nr":38},{"x":425,"y":152.8000030517578,"nr":39},{"x":488,"y":283.8000030517578,"nr":40},{"x":405,"y":400.8000030517578,"nr":41},{"x":242,"y":362.8000030517578,"nr":42},{"x":230,"y":238.8000030517578,"nr":43},{"x":174,"y":450.8000030517578,"nr":44},{"x":536,"y":428.8000030517578,"nr":45},{"x":353,"y":65.80000305175781,"nr":46}],"edges":[{"v1nr":1,"v2nr":2},{"v1nr":1,"v2nr":3},{"v1nr":2,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":4,"v2nr":5},{"v1nr":0,"v2nr":5},{"v1nr":5,"v2nr":6},{"v1nr":0,"v2nr":6},{"v1nr":6,"v2nr":7},{"v1nr":0,"v2nr":7},{"v1nr":7,"v2nr":8},{"v1nr":0,"v2nr":8},{"v1nr":8,"v2nr":9},{"v1nr":0,"v2nr":9},{"v1nr":9,"v2nr":10},{"v1nr":0,"v2nr":10},{"v1nr":10,"v2nr":11},{"v1nr":0,"v2nr":11},{"v1nr":11,"v2nr":12},{"v1nr":0,"v2nr":12},{"v1nr":12,"v2nr":13},{"v1nr":0,"v2nr":13},{"v1nr":13,"v2nr":14},{"v1nr":0,"v2nr":14},{"v1nr":14,"v2nr":15},{"v1nr":0,"v2nr":15},{"v1nr":15,"v2nr":16},{"v1nr":0,"v2nr":16},{"v1nr":16,"v2nr":17},{"v1nr":0,"v2nr":17},{"v1nr":17,"v2nr":18},{"v1nr":0,"v2nr":18},{"v1nr":18,"v2nr":19},{"v1nr":0,"v2nr":19},{"v1nr":19,"v2nr":20},{"v1nr":0,"v2nr":20},{"v1nr":20,"v2nr":21},{"v1nr":0,"v2nr":21},{"v1nr":21,"v2nr":22},{"v1nr":0,"v2nr":22},{"v1nr":22,"v2nr":23},{"v1nr":0,"v2nr":23},{"v1nr":23,"v2nr":24},{"v1nr":0,"v2nr":24},{"v1nr":24,"v2nr":25},{"v1nr":0,"v2nr":25},{"v1nr":25,"v2nr":26},{"v1nr":0,"v2nr":26},{"v1nr":26,"v2nr":27},{"v1nr":0,"v2nr":27},{"v1nr":27,"v2nr":28},{"v1nr":0,"v2nr":28},{"v1nr":4,"v2nr":28},{"v1nr":21,"v2nr":38},{"v1nr":38,"v2nr":22},{"v1nr":38,"v2nr":23},{"v1nr":38,"v2nr":24},{"v1nr":24,"v2nr":39},{"v1nr":39,"v2nr":25},{"v1nr":39,"v2nr":26},{"v1nr":39,"v2nr":27},{"v1nr":27,"v2nr":40},{"v1nr":40,"v2nr":28},{"v1nr":40,"v2nr":4},{"v1nr":40,"v2nr":5},{"v1nr":40,"v2nr":6},{"v1nr":6,"v2nr":41},{"v1nr":7,"v2nr":41},{"v1nr":8,"v2nr":41},{"v1nr":9,"v2nr":41},{"v1nr":10,"v2nr":41},{"v1nr":11,"v2nr":41},{"v1nr":11,"v2nr":42},{"v1nr":42,"v2nr":12},{"v1nr":42,"v2nr":13},{"v1nr":14,"v2nr":42},{"v1nr":15,"v2nr":42},{"v1nr":16,"v2nr":42},{"v1nr":16,"v2nr":43},{"v1nr":43,"v2nr":17},{"v1nr":43,"v2nr":18},{"v1nr":43,"v2nr":19},{"v1nr":43,"v2nr":20},{"v1nr":20,"v2nr":38},{"v1nr":43,"v2nr":44},{"v1nr":44,"v2nr":42},{"v1nr":44,"v2nr":41},{"v1nr":44,"v2nr":2},{"v1nr":41,"v2nr":45},{"v1nr":45,"v2nr":40},{"v1nr":45,"v2nr":3},{"v1nr":3,"v2nr":41},{"v1nr":2,"v2nr":41},{"v1nr":2,"v2nr":43},{"v1nr":42,"v2nr":41},{"v1nr":42,"v2nr":43},{"v1nr":41,"v2nr":40},{"v1nr":40,"v2nr":3},{"v1nr":3,"v2nr":39},{"v1nr":40,"v2nr":39},{"v1nr":39,"v2nr":38},{"v1nr":39,"v2nr":46},{"v1nr":46,"v2nr":38},{"v1nr":46,"v2nr":1},{"v1nr":39,"v2nr":1},{"v1nr":43,"v2nr":46},{"v1nr":43,"v2nr":38},{"v1nr":43,"v2nr":1}]}';
        vertexRadius = 10;
        loadGraphFromJson(case1Graph);
    } else if (param == PREDEFINEDS.WHEEL_GRAPH) {
        let nodes = parseInt(prompt("Enter number of nodes:"));
        let radius = (nodes * 25) / (2 * Math.PI);
        let fgCanvas = $('#fgCanvas')[0];
        let center = { x: fgCanvas.width / 2, y: fgCanvas.height / 2 };
        let anglePerNode = (2 * Math.PI) / nodes;
        graph = new Graph();
        vertexRadius = 10;
        graph.addVertex(new Vertex(center.x, center.y, 0));
        // Draw vertices in a circle
        for (let i = 0; i < nodes; i++) {
            let angle = i * anglePerNode;
            let x = center.x + radius * Math.cos(angle);
            let y = center.y + radius * Math.sin(angle);
            let vertex = new Vertex(x, y, (i + 1));
            graph.addVertex(vertex);
        }

        for (let i = 0; i < nodes; i++) {
            graph.addEdge(new Edge(graph.vertices[0].number, graph.vertices[i + 1].number));
            if (i < nodes - 1) {
                graph.addEdge(new Edge(graph.vertices[i + 1].number, graph.vertices[i + 1 + 1].number));
            }
        }
        graph.addEdge(new Edge(graph.vertices[0 + 1].number, graph.vertices[nodes + 1 - 1].number));
        redrawAll();
    } else if (param == PREDEFINEDS.MIXED_MAX_GRAPH) {
        const mixedMaxGraph = '{"canvasWidth":863,"canvasHeight":538,"vertices":[{"x":33,"y":494,"nr":0},{"x":401,"y":419,"nr":1},{"x":823,"y":497,"nr":2},{"x":401,"y":200,"nr":3},{"x":401,"y":48,"nr":4}],"edges":[{"v1nr":4,"v2nr":3,"weight":16},{"v1nr":3,"v2nr":0,"weight":0},{"v1nr":0,"v2nr":1,"weight":11},{"v1nr":1,"v2nr":2,"weight":1},{"v1nr":2,"v2nr":3,"weight":5},{"v1nr":3,"v2nr":1,"weight":-6}]}';
        loadGraphFromJson(mixedMaxGraph);
    } else if (param == PREDEFINEDS.WEIGHT_MAX_GRAPH_2) {
        const weightMaxGraph2 = '{"canvasWidth":863,"canvasHeight":538,"vertices":[{"x":33,"y":494,"nr":0},{"x":401,"y":419,"nr":1},{"x":823,"y":497,"nr":2},{"x":401,"y":200,"nr":3},{"x":401,"y":48,"nr":4},{"x":149,"y":106,"nr":5},{"x":654,"y":151,"nr":6}],"edges":[{"v1nr":4,"v2nr":3,"weight":16},{"v1nr":3,"v2nr":0,"weight":0},{"v1nr":0,"v2nr":1,"weight":11},{"v1nr":1,"v2nr":2,"weight":1},{"v1nr":2,"v2nr":3,"weight":5},{"v1nr":3,"v2nr":1,"weight":-6},{"v1nr":5,"v2nr":0,"weight":4},{"v1nr":5,"v2nr":4,"weight":7},{"v1nr":4,"v2nr":6,"weight":9},{"v1nr":6,"v2nr":2,"weight":3}]}';
        loadGraphFromJson(weightMaxGraph2);
    }
    // const Graph = '{"vertices":[{"x":318,"y":262.8000030517578,"nr":0},{"x":289,"y":160.8000030517578,"nr":1},{"x":315,"y":162.8000030517578,"nr":2},{"x":349,"y":168.8000030517578,"nr":3},{"x":370,"y":177.8000030517578,"nr":4},{"x":385,"y":200.8000030517578,"nr":5},{"x":398,"y":234.8000030517578,"nr":6},{"x":398,"y":257.8000030517578,"nr":7},{"x":389,"y":289.8000030517578,"nr":8},{"x":378,"y":310.8000030517578,"nr":9},{"x":350,"y":330.8000030517578,"nr":10},{"x":317,"y":335.8000030517578,"nr":11},{"x":291,"y":334.8000030517578,"nr":12},{"x":274,"y":330.8000030517578,"nr":13},{"x":258,"y":314.8000030517578,"nr":14},{"x":238,"y":284.8000030517578,"nr":15},{"x":230,"y":263.8000030517578,"nr":16},{"x":226,"y":237.8000030517578,"nr":17},{"x":227,"y":212.8000030517578,"nr":18},{"x":233,"y":186.8000030517578,"nr":19},{"x":254,"y":169.8000030517578,"nr":20},{"x":312,"y":22.800003051757812,"nr":21},{"x":34,"y":494.8000030517578,"nr":22},{"x":658,"y":505.8000030517578,"nr":23}],"edges":[{"v1nr":22,"v2nr":23},{"v1nr":23,"v2nr":21},{"v1nr":21,"v2nr":22},{"v1nr":14,"v2nr":22},{"v1nr":14,"v2nr":13},{"v1nr":13,"v2nr":12},{"v1nr":12,"v2nr":11},{"v1nr":11,"v2nr":10},{"v1nr":10,"v2nr":9},{"v1nr":9,"v2nr":8},{"v1nr":8,"v2nr":7},{"v1nr":7,"v2nr":6},{"v1nr":6,"v2nr":5},{"v1nr":5,"v2nr":4},{"v1nr":4,"v2nr":3},{"v1nr":3,"v2nr":2},{"v1nr":2,"v2nr":1},{"v1nr":1,"v2nr":20},{"v1nr":20,"v2nr":19},{"v1nr":19,"v2nr":18},{"v1nr":18,"v2nr":17},{"v1nr":17,"v2nr":16},{"v1nr":16,"v2nr":15},{"v1nr":15,"v2nr":14},{"v1nr":2,"v2nr":21},{"v1nr":9,"v2nr":23},{"v1nr":14,"v2nr":0},{"v1nr":0,"v2nr":13},{"v1nr":0,"v2nr":12},{"v1nr":0,"v2nr":11},{"v1nr":0,"v2nr":10},{"v1nr":0,"v2nr":9}]}';
    // let otherCase2graph = '{"vertices":[{"x":318,"y":262.8000030517578,"nr":0},{"x":289,"y":160.8000030517578,"nr":1},{"x":315,"y":162.8000030517578,"nr":2},{"x":349,"y":168.8000030517578,"nr":3},{"x":370,"y":177.8000030517578,"nr":4},{"x":396,"y":206.1999969482422,"nr":5},{"x":421,"y":230.1999969482422,"nr":6},{"x":398,"y":257.8000030517578,"nr":7},{"x":389,"y":289.8000030517578,"nr":8},{"x":378,"y":310.8000030517578,"nr":9},{"x":350,"y":330.8000030517578,"nr":10},{"x":317,"y":335.8000030517578,"nr":11},{"x":291,"y":334.8000030517578,"nr":12},{"x":274,"y":330.8000030517578,"nr":13},{"x":258,"y":314.8000030517578,"nr":14},{"x":238,"y":284.8000030517578,"nr":15},{"x":230,"y":263.8000030517578,"nr":16},{"x":226,"y":237.8000030517578,"nr":17},{"x":227,"y":212.8000030517578,"nr":18},{"x":233,"y":186.8000030517578,"nr":19},{"x":254,"y":169.8000030517578,"nr":20},{"x":312,"y":22.800003051757812,"nr":21},{"x":34,"y":494.8000030517578,"nr":22},{"x":658,"y":505.8000030517578,"nr":23}],"edges":[{"v1nr":22,"v2nr":23},{"v1nr":23,"v2nr":21},{"v1nr":21,"v2nr":22},{"v1nr":14,"v2nr":22},{"v1nr":14,"v2nr":13},{"v1nr":13,"v2nr":12},{"v1nr":12,"v2nr":11},{"v1nr":11,"v2nr":10},{"v1nr":10,"v2nr":9},{"v1nr":9,"v2nr":8},{"v1nr":8,"v2nr":7},{"v1nr":7,"v2nr":6},{"v1nr":6,"v2nr":5},{"v1nr":5,"v2nr":4},{"v1nr":4,"v2nr":3},{"v1nr":3,"v2nr":2},{"v1nr":2,"v2nr":1},{"v1nr":1,"v2nr":20},{"v1nr":20,"v2nr":19},{"v1nr":19,"v2nr":18},{"v1nr":18,"v2nr":17},{"v1nr":17,"v2nr":16},{"v1nr":16,"v2nr":15},{"v1nr":15,"v2nr":14},{"v1nr":2,"v2nr":21},{"v1nr":9,"v2nr":23},{"v1nr":14,"v2nr":0},{"v1nr":0,"v2nr":13},{"v1nr":0,"v2nr":12},{"v1nr":0,"v2nr":11},{"v1nr":0,"v2nr":10},{"v1nr":0,"v2nr":9},{"v1nr":0,"v2nr":15},{"v1nr":0,"v2nr":16},{"v1nr":0,"v2nr":17},{"v1nr":0,"v2nr":18},{"v1nr":0,"v2nr":19},{"v1nr":0,"v2nr":20},{"v1nr":0,"v2nr":1},{"v1nr":0,"v2nr":2},{"v1nr":0,"v2nr":3},{"v1nr":0,"v2nr":4},{"v1nr":0,"v2nr":5},{"v1nr":0,"v2nr":6},{"v1nr":0,"v2nr":7},{"v1nr":0,"v2nr":8},{"v1nr":10,"v2nr":23},{"v1nr":23,"v2nr":11},{"v1nr":13,"v2nr":22},{"v1nr":22,"v2nr":12},{"v1nr":22,"v2nr":11},{"v1nr":8,"v2nr":23},{"v1nr":23,"v2nr":7},{"v1nr":23,"v2nr":6},{"v1nr":3,"v2nr":21},{"v1nr":21,"v2nr":4},{"v1nr":21,"v2nr":5},{"v1nr":21,"v2nr":6},{"v1nr":21,"v2nr":1},{"v1nr":21,"v2nr":20},{"v1nr":21,"v2nr":19},{"v1nr":22,"v2nr":15},{"v1nr":22,"v2nr":16},{"v1nr":22,"v2nr":17},{"v1nr":22,"v2nr":18},{"v1nr":22,"v2nr":19}]}';
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
            null, jsonEdge.hasOwnProperty('weight') ? jsonEdge.weight : null));
    }
    redrawAll();
}