const PREDEFINEDS = {
    GET_CURR: 0,
    DEG_ONE_GRAPH: 1
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
        console.log(JSON.stringify(jsonGraph));
    } else if (param == PREDEFINEDS.DEG_ONE_GRAPH) {
        const degOneGraph = '{"vertices":[{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":100,"radius":15,"highlightColor":"red","color":"gray"}],"edges":[{"v1":{"x":200,"y":100,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"}]}';
        jsonGraph = JSON.parse(degOneGraph);
        graph = new Graph();
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
}