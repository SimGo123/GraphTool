const PREDEFINEDS = {
    GET_CURR: 0,
    FROM_JSON: 1,
    DEBUG_GRAPH: 2,
    SIGMA_GRAPH: 3,
    STAR_GRAPH: 4,
    TRIANGULATED_STAR_GRAPH: 5,
};

function predefinedClick(param) {
    if (param == PREDEFINEDS.GET_CURR) {
        let jsonGraph = {};
        jsonGraph.vertices = [];
        for (let i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            jsonGraph.vertices.push({"x": vertex.x, "y": vertex.y});
        }
        jsonGraph.edges = [];
        for (let i = 0; i < graph.edges.length; i++) {
            let edge = graph.edges[i];
            jsonGraph.edges.push({"v1": {"x": edge.v1.x, "y": edge.v1.y}, "v2": {"x": edge.v2.x, "y": edge.v2.y}});
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
        const debugGraph = '{"vertices":[{"x":100,"y":300},{"x":200,"y":300},{"x":300,"y":300},{"x":200,"y":200},{"x":200,"y":100}],"edges":[{"v1":{"x":200,"y":100},"v2":{"x":200,"y":200}},{"v1":{"x":200,"y":200},"v2":{"x":100,"y":300}},{"v1":{"x":100,"y":300},"v2":{"x":200,"y":300}},{"v1":{"x":200,"y":300},"v2":{"x":300,"y":300}},{"v1":{"x":300,"y":300},"v2":{"x":200,"y":200}},{"v1":{"x":200,"y":200},"v2":{"x":200,"y":300}}]}';
        loadGraphFromJson(debugGraph);
    } else if (param == PREDEFINEDS.SIGMA_GRAPH) {
        const sigmaGraph = '{"vertices":[{"x":242,"y":121.80000305175781},{"x":534,"y":135.8000030517578},{"x":394,"y":259.8000030517578},{"x":255,"y":348.8000030517578},{"x":515,"y":339.8000030517578}],"edges":[{"v1":{"x":242,"y":121.80000305175781},"v2":{"x":534,"y":135.8000030517578}},{"v1":{"x":534,"y":135.8000030517578},"v2":{"x":394,"y":259.8000030517578}},{"v1":{"x":394,"y":259.8000030517578},"v2":{"x":515,"y":339.8000030517578}},{"v1":{"x":515,"y":339.8000030517578},"v2":{"x":255,"y":348.8000030517578}}]}';
        loadGraphFromJson(sigmaGraph);
    } else if (param == PREDEFINEDS.STAR_GRAPH) {
        const starGraph = '{"vertices":[{"x":348,"y":251.8000030517578},{"x":351,"y":140.8000030517578},{"x":456,"y":198.8000030517578},{"x":445,"y":308.8000030517578},{"x":299,"y":327.8000030517578},{"x":252,"y":215.8000030517578}],"edges":[{"v1":{"x":351,"y":140.8000030517578},"v2":{"x":348,"y":251.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":456,"y":198.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":445,"y":308.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":299,"y":327.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":252,"y":215.8000030517578}}]}';
        loadGraphFromJson(starGraph);
    } else if (param == PREDEFINEDS.TRIANGULATED_STAR_GRAPH) {
        const triangulatedStarGraph = '{"vertices":[{"x":210,"y":89.19999694824219},{"x":542,"y":80.19999694824219},{"x":608,"y":337.1999969482422},{"x":505,"y":227.1999969482422},{"x":465,"y":174.1999969482422},{"x":397,"y":125.19999694824219}],"edges":[{"v1":{"x":210,"y":89.19999694824219},"v2":{"x":608,"y":337.1999969482422}},{"v1":{"x":210,"y":89.19999694824219},"v2":{"x":505,"y":227.1999969482422}},{"v1":{"x":210,"y":89.19999694824219},"v2":{"x":465,"y":174.1999969482422}},{"v1":{"x":210,"y":89.19999694824219},"v2":{"x":397,"y":125.19999694824219}},{"v1":{"x":542,"y":80.19999694824219},"v2":{"x":608,"y":337.1999969482422}},{"v1":{"x":505,"y":227.1999969482422},"v2":{"x":465,"y":174.1999969482422}},{"v1":{"x":397,"y":125.19999694824219},"v2":{"x":542,"y":80.19999694824219}},{"v1":{"x":542,"y":80.19999694824219},"v2":{"x":465,"y":174.1999969482422}},{"v1":{"x":542,"y":80.19999694824219},"v2":{"x":505,"y":227.1999969482422}},{"v1":{"x":397,"y":125.19999694824219},"v2":{"x":465,"y":174.1999969482422}},{"v1":{"x":505,"y":227.1999969482422},"v2":{"x":608,"y":337.1999969482422}},{"v1":{"x":542,"y":80.19999694824219},"v2":{"x":210,"y":89.19999694824219}}]}';
        loadGraphFromJson(triangulatedStarGraph);
    }
}

function loadGraphFromJson(graphString) {
    let jsonGraph = JSON.parse(graphString);
    graph = new Graph();
    vertexCount = 0;
    for (var i = 0; i < jsonGraph.vertices.length; i++) {
        var vertex = jsonGraph.vertices[i];
        graph.addVertex(new Vertex(vertex.x, vertex.y));
    }
    for (var i = 0; i < jsonGraph.edges.length; i++) {
        var edge = jsonGraph.edges[i];
        let v1 = edge.v1;
        let v2 = edge.v2;
        let v1Idx = eqIndexOf(graph.vertices, v1);
        let v2Idx = eqIndexOf(graph.vertices, v2);
        for (var j = 0; j < graph.vertices.length; j++) {
            if (graph.vertices[j].x == v1.x && graph.vertices[j].y == v1.y) {
                v1Idx = j;
            }
            if (graph.vertices[j].x == v2.x && graph.vertices[j].y == v2.y) {
                v2Idx = j;
            }
        }
        graph.addEdge(new Edge(graph.vertices[v1Idx], graph.vertices[v2Idx]));
    }
    redrawAll();
}