const ALGORITHMS = {
    TRIANGULATION: 0,
    PLANAR_SEPARATOR: 1,
};

var algorithm = null;

async function algorithmClick(param) {
    if (param == ALGORITHMS.TRIANGULATION) {
        algorithm = new TriangulationAlgo();
        $("#algoControlPanel").removeClass("invisible");
        $("#stepButton").removeClass("disabled");
        $("#runCompleteButton").removeClass("disabled");
        await algorithm.run();
        algorithm = null;
    } else if (param == ALGORITHMS.PLANAR_SEPARATOR) {
        algorithm = new PlanarSeparatorAlgo();
        $("#algoControlPanel").removeClass("invisible");
        $("#stepButton").removeClass("disabled");
        $("#runCompleteButton").removeClass("disabled");
        await algorithm.run();
        algorithm = null;
    }
}

function stepClick() {
    if (algorithm != null) {
        algorithm.shouldContinue = true;
    }
}

function runCompleteClick() {
    if (algorithm != null) {
        algorithm.runComplete = true;
        algorithm.shouldContinue = true;
    }
}

class Algorithm {
    constructor() {
        this.shouldContinue = false;
        this.runComplete = false;
        this.numSteps = 0;
        this.currentStep = 0;
    }

    async run() {

    }

    async pause(stepTitle = "", stepDesc = "") {
        this.currentStep++;
        console.log("pause");
        if (this.runComplete) {
            return;
        }
        $("#stepButton").removeClass("disabled");
        $("#runCompleteButton").removeClass("disabled");
        $("#stepTitle").text("Step " + this.currentStep + "/" + this.numSteps + ": " + stepTitle);
        $("#stepDescription").text(stepDesc);
        while (!this.shouldContinue) {
            console.log("waiting");
            await this.sleep(1000);
        }
        this.shouldContinue = false;
        $("#stepButton").addClass("disabled");
        $("#runCompleteButton").addClass("disabled");
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onFinished() {
        $("#algoControlPanel").addClass("invisible");
        // $("#stepButton").removeClass("disabled");
        // $("#runCompleteButton").removeClass("disabled");
    }
}

class TriangulationAlgo extends Algorithm {
    async run() {
        console.log("triangulation");
        super.numSteps = 4;

        await super.pause("Connect degree 1 vertices", "Connect vertices of degree 1 to the next clockwise neighbour of their neighbour");

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        this.connectDegOneVertices();

        await super.pause("Triangulate", "Triangulate the graph without paying attention to multi-edges/loops. Picks one vertex per facet and connects it with all other vertices in the facet except neighbours");
        let newFacets = this.uncleanTriangulation();

        await super.pause("Remove loops", "Remove loops");
        newFacets = this.cleanStuff(newFacets, graph.getLoops(), false);

        await super.pause("Remove multi-edges", "Remove multi-edges by deleting newly added edges and connecting them to the other vertices in the facet (edge exchange)");
        this.cleanStuff(newFacets, graph.getMultiEdges(), true);

        super.onFinished();

        return;
    }

    preconditionsCheck() {
        let fulfilled = true;
        if (graph.vertices.length < 3) {
            window.alert("can't triangulate, not enough vertices for triangulation");
            fulfilled = false;
        } else if (!graph.isPlanarEmbedded()) {
            window.alert("can't triangulate, graph is not planar embedded");
            fulfilled = false;
        } else if (graph.getConnectedComponents().length > 1) {
            window.alert("can't triangulate, graph is not connected");
            fulfilled = false;
        } else if (graph.getMultiEdges().length > 0 || graph.getLoops().length > 0) {
            window.alert("can't triangulate, graph has multi-edges or loops");
            fulfilled = false;
        }
        return fulfilled;
    }

