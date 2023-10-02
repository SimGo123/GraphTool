class PlanarSeparatorAlgo extends Algorithm {

    originalGraph = null;

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("Graph is not planar embedded!");
            fulfilled = false;
        }
        return fulfilled;
    }

    async run(runGraph = graph) {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return null;
        }

        this.originalGraph = graph.getCopy();

        await super.pause("Triangulate the graph", "Triangulate the graph");
        let triangulationAlgo = new TriangulationAlgo();
        triangulationAlgo.shouldContinue = true;
        triangulationAlgo.runComplete = true;
        triangulationAlgo.isSubAlgo = true;
        await triangulationAlgo.run();

        await super.pause("Construct breadth-first search tree", "");
        let startVertex = runGraph.vertices[0];
        if (!this.isSubAlgo) {
            let startVertexNr = window.prompt("Enter start vertex number", "0");
            $.each(runGraph.vertices, function (_index, vertex) {
                if (vertex.number == startVertexNr) {
                    startVertex = vertex;
                    return false;
                }
            });
        }
        console.log('start vertex: ' + startVertex.print());
        let bfsLayers = breadthFirstSearchTree(startVertex, runGraph);
        this.showBFSTree(bfsLayers);

        await super.pause("Draw graph like a tree", "First layer on top, other layers below");
        this.drawLayerStructure(bfsLayers);

        let layers = [];
        for (var i = 0; i < bfsLayers.length; i++) {
            let vertexLayer = [];
            for (var j = 0; j < bfsLayers[i].length; j++) {
                vertexLayer.push(bfsLayers[i][j].vertex);
            }
            layers[i] = vertexLayer;
        }

        const n = runGraph.vertices.length;
        await super.pause("Find layer μ",
            "Find layer μ so that all layers below together have <= n/2="
            + (n / 2) + " vertices, and together with μ have > n/2 vertices");
        let layerMyIdx = this.getLayerMy(layers);
        this.rectAroundLayer(layers, layerMyIdx, "green");

        const maxSeparatorSize = 4 * Math.sqrt(n);
        await super.pause("Check if layer μ is a separator",
            "Check if layer μ has <= 4*sqrt(n) vertices."
            + "<br> In this case: |μ|=" + layers[layerMyIdx].length + " <= 4*sqrt(n)="
            + +maxSeparatorSize.toFixed(1) + "?");
        if (layers[layerMyIdx].length <= maxSeparatorSize) {
            this.rectAroundLayer(layers, layerMyIdx, "red");
            await super.pause("Layer μ is a separator",
                "Layer μ (" + layerMyIdx + ") is a separator");

            let v1 = [];
            let v2 = [];
            for (var i = 0; i < layers.length; i++) {
                if (i < layerMyIdx) {
                    v1.push(i);
                } else if (i > layerMyIdx) {
                    v2.push(i);
                }
            }

            return this.transformBackAndGetReturnValues(layers, v1, [layerMyIdx], v2);
        }

        await super.pause("Find layers m and M",
            "Layer μ was not a separator."
            + " Now find layers m before and M after μ with |m|, |M| < sqrt(n)=" + +Math.sqrt(n).toFixed(1));
        let layersMmIndexes = this.getLayersMm(layers, layerMyIdx);
        let m_idx = layersMmIndexes[0];
        let M_idx = layersMmIndexes[1];
        if (m_idx != -1) {
            this.rectAroundLayer(layers, m_idx, "blue");
        }
        if (M_idx != -1) {
            this.rectAroundLayer(layers, M_idx, "blue");
        }
        let a_s = this.getAs(layers, m_idx, M_idx);
        let [a1, a2, a3] = a_s;
        let a2_len = 0;
        for (var i = 0; i < a2.length; i++) {
            a2_len += layers[a2[i]].length;
        }

        if (a2_len <= (2 / 3) * n) {
            // Case 1
            console.log('Case 1');
            await super.pause("Check if m u M is a separator",
                "Check if A2 (all layers between m and M) has <= 2/3 * n vertices."
                + "<br> In this case: |A2|=" + a2_len + " <= 2/3 * n=" + +((2 / 3) * n).toFixed(1)
                + "<br> -> Go to Case 1");
            // m u M is a separator
            await super.pause("Case 1: m u M is a separator",
                "S = m u M, V1 = max(|A1|, |A2|, |A3|), V2=V \\ {S,V1}");
            let a_lengths = [a1.length, a2.length, a3.length];
            let max_a_idx = a_lengths.indexOf(Math.max(...a_lengths));
            let v1 = a_s[max_a_idx];
            let v2 = [];
            for (var i = 0; i < layers.length; i++) {
                if (i != m_idx && i != M_idx && !v1.includes(i)) {
                    v2.push(i);
                }
            }
            if (m_idx != -1) {
                this.rectAroundLayer(layers, m_idx, "red");
            }
            if (M_idx != -1) {
                this.rectAroundLayer(layers, M_idx, "red");
            }

            return this.transformBackAndGetReturnValues(layers, v1, [m_idx, M_idx], v2);
        } else {
            // Case 2
            await super.pause("Check if m u M is a separator",
                "Check if A2 (all layers between m and M) has <= 2/3 * n vertices."
                + "<br> In this case: |A2|=" + a2_len + " > 2/3 * n=" + +((2 / 3) * n).toFixed(1)
                + "<br> -> Go to Case 2");

            await super.pause("Prepare for application of Important Lemma",
                "Combine m and all layers above into a single vertex"
                + "<br> Delete layer M and all layers below");
            let newLayers = [];
            let case2Vertices = [];
            if (m_idx != -1) {
                let newVertex = new Vertex(bfsLayers[0][0].vertex.x, bfsLayers[0][0].vertex.y);
                newLayers.push([new BreadthSearchVertex(newVertex, null)]);
                case2Vertices.push(newVertex);
                graph.addVertex(newVertex);
            }
            let end = M_idx != -1 ? M_idx : bfsLayers.length;
            for (var i = m_idx + 1; i < end; i++) {
                newLayers.push(bfsLayers[i]);
                for (var j = 0; j < bfsLayers[i].length; j++) {
                    case2Vertices.push(bfsLayers[i][j].vertex);
                }
            }
            if (m_idx != -1) {
                for (var i = 0; i < newLayers[1].length; i++) {
                    newLayers[1][i].parent = newLayers[0][0];
                    graph.addEdge(new Edge(
                        newLayers[0][0].vertex.number, newLayers[1][i].vertex.number));
                }
            }
            graph = graph.getSubgraph(case2Vertices);
            console.log('newLayers: ', newLayers);
            this.drawLayerStructure(newLayers);

            await super.pause("Precalculations for Important Lemma", "");
            this.impLemmaPrecalc(newLayers);
            let [x, y] = this.impLemmaNonTreeEdge(newLayers);

            await super.pause("Apply Important Lemma", "");
            await this.importantLemma(newLayers, x, y);

            super.onFinished();
            return null;
        }
    }

    /**
     * 
     * @param {BreadthSearchVertex[][]} layers 
     * @param {number} x Number of vertex x on non-tree edge {x, y}
     * @param {number} y Number of vertex y on non-tree edge {x, y}
     */
    async importantLemma(layers, x, y) {
        /*
        Wir w ¨ahlen eine Nichtbaumkane {x, y} aus, wobei
        |Inneres(Kx,y )| ≥ | ¨Außeres(Kx,y )|
        Wenn zus ¨atzlich gilt |Inneres(Kx,y )| ≤ 2
        3 n - fertig!
        Wir ersetzen die ausgew ¨ahlte Kante {x, y} durch eine andere
        Nichtbaumkante, sodass das Innere kleiner wird und das ¨Außere nicht
        ¨uber 2
        3 n w ¨achstG ist ein eingebetteter Graph. Die Kante {x, y} begrenzt zwei
        Dreiecke, von denen eins im Inneren(Kx,y ) liegt - Dreieck xyt
        Zwei F ¨alle:
        1. Eine der {x, t}, {t, y} ist eine Baumkante,
        2. {x, t} und {t, y} sind beides Nichtbaumkanten
        */
    }

    /**
     * Finds a non-tree edge {x, y} so that the number of inner vertices >= outer vertices
     * 
     * @param {BreadthSearchVertex[][]} layers 
     * @returns {BreadthSearchVertex[]} The two vertices on the non-tree edge
     *         so that the number of inner vertices >= outer vertices
     */
    impLemmaNonTreeEdge(layers) {
        for (let i = 1; i < layers.length; i++) {
            for (let j = 0; j < layers[i].length; j++) {
                let bsVertex = layers[i][j];
                for (let k = j + 1; k < layers[i].length; k++) {
                    let bsVertex2 = layers[i][k];
                    let edgeIndex = eqIndexOf(graph.edges, new Edge(bsVertex.vertex.number, bsVertex2.vertex.number));
                    if (edgeIndex == -1) {
                        continue;
                    }
                    let [innerVertices, circleVertices]
                        = this.calcInnerAndCircleVertices(layers, bsVertex.vertex, bsVertex2.vertex);
                    let outerVertices = graph.vertices.length - innerVertices - circleVertices;
                    console.log('Edge ' + bsVertex.vertex.number + ' ' + bsVertex2.vertex.number
                        + ' has ' + innerVertices + ' inner vertices and ' + outerVertices + ' outer vertices'
                        + ' as well as ' + circleVertices + ' circle vertices');
                    if (innerVertices >= outerVertices) {
                        return [bsVertex.vertex, bsVertex2.vertex];
                    }
                }
            }
        }
        console.error("No non-tree edge matching the requirements found!");
    }

    /**
     * 
     * @param {BreadthSearchVertex[][]} layers 
     * @param {Vertex} x 
     * @param {Vertex} y 
     * @returns {[number, number]} [#innerVertices, #circleVertices]
     */
    calcInnerAndCircleVertices(layers, x, y) {
        let parentIdxInHigherLevelMap = layers.map((layer, i) => layer.map(bsVertex => {
            return i == 0 ? -1 : eqIndexOf(layers[i - 1], bsVertex.parent);
        }));
        let innerVertices = 0;
        let circleVertices = 0;
        let v1LayerIdx = layers.findIndex(layer => layer.some(bsVertex => bsVertex.eq(x)));
        let v2LayerIdx = layers.findIndex(layer => layer.some(bsVertex => bsVertex.eq(y)));
        if (v1LayerIdx != v2LayerIdx) {
            console.error("x and y are not on the same layer!");
            return;
        }
        let layerIdx = v1LayerIdx;
        let v1Idx = layers[layerIdx].findIndex(bsVertex => bsVertex.eq(x));
        let v2Idx = layers[layerIdx].findIndex(bsVertex => bsVertex.eq(y));
        while (v1Idx != v2Idx) {
            innerVertices += (v2Idx - v1Idx - 1);
            circleVertices += 2;
            v1Idx = parentIdxInHigherLevelMap[layerIdx][v1Idx];
            v2Idx = parentIdxInHigherLevelMap[layerIdx][v2Idx];
            layerIdx--;
            if (layerIdx == -1) {
                console.error("No common parent found!");
                break;
            }
        }
        circleVertices += 1; // Parent
        return [innerVertices, circleVertices];
    }

    /**
     * 
     * @param {BreadthSearchVertex[][]} layers 
     */
    impLemmaPrecalc(layers) {
        let vertexLowerMap = layers.map(layer => layer.map(_bsVertex => 0));
        let parentIdxInHigherLevelMap = layers.map((layer, i) => layer.map(bsVertex => {
            return i == 0 ? -1 : eqIndexOf(layers[i - 1], bsVertex.parent);
        }));
        console.log('vertexLowerMap: ', vertexLowerMap);
        for (let i = layers.length - 1; i > 0; i--) {
            for (let j = 0; j < layers[i].length; j++) {
                let parentIdx = parentIdxInHigherLevelMap[i][j];
                vertexLowerMap[i - 1][parentIdx] += vertexLowerMap[i][j] + 1;
            }
        }
    }

    showBFSTree(layers) {
        console.log('layers: ', layers);
        let bfsColorSet = new ColorSet();
        for (var i = 0; i < layers.length; i++) {
            for (var j = 0; j < layers[i].length; j++) {
                console.log('i ' + i + ' j ' + j + ' ', layers[i][j]);
                console.log(layers[i][j].vertex.print());
            }
        }
        for (var i = 1; i < layers.length; i++) {
            let layer = layers[i];
            for (var j = 0; j < layer.length; j++) {
                let bsVertex = layer[j];
                let edgeIndex = eqIndexOf(graph.edges, new Edge(bsVertex.vertex.number, bsVertex.parent.number));
                bfsColorSet.addEdgeColor(graph.edges[edgeIndex], "orange");
            }
        }
        globalColorSet = bfsColorSet;
        redrawAll();
    }

    drawLayerStructure(layers) {
        let minPoint = new Point(graph.vertices[0].x, graph.vertices[0].y);
        let maxPoint = new Point(graph.vertices[0].x, graph.vertices[0].y);
        $.each(graph.vertices, function (_index, vertex) {
            if (vertex.x < minPoint.x) {
                minPoint.x = vertex.x;
            }
            if (vertex.y < minPoint.y) {
                minPoint.y = vertex.y;
            }
            if (vertex.x > maxPoint.x) {
                maxPoint.x = vertex.x;
            }
            if (vertex.y > maxPoint.y) {
                maxPoint.y = vertex.y;
            }
        });
        let width = maxPoint.x - minPoint.x;
        let height = maxPoint.y - minPoint.y;
        let layerHeight = height / layers.length;
        $.each(layers, function (layerIndex, layer) {
            $.each(layer, function (bsVertexIndex, bsVertex) {
                let vertexIndex = eqIndexOf(graph.vertices, bsVertex.vertex);
                graph.vertices[vertexIndex].x = minPoint.x + width / (layer.length + 1) * (bsVertexIndex + 1);
                graph.vertices[vertexIndex].y = minPoint.y + layerHeight * layerIndex;
            });
        });
        redrawAll();
    }

    // Finds the index of the layer so that there are < (n/2) vertices before it
    // and >= (n/2) vertices before and in it
    getLayerMy(layers) {
        const n = graph.vertices.length;
        let seperatorIndex = -1;
        let verticesBefore = 0;
        $.each(layers, function (layerIndex, layer) {
            if (verticesBefore < n / 2 && verticesBefore + layer.length > n / 2) {
                seperatorIndex = layerIndex;
                return;
            }
            verticesBefore += layer.length;
        });
        console.log('n/2=' + n / 2);
        console.log('layer.length=' + layers[seperatorIndex].length + ' 4*sqrt(n)=' + 4 * Math.sqrt(n));

        return seperatorIndex;
    }

    // Finds layers M above and m below my, so that m and M < sqrt(n)
    // Returns the indices in an array [m_idx, M_idx]
    getLayersMm(layers, layerMyIdx) {
        const n = graph.vertices.length;
        let m_idx = -1;
        for (let i = layerMyIdx - 1; i >= 0; i--) {
            if (layers[i].length < Math.sqrt(n)) {
                m_idx = i;
                break;
            }
        }
        let M_idx = -1;
        for (let i = layerMyIdx + 1; i < layers.length; i++) {
            if (layers[i].length < Math.sqrt(n)) {
                M_idx = i;
                break;
            }
        }
        return [m_idx, M_idx];
    }

    // Gets all the layers which are before (A1) between (A2) and after (A3) m and M.
    // If m is -1, m is considered to be -1; if M is -1, M is considered to be layers.length
    // Returns an array [A1, A2, A3], where each element is an array of indices of layers
    getAs(layers, m_idx, M_idx) {
        let a1 = [];
        let a2 = [];
        let a3 = [];
        if (M_idx == -1) {
            M_idx = layers.length;
        }
        for (let i = 0; i < m_idx; i++) {
            a1.push(i);
        }
        for (let i = m_idx + 1; i < M_idx; i++) {
            a2.push(i);
        }
        for (let i = M_idx + 1; i < layers.length; i++) {
            a3.push(i);
        }
        return [a1, a2, a3];
    }

    rectAroundLayer(layers, layerIndex, color) {
        var ctx = $("#fgCanvas")[0].getContext("2d");
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        let layerY = layers[layerIndex][0].y;
        let layerMinX = layers[layerIndex][0].x - 20;
        let layerMaxX = layers[layerIndex][layers[layerIndex].length - 1].x + 20;
        let width = layerMaxX - layerMinX;
        let height = vertexRadius * 2 + 10;
        ctx.rect(layerMinX, layerY - height / 2, width, height);
        ctx.stroke();
        ctx.closePath();
    }

    async transformBackAndGetReturnValues(layers, v1, s, v2) {
        let v1_vertices = [];
        for (var i = 0; i < v1.length; i++) {
            v1_vertices = v1_vertices.concat(layers[v1[i]]);
        }
        let v2_vertices = [];
        for (var i = 0; i < v2.length; i++) {
            v2_vertices = v2_vertices.concat(layers[v2[i]]);
        }
        let s_vertices = [];
        for (var i = 0; i < s.length; i++) {
            s_vertices = s_vertices.concat(layers[s[i]]);
        }

        this.transformBack();

        let vertexColorSet = new ColorSet();
        for (var i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            if (eqIndexOf(v1_vertices, vertex) != -1) {
                vertexColorSet.addVertexColor(vertex.number, "blue");
            }
            if (eqIndexOf(s_vertices, vertex) != -1) {
                vertexColorSet.addVertexColor(vertex.number, "green");
            }
            if (eqIndexOf(v2_vertices, vertex) != -1) {
                vertexColorSet.addVertexColor(vertex.number, "red");
            }
        }
        globalColorSet = vertexColorSet;
        redrawAll();

        super.onFinished(true,
            "S: [" + s_vertices.map(v => v.number).join(", ") + "] (green)<br>separates"
            + "<br>V1: [" + v1_vertices.map(v => v.number).join(", ") + "] (blue)<br>from"
            + "<br>V2: [" + v2_vertices.map(v => v.number).join(", ") + "] (red)");

        return [v1_vertices, s_vertices, v2_vertices];
    }

    transformBack() {
        graph = this.originalGraph;
        redrawAll();
    }
}