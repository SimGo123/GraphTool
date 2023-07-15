const PREDEFINEDS = {
    GET_CURR: 0,
    DEG_ONE_GRAPH: 1
};

function predefinedClick(param) {
    console.log(JSON.stringify(graph));
    if (param == PREDEFINEDS.GET_CURR) {
        for (var i = 0; i < graph.vertices.length; i++) {
            var vertex = graph.vertices[i];
            if (vertex.name == "curr") {
                selectedVertex = vertex;
                changeVertexToolsVisible(true);
                redrawAll();
                return;
            }
        }
    } else if (param == PREDEFINEDS.DEG_ONE_GRAPH) {
        const degOneGraph = '{"vertices":[{"x":299,"y":130.8000030517578,"number":0,"radius":15,"highlightColor":"red","color":"gray"},{"x":315,"y":360.8000030517578,"number":1,"radius":15,"highlightColor":"red","color":"gray"},{"x":219,"y":244.8000030517578,"number":2,"radius":15,"highlightColor":"red","color":"gray"},{"x":668,"y":198.8000030517578,"number":3,"radius":15,"highlightColor":"red","color":"gray"},{"x":711,"y":294.8000030517578,"number":4,"radius":15,"highlightColor":"red","color":"gray"},{"x":626,"y":392.8000030517578,"number":5,"radius":15,"highlightColor":"red","color":"gray"},{"x":579,"y":231.8000030517578,"number":6,"radius":15,"highlightColor":"red","color":"gray"}],"edges":[{"v1":{"x":299,"y":130.8000030517578,"number":0,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":315,"y":360.8000030517578,"number":1,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":315,"y":360.8000030517578,"number":1,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":219,"y":244.8000030517578,"number":2,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":219,"y":244.8000030517578,"number":2,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":299,"y":130.8000030517578,"number":0,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":579,"y":231.8000030517578,"number":6,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":626,"y":392.8000030517578,"number":5,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":626,"y":392.8000030517578,"number":5,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":711,"y":294.8000030517578,"number":4,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":711,"y":294.8000030517578,"number":4,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":668,"y":198.8000030517578,"number":3,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":668,"y":198.8000030517578,"number":3,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":579,"y":231.8000030517578,"number":6,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":579,"y":231.8000030517578,"number":6,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":711,"y":294.8000030517578,"number":4,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"}]}';
        //const degOneGraph = '{"vertices":[{"x":111,"y":239.60000610351562,"number":0,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":300,"number":1,"radius":15,"highlightColor":"red","color":"gray"},{"x":215,"y":42.600006103515625,"number":2,"radius":15,"highlightColor":"red","color":"gray"},{"x":351,"y":249.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},{"x":487,"y":171.60000610351562,"number":4,"radius":15,"highlightColor":"red","color":"gray"}],"edges":[{"v1":{"x":487,"y":171.60000610351562,"number":4,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":351,"y":249.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":351,"y":249.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":111,"y":239.60000610351562,"number":0,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":111,"y":239.60000610351562,"number":0,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"number":1,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":300,"number":1,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":215,"y":42.600006103515625,"number":2,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":215,"y":42.600006103515625,"number":2,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":351,"y":249.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":351,"y":249.60000610351562,"number":3,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"number":1,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"}]}';
        //const degOneGraph = '{"vertices":[{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},{"x":200,"y":100,"radius":15,"highlightColor":"red","color":"gray"}],"edges":[{"v1":{"x":200,"y":100,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":100,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":300,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"},{"v1":{"x":200,"y":200,"radius":15,"highlightColor":"red","color":"gray"},"v2":{"x":200,"y":300,"radius":15,"highlightColor":"red","color":"gray"},"thickness":5,"color":"gray"}]}';
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