    connectDegOneVertices() {
        var vertex = getNextDegOneVertex();
        // Add edges until there are no more vertices of degree 1
        while (vertex != null) {
            var neighbour = graph.getAllNeighbours(vertex)[0];
            // console.log("neighbour " + JSON.stringify(neighbour));
            var neighboursNeighbours = graph.getAllNeighbours(neighbour);
            let neighboursNeighbour = nextVertexAfter(neighboursNeighbours, vertex, true);
            // console.log("neighboursNeighbour " + JSON.stringify(neighboursNeighbour));
            var edge = new Edge(vertex, neighboursNeighbour);
            graph.addEdge(edge);
            console.log("added edge " + edge.print());
            vertex = getNextDegOneVertex();
        }
        redrawAll();
    }

    // Triangulate the graph without paying attention to loops/multi-edges
    uncleanTriangulation() {
        let allFacets = getAllFacets();

        let newFacets = [];
        $.each(allFacets, function (_index, facet) {
            newFacets.push(facet);
        });

        $.each(allFacets, function (index, facet) {
            if (facet.length > 3) {
                var verticesOnFacet = [];
                $.each(facet, function (_index, edge) {
                    verticesOnFacet.push(edge.v2);
                });
                let prevEdge = new Edge(verticesOnFacet[0], verticesOnFacet[1]);
                for (var i = 2; i < verticesOnFacet.length - 1; i++) {
                    var edge = new Edge(verticesOnFacet[0], verticesOnFacet[i], index + "_" + i);
                    graph.addEdge(edge);
                    console.log("added edge " + edge.print());
                    var newFacet = [
                        edge, new Edge(verticesOnFacet[i], verticesOnFacet[i - 1]),
                        prevEdge];
                    newFacets.push(newFacet);
                    prevEdge = edge;
                }
                var lastFacet = [
                    prevEdge,
                    new Edge(verticesOnFacet[verticesOnFacet.length - 2], verticesOnFacet[verticesOnFacet.length - 1]),
                    new Edge(verticesOnFacet[verticesOnFacet.length - 1], verticesOnFacet[0])];
                newFacets.push(lastFacet);
                newFacets.splice(newFacets.indexOf(facet), 1);
            }
        });

        $.each(newFacets, function (_index, facet) {
            console.log("Facet " + _index);
            let str = "";
            $.each(facet, function (_index, edge) {
                str += edge.print() + " ";
            });
            console.log(str);
        });
        redrawAll();

        return newFacets;
    }

    // if mEdge, then delete multi-edges, else delete loops in toDelete from the graph
    // and replace them by performing edge exchanges
    cleanStuff(newFacets, toDelete, mEdge) {
        const self = this;
        let noIdOccured = [];
        $.each(toDelete, function (_index, deleteElem) {
            graph.deleteEdge(deleteElem);
            let str = mEdge ? "multi-edge " : "loop";
            console.log("deleted " + str + " " + deleteElem.print());
            for (var i = 0; i < newFacets.length; i++) {
                let facet = newFacets[i];
                let index = eqIndexOf(facet, deleteElem);
                if (index != -1) {
                    let id = facet[index].id;
                    if (id != null) {
                        for (var j = i + 1; j < newFacets.length; j++) {
                            let facet2 = newFacets[j];
                            let index2 = eqIndexOf(facet2, deleteElem);
                            if (index2 != -1) {
                                let id2 = facet2[index2].id;
                                if (id == id2) {
                                    console.log("found both facets w/" + str + ": "
                                        + i + " and " + j);
                                    newFacets = self.edgeExchange(
                                        facet, index, facet2, index2,
                                        newFacets, deleteElem, mEdge);
                                    break;
                                }
                            }
                        }
                        break;
                    } else if (mEdge) {
                        // id == 0
                        if (eqIndexOf(noIdOccured, deleteElem) == -1) {
                            noIdOccured.push(deleteElem);
                        }
                    }
                }
            }
            console.log('after removing ' + str + ' ' + deleteElem.print());
            $.each(newFacets, function (_index, facet) {
                console.log("Facet " + _index);
                let str = "";
                $.each(facet, function (_index, edge) {
                    str += edge.print() + " ";
                });
                console.log(str);
            });
        });

        if (mEdge) {
            $.each(noIdOccured, function (_index, edge) {
                if (eqIndexOf(graph.edges, edge) == -1) {
                    graph.addEdge(edge);
                    console.log("re-added original edge " + edge.print());
                }
            });
        }

        redrawAll();

        return newFacets;
    }

