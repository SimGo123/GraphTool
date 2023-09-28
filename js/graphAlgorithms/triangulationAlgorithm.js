class TriangulationAlgo extends Algorithm {
    async run() {
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
            var edge = new Edge(vertex.number, neighboursNeighbour.number);
            graph.addEdge(edge);
            console.log("added edge " + edge.print());
            vertex = getNextDegOneVertex();
        }
        redrawAll();
    }

    // Triangulate the graph without paying attention to loops/multi-edges
    uncleanTriangulation() {
        let allFacets = getAllFacets(graph);

        let newFacets = [];
        $.each(allFacets, function (_index, facet) {
            newFacets.push(facet);
        });

        $.each(allFacets, function (index, facet) {
            if (facet.length > 3) {
                var verticesOnFacet = [];
                $.each(facet, function (_index, edge) {
                    verticesOnFacet.push(edge.v2nr);
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
        let verticesOnFacet = getUniqueVerticeNrsOnFacet(facet);
        safeArrDel(verticesOnFacet, deleteElem.v1nr);
        safeArrDel(verticesOnFacet, deleteElem.v2nr);

        let verticesOnFacet2 = getUniqueVerticeNrsOnFacet(facet2);
        safeArrDel(verticesOnFacet2, deleteElem.v1nr);
        safeArrDel(verticesOnFacet2, deleteElem.v2nr);
        let newEdge = new Edge(verticesOnFacet[0], verticesOnFacet2[0]);
        graph.addEdge(newEdge);
        console.log("added edge " + newEdge.print());

        if (mEdge) {
            let eIdxOne = eqIndexOf(facet, new Edge(verticesOnFacet[0], deleteElem.v1nr));
            let eIdxTwo = eqIndexOf(facet2, new Edge(deleteElem.v1nr, verticesOnFacet2[0]));
            console.log('eIdxOne=' + eIdxOne + ' eIdxTwo=' + eIdxTwo);
            let newFacet = [
                newEdge,
                facet[eIdxOne],
                facet2[eIdxTwo]];
            newFacets.push(newFacet);
            console.log("added facet " + printArr(newFacet));
            eIdxOne = eqIndexOf(facet, new Edge(verticesOnFacet[0], deleteElem.v2nr));
            eIdxTwo = eqIndexOf(facet2, new Edge(deleteElem.v2nr, verticesOnFacet2[0]));
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
            let edgeToReplaceIdx = eqIndexOf(newFacet, new Edge(newEdge.v1nr, deleteElem.v1nr), true);
            newFacet[edgeToReplaceIdx] = newEdge;
            safeArrEqDel(newFacet, new Edge(newEdge.v2nr, deleteElem.v2nr), true);
            newFacets.push(newFacet);
            console.log('added facet ' + printArr(newFacet));

            let newFacet2 = [newEdge, new Edge(newEdge.v2nr, deleteElem.v1nr), new Edge(deleteElem.v1nr, newEdge.v1nr)];
            newFacets.push(newFacet2);
            console.log('added facet ' + printArr(newFacet2));

            newFacets.splice(newFacets.indexOf(facet), 1);
            newFacets.splice(newFacets.indexOf(facet2), 1);
        }
        return newFacets;
    }
}