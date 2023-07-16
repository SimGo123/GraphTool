const PREDEFINEDS = {
    GET_CURR: 0,
    FROM_JSON: 1,
    DEG_ONE_GRAPH: 2,
    STAR_GRAPH: 3
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
        let jsonGraph = window.prompt("Enter JSON graph:");
        try {
            jsonGraph = JSON.parse(jsonGraph);
            loadGraphFromJson(jsonGraph);
        } catch (e) {
            window.alert("Invalid JSON graph!");
        }
    } else if (param == PREDEFINEDS.DEG_ONE_GRAPH) {
        const degOneGraph = '{"vertices":[{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":100,"radius":15,"highlightColor":"red","color":"gray"}],"edges":[{"v1":{"x":200,"y":100,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"}]}';
        let jsonGraph = JSON.parse(degOneGraph);
        loadGraphFromJson(jsonGraph);
    } else if (param == PREDEFINEDS.STAR_GRAPH) {
        const starGraph = '{"vertices":[{"x":348,"y":251.8000030517578},{"x":351,"y":140.8000030517578},{"x":456,"y":198.8000030517578},{"x":445,"y":308.8000030517578},{"x":299,"y":327.8000030517578},{"x":252,"y":215.8000030517578}],"edges":[{"v1":{"x":351,"y":140.8000030517578},"v2":{"x":348,"y":251.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":456,"y":198.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":445,"y":308.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":299,"y":327.8000030517578}},{"v1":{"x":348,"y":251.8000030517578},"v2":{"x":252,"y":215.8000030517578}}]}';
        let jsonGraph = JSON.parse(starGraph);
        loadGraphFromJson(jsonGraph);
    }
}

function loadGraphFromJson(jsonGraph) {
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
        console.log("idx " + graph.vertices.indexOf(v2));
        graph.addEdge(new Edge(graph.vertices[v1Idx], graph.vertices[v2Idx]));
    }
    redrawAll();
}