    edgeExchange(facet, index, facet2, index2, newFacets, deleteElem, mEdge) {
        let verticesOnFacet = getUniqueVerticesOnFacet(facet);
        safeArrEqDel(verticesOnFacet, deleteElem.v1);
        safeArrEqDel(verticesOnFacet, deleteElem.v2);

        let verticesOnFacet2 = getUniqueVerticesOnFacet(facet2);
        safeArrEqDel(verticesOnFacet2, deleteElem.v1);
        safeArrEqDel(verticesOnFacet2, deleteElem.v2);
        let newEdge = new Edge(verticesOnFacet[0], verticesOnFacet2[0]);
        graph.addEdge(newEdge);
        console.log("added edge " + newEdge.print());

        if (mEdge) {
            let eIdxOne = eqIndexOf(facet, new Edge(verticesOnFacet[0], deleteElem.v1));
            let eIdxTwo = eqIndexOf(facet2, new Edge(deleteElem.v1, verticesOnFacet2[0]));
            let newFacet = [
                newEdge,
                facet[eIdxOne],
                facet2[eIdxTwo]];
            newFacets.push(newFacet);
            console.log("added facet " + printArr(newFacet));
            eIdxOne = eqIndexOf(facet, new Edge(verticesOnFacet[0], deleteElem.v2));
            eIdxTwo = eqIndexOf(facet2, new Edge(deleteElem.v2, verticesOnFacet2[0]));
            let newFacet2 = [
                newEdge,
                facet[eIdxOne],
                facet2[eIdxTwo]];
            newFacets.push(newFacet2);
            console.log("added facet " + printArr(newFacet2));
            newFacets.splice(newFacets.indexOf(facet), 1);
            newFacets.splice(newFacets.indexOf(facet2), 1);
        } else {
            let facet2WithoutLoop = facet2.slice(0, index2).concat(facet2.slice(index2 + 1));
            //console.log('sl ' + printArr(facet.slice(0, index)) + ' + ' + printArr(facet2WithoutLoop) + ' + ' + printArr(facet.slice(index + 1)));
            let newFacet = facet.slice(0, index).concat(facet2WithoutLoop).concat(facet.slice(index + 1));
            let edgeToReplaceIdx = eqIndexOf(newFacet, new Edge(newEdge.v1, deleteElem.v1), true);
            newFacet[edgeToReplaceIdx] = newEdge;
            safeArrEqDel(newFacet, new Edge(newEdge.v2, deleteElem.v2), true);
            newFacets.push(newFacet);
            console.log('added facet ' + printArr(newFacet));

            let newFacet2 = [newEdge, new Edge(newEdge.v2, deleteElem.v1), new Edge(deleteElem.v1, newEdge.v1)];
            newFacets.push(newFacet2);
            console.log('added facet ' + printArr(newFacet2));

            newFacets.splice(newFacets.indexOf(facet), 1);
            newFacets.splice(newFacets.indexOf(facet2), 1);
        }
        return newFacets;
    }
}

class PlanarSeparatorAlgo extends Algorithm {

    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        await super.pause("Construct breadth-first search tree", "Construct tree");
        let startVertexNr = window.prompt("Enter start vertex number", "0");
        let startVertex = graph.vertices[0];
        $.each(graph.vertices, function (_index, vertex) {
            if (vertex.number == startVertexNr) {
                startVertex = vertex;
                return;
            }
        });
        console.log('start vertex: ' + startVertex.print());
        let layers = breadthFirstSearchTree(startVertex);
        this.showBFSTree(layers);

