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
        let beforeTreeGraph = graph.getCopy();
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

            return this.transformBackAndGetReturnValues(layers,
                this.layersToVertices(layers, v1),
                this.layersToVertices(layers, [layerMyIdx]),
                this.layersToVertices(layers, v2));
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

            return this.transformBackAndGetReturnValues(
                layers, this.layersToVertices(layers, v1),
                this.layersToVertices(layers, [m_idx, M_idx]),
                this.layersToVertices(layers, v2));
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
                    newLayers[1][i].parent = newLayers[0][0].vertex;
                    graph.addEdge(new Edge(
                        newLayers[0][0].vertex.number, newLayers[1][i].vertex.number));
                }
            }
            graph = graph.getSubgraph(case2Vertices);
            console.log('newLayers: ', newLayers);
            this.drawLayerStructure(newLayers);
            await super.pause("Convert back to original graph for planar embedding", "");

            for (let i = 0; i < graph.vertices.length; i++) {
                let vertex = graph.vertices[i];
                let idxInBeforeGraph = eqIndexOf(beforeTreeGraph.vertices, vertex);
                if (idxInBeforeGraph != -1) {
                    vertex.x = beforeTreeGraph.vertices[idxInBeforeGraph].x;
                    vertex.y = beforeTreeGraph.vertices[idxInBeforeGraph].y;
                }
            }
            this.showBFSTree(newLayers);
            this.impLemmaPrecalc(newLayers);
            let [x, y] = this.impLemmaNonTreeEdge(newLayers);

            let [u1, s2, u2] = await this.importantLemma(newLayers, x, y, beforeTreeGraph);
            // S = S2 u m u M
            let s = s2.concat(m_idx != -1 ? layers[m_idx] : [])
                .concat(M_idx != -1 ? layers[M_idx] : []);
            let v1 = u1.length >= u2.length ? u1 : u2;
            let v2 = graph.vertices.filter(
                v => eqIndexOf(v1, v) == -1 && eqIndexOf(s, v) == -1);
            return this.transformBackAndGetReturnValues(layers, v1, s, v2);
        }
    }

    /**
     * 
     * @param {BreadthSearchVertex[][]} layers 
     * @param {Vertex} x Number of vertex x on non-tree edge {x, y}
     * @param {Vertex} y Number of vertex y on non-tree edge {x, y}
     * @returns {[Vertex[], Vertex[], Vertex[]]} [U1, S, U2]
     */
    async importantLemma(layers, x, y) {
        let nonTreeEdgeColorSet = globalColorSet.getCopy();
        nonTreeEdgeColorSet.addEdgeColor(new Edge(x.number, y.number), "red");
        redrawAll(nonTreeEdgeColorSet);
        await super.pause("Important Lemma", "Non-tree edge xy is: " + x.number + "-" + y.number);
        let [innerVertices, circleVertices] = this.calcInnerAndCircleVertices(layers, x, y);
        let N = graph.vertices.length;
        if (innerVertices.length <= (2 / 3) * N) {
            await super.pause("Important Lemma Done",
                "Inner(Kx,y)|=" + innerVertices.length + " <= 2/3 * n=" + +((2 / 3) * N).toFixed(1));
            let outerVertices = graph.vertices.filter(v => eqIndexOf(innerVertices, v) == -1
                && eqIndexOf(circleVertices, v) == -1);
            return [innerVertices, circleVertices, outerVertices];
        }
        // Search triangle xyt on the inside
        let t = null;
        let isCircleVertex = false;
        for (let i = 0; i < innerVertices.length; i++) {
            let innerVertex = innerVertices[i];
            let xt = graph.getEdgeByStartEnd(x.number, innerVertex.number);
            let yt = graph.getEdgeByStartEnd(y.number, innerVertex.number);
            if (xt != null && yt != null) {
                t = innerVertex;
                break;
            }
        }
        if (t == null) {
            for (let i = 0; i < circleVertices.length; i++) {
                let circleVertex = circleVertices[i];
                let xt = graph.getEdgeByStartEnd(x.number, circleVertex.number);
                let yt = graph.getEdgeByStartEnd(y.number, circleVertex.number);
                if (xt != null && yt != null) {
                    t = circleVertex;
                    isCircleVertex = true;
                    break;
                }
            }
        }
        circleVertices.forEach(v => globalColorSet.addVertexColor(v.number, "green"));
        if (t == null) {
            console.error("No triangle xyt found!");
            return;
        }
        console.log('t: ', t);
        await super.pause("Found triangle xyt",
            "Found triangle xyt: " + x.number + " " + y.number + " " + t.number);
        let xLayer = layers.findIndex(layer => layer.some(bsVertex => bsVertex.vertex.eq(x)));
        let yLayer = layers.findIndex(layer => layer.some(bsVertex => bsVertex.vertex.eq(y)));
        let tLayer = layers.findIndex(layer => layer.some(bsVertex => bsVertex.vertex.eq(t)));
        let xBsVertex = layers[xLayer].find(bsVertex => bsVertex.vertex.eq(x));
        let yBsVertex = layers[yLayer].find(bsVertex => bsVertex.vertex.eq(y));
        let tBsVertex = layers[tLayer].find(bsVertex => bsVertex.vertex.eq(t));
        let isXtTreeEdge = xBsVertex.parent.eq(t) || tBsVertex.parent.eq(x);
        let isYtTreeEdge = yBsVertex.parent.eq(t) || tBsVertex.parent.eq(y);
        if (isXtTreeEdge && !isYtTreeEdge) {
            // Case 1
            await super.pause("Important Lemma Case 1",
                'xt (' + x.number + '->' + t.number + ') is a tree edge, next look at yt ('
                + y.number + '->' + t.number + ')');
            return this.importantLemma(layers, y, t);
        } else if (isYtTreeEdge && !isXtTreeEdge) {
            // Case 1
            await super.pause("Important Lemma Case 1",
                'yt (' + y.number + '->' + t.number + ') is a tree edge, next look at xt ('
                + x.number + '->' + t.number + ')');
            return this.importantLemma(layers, x, t);
        } else if (!isXtTreeEdge && !isYtTreeEdge) {
            // Case 2
            console.log('Important Lemma Case 2');
            let [innerVerticesXt, circleVerticesXt] = this.calcInnerAndCircleVertices(layers, x, t);
            let [innerVerticesYt, circleVerticesYt] = this.calcInnerAndCircleVertices(layers, y, t);
            if (innerVerticesXt.length >= innerVerticesYt.length) {
                await super.pause("Important Lemma Case 2",
                    "Inner(Circle(" + x.number + ',' + t.number
                    + '))| ≥ |Inner(Circle(' + t.number + ',' + y.number + "))|"
                    + "<br> -> Replace " + x.number + '->' + y.number
                    + ' by ' + x.number + '->' + t.number);
                return this.importantLemma(layers, x, t);
            } else {
                await super.pause("Important Lemma Case 2",
                    "Inner(Circle(" + y.number + ',' + t.number
                    + '))| ≥ |Inner(Circle(' + x.number + ',' + t.number + "))|"
                    + "<br> -> Replace " + x.number + '->' + y.number
                    + ' by ' + y.number + '->' + t.number);
                return this.importantLemma(layers, y, t);
            }
        } else {
            console.error("Both {x, t} and {y, t} are tree edges!");
        }
    }

    /**
     * Finds a non-tree edge {x, y} so that the number of inner vertices >= outer vertices
     * 
     * @param {BreadthSearchVertex[][]} layers 
     * @returns {BreadthSearchVertex[]} The two vertices on the non-tree edge
     *         so that the number of inner vertices >= outer vertices
     */
    impLemmaNonTreeEdge(layers) {
        // Go up to common parent
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
                    let innerVerticesCount = innerVertices.length;
                    let outerVerticesCount = graph.vertices.length - innerVerticesCount - circleVertices.length;
                    console.log('Edge ' + bsVertex.vertex.number + ' ' + bsVertex2.vertex.number
                        + ' has ' + innerVertices.length + ' inner vertices'
                        + ' and ' + circleVertices.length + ' circle vertices');
                    if (innerVerticesCount >= outerVerticesCount) {
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
     * @returns {[Vertex[], Vertex[]]} [innerVertices, circleVertices]
     */
    calcInnerAndCircleVertices(layers, x, y) {
        let parentIdxInHigherLevelMap = layers.map((layer, i) => layer.map(bsVertex => {
            return i == 0 ? -1 : layers[i - 1].findIndex(bfsV => bfsV.vertex.eq(bsVertex.parent));
        }));

        let v1LayerIdx = layers.findIndex(layer => layer.some(bsVertex => bsVertex.vertex.eq(x)));
        let v2LayerIdx = layers.findIndex(layer => layer.some(bsVertex => bsVertex.vertex.eq(y)));
        let v1Idx = layers[v1LayerIdx].findIndex(bsVertex => bsVertex.vertex.eq(x));
        let v2Idx = layers[v2LayerIdx].findIndex(bsVertex => bsVertex.vertex.eq(y));

        // Find common parent
        let lowerOneLayer = v1LayerIdx > v2LayerIdx ? v1LayerIdx : v2LayerIdx;
        let lowerOneIndex = v1LayerIdx > v2LayerIdx ? v1Idx : v2Idx;
        let higherOneLayer = v1LayerIdx > v2LayerIdx ? v2LayerIdx : v1LayerIdx;
        let higherOneIndex = v1LayerIdx > v2LayerIdx ? v2Idx : v1Idx;

        let commonParent = null;
        let circlePath = [];
        let revCircle = [];
        for (let i = lowerOneLayer; i > higherOneLayer; i--) {
            circlePath.push(layers[i][lowerOneIndex].vertex);
            lowerOneIndex = parentIdxInHigherLevelMap[i][lowerOneIndex];
        }
        for (let i = higherOneLayer; i >= 0; i--) {
            let layer = layers[i];
            if (layer[lowerOneIndex].vertex.eq(layer[higherOneIndex].vertex)) {
                commonParent = layer[lowerOneIndex].vertex;
                circlePath.push(layers[i][lowerOneIndex].vertex);
                break;
            } else {
                circlePath.push(layers[i][lowerOneIndex].vertex);
                revCircle.push(layers[i][higherOneIndex].vertex);
            }
            lowerOneIndex = parentIdxInHigherLevelMap[i][lowerOneIndex];
            higherOneIndex = parentIdxInHigherLevelMap[i][higherOneIndex];
        }
        if (commonParent == null) {
            console.error("No common parent found!");
            return;
        }
        circlePath = circlePath.concat(revCircle.reverse());

        let innerVertices = [];
        graph.vertices.forEach(vertex => {
            if (eqIndexOf(circlePath, vertex) == -1
                && isInPolygon(vertex, toPointList(circlePath))) {
                innerVertices.push(vertex);
            }
        });
        return [innerVertices, circlePath];
    }

    /**
     * 
     * @param {BreadthSearchVertex[][]} layers 
     */
    impLemmaPrecalc(layers) {
        let vertexLowerMap = layers.map(layer => layer.map(_bsVertex => 0));
        let parentIdxInHigherLevelMap = layers.map((layer, i) => layer.map(bsVertex => {
            return i == 0 ? -1 : layers[i - 1].findIndex(bfsV => bfsV.vertex.eq(bsVertex.parent));
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
        for (var i = 0; i < layers.length; i++) {
            let layerStr = "";
            for (var j = 0; j < layers[i].length; j++) {
                layerStr += layers[i][j].vertex.number + " ";
            }
            console.log('layer ' + i + ': ' + layerStr);
        }
        console.log('graph: ', graph);
        let bfsColorSet = new ColorSet();
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
        for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            if (verticesBefore < n / 2 && verticesBefore + layer.length > n / 2) {
                seperatorIndex = i;
                break;
            }
            verticesBefore += layer.length;
        }
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

    layersToVertices(layers, layerIndexes) {
        let vertices = [];
        for (var i = 0; i < layerIndexes.length; i++) {
            vertices = vertices.concat(layers[layerIndexes[i]]);
        }
        return vertices;
    }

    async transformBackAndGetReturnValues(layers, v1_vertices, s_vertices, v2_vertices) {
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