        await super.pause("Draw layers", "First layer on top, other layers below");
        this.drawLayerStructure(layers);

        await super.pause("Check if a layer in the tree is a separator", "Check if a layer in the tree is a separator");
        let layerMyIdx = this.getLayerMy(layers);
        const n = graph.vertices.length;
        const maxSeparatorSize = 4 * Math.sqrt(n);
        console.log('layerMyIdx: ' + layerMyIdx + ' maxSeparatorSize: ' + maxSeparatorSize + ' mySize ' + layers[layerMyIdx].length);
        if (layers[layerMyIdx].length <= maxSeparatorSize) {
            this.rectAroundLayer(layers, layerMyIdx, "red");
            alert('Layer ' + layerMyIdx + ' is a separator');

            super.onFinished();
            return;
        }
        console.log('Layer my (' + layerMyIdx + ') is not a separator');
        this.rectAroundLayer(layers, layerMyIdx, "green");

        await super.pause("Find layers m and M", "Find layers m and M");
        let layersMmIndexes = this.getLayersMm(layers, layerMyIdx);
        this.rectAroundLayer(layers, layersMmIndexes[0], "blue");
        this.rectAroundLayer(layers, layersMmIndexes[1], "blue");

        super.onFinished();
    }

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("Graph is not planar embedded!");
            fulfilled = false;
        } else if (!graph.isTriangulated()) {
            alert("Graph is not triangulated!");
            fulfilled = false;
        }
        return fulfilled;
    }

    showBFSTree(layers) {
        console.log('layers: ' + layers.length);
        for (var i = 0; i < layers.length; i++) {
            for (var j = 0; j < layers[i].length; j++) {
                console.log(i + ' ' + layers[i][j].vertex.print());
            }
        }
        for (var i = 1; i < layers.length; i++) {
            let layer = layers[i];
            console.log('layer ' + i + ': ' + layer.length);
            for (var j = 0; j < layer.length; j++) {
                let bsVertex = layer[j];
                console.log('edge from ' + bsVertex.vertex.print() + ' to ' + bsVertex.parent.print());
                let edgeIndex = eqIndexOf(graph.edges, new Edge(bsVertex.vertex, bsVertex.parent));
                graph.edges[edgeIndex].color = "orange";
            }
        }
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
        console.log('width=' + width + ' height=' + height + ' layerHeight=' + layerHeight);
        $.each(layers, function (layerIndex, layer) {
            $.each(layer, function (bsVertexIndex, bsVertex) {
                let vertexIndex = eqIndexOf(graph.vertices, bsVertex.vertex);
                graph.vertices[vertexIndex].x = minPoint.x + width / (layer.length + 1) * (bsVertexIndex + 1);
                graph.vertices[vertexIndex].y = minPoint.y + layerHeight * layerIndex;
                console.log('y ' + layerHeight * layerIndex);
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
            console.log('n/2=' + n / 2 + ' verticesBefore=' + verticesBefore + ' verticesInclusive=' + (verticesBefore + layer.length));
            console.log('layer.length=' + layer.length + ' 4*sqrt(n)=' + 4 * Math.sqrt(n));
            if (verticesBefore < n / 2 && verticesBefore + layer.length > n / 2) {
                seperatorIndex = layerIndex;
                return;
            }
            verticesBefore += layer.length;
        });
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

    rectAroundLayer(layers, layerIndex, color) {
        var ctx = $("#fgCanvas")[0].getContext("2d");
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        let layerY = layers[layerIndex][0].vertex.y;
        let layerMinX = layers[layerIndex][0].vertex.x - 20;
        let layerMaxX = layers[layerIndex][layers[layerIndex].length - 1].vertex.x + 20;
        let width = layerMaxX - layerMinX;
        let height = 40;
        ctx.rect(layerMinX, layerY - 20, width, height);
        ctx.stroke();
        ctx.closePath();
    }
}