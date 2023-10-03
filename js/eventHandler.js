var isPlaying = false;

const Modes = {
    SELECTION: 0,
    VERTICES: 1,
    EDGES: 2,
    ALGORITHMS: 3,
    PREDEFINED: 4,
    JSON: 5
};
var currentMode = Modes.SELECTION;
var graphModesGroup = $("#graphModes");
var modeItems = graphModesGroup.children("li");

function modeClick(param) {
    currentMode = param;

    let toolBoxFuncs = [changeVertexToolsVisible, changeEdgeToolsVisible,
        changeAlgorithmsVisible, changePredefinedVisible, changeJsonToolsVisible];

    if (param == Modes.ALGORITHMS) {
        $.each(toolBoxFuncs, function(_i, func) {
            func(false);
        });
        changeAlgorithmsVisible(true);
    } else if (param == Modes.PREDEFINED) {
        $.each(toolBoxFuncs, function(_i, func) {
            func(false);
        });
        changePredefinedVisible(true);
    } else if (param == Modes.JSON) {
        $.each(toolBoxFuncs, function(_i, func) {
            func(false);
        });
        changeJsonToolsVisible(true);
    } else {
        changeAlgorithmsVisible(false);
        changePredefinedVisible(false);
        changeJsonToolsVisible(false);
    }
    
    for (var i = 0; i < modeItems.length; i++) {
        var item = modeItems[i];
        if (i === param) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    }
}

function changeVertexToolsVisible(visible) {
    if (visible) {
        $("#vertexTools")[0].classList.remove("collapse");
    } else {
        $("#vertexTools")[0].classList.add("collapse");
    }
}

function changeEdgeToolsVisible(visible) {
    if (visible) {
        $("#edgeTools")[0].classList.remove("collapse");
    } else {
        $("#edgeTools")[0].classList.add("collapse");
    }
}

function changeAlgorithmsVisible(visible) {
    if (visible) {
        $("#algorithms")[0].classList.remove("collapse");
    } else {
        $("#algorithms")[0].classList.add("collapse");
    }
}

function changePredefinedVisible(visible) {
    if (visible) {
        $("#predefinedGraphs")[0].classList.remove("collapse");
    } else {
        $("#predefinedGraphs")[0].classList.add("collapse");
    }
}

function changeJsonToolsVisible(visible) {
    if (visible) {
        $("#jsonTools")[0].classList.remove("collapse");
    } else {
        $("#jsonTools")[0].classList.add("collapse");
    }
}

$("body").keypress(function(e){
    var pressed = String.fromCharCode(e.which).toLowerCase();
    switch (pressed) {
        case "v":
            console.log("v");
            modeClick(Modes.VERTICES);
            break;
        case "e":
            modeClick(Modes.EDGES);
            break;
        case "s":
            modeClick(Modes.SELECTION);
            break;
        case "a":
            modeClick(Modes.ALGORITHMS);
            break;
        case "p":
            modeClick(Modes.PREDEFINED);
            break;
        case "j":
            modeClick(Modes.JSON);
            break;
    }
});

fgCanvas.addEventListener("click", function (event) {
    console.log("fgCanvas click");
    var rect = fgCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (currentMode == Modes.VERTICES) {
        var vertex = new Vertex(x, y);
        graph.addVertex(vertex);
        changeVertexToolsVisible(false);
        changeEdgeToolsVisible(false);
    } else if (currentMode == Modes.EDGES) {
        if (selectedVertex == null) {
            var vertex = graph.getVertexAt(x, y);
            if (vertex != null) {
                selectedVertex = vertex;
            }
        } else if (selectedVertex != null) {
            var vertex = graph.getVertexAt(x, y);
            if (vertex != null) {
                var edge = new Edge(selectedVertex.number, vertex.number);
                graph.addEdge(edge);
                selectedVertex = null;
            }
        }
        changeVertexToolsVisible(false);
        changeEdgeToolsVisible(false);
    } else if (currentMode == Modes.SELECTION) {
        var vertex = graph.getVertexAt(x, y);
        var edge = graph.getEdgeAt(x, y);
        if (vertex != null) {
            if (selectedVertex == null) {
                selectedVertex = vertex;
                changeVertexToolsVisible(true);
            }
            else {
                selectedVertex = null;
                changeVertexToolsVisible(false);
            }
            selectedEdge = null;
            changeEdgeToolsVisible(false);
        } else {
            if (selectedVertex != null) {
                selectedVertex.x = x;
                selectedVertex.y = y;
                selectedVertex = null;
                selectedEdge = null;
                changeVertexToolsVisible(true);
                changeEdgeToolsVisible(false);
            } else {
                selectedVertex = null;
                if (edge != null && edge != selectedEdge) {
                    selectedEdge = edge;
                    changeEdgeToolsVisible(true);
                } else {
                    selectedEdge = null;
                    changeEdgeToolsVisible(false);
                }
                changeVertexToolsVisible(false);
            }
        }
    }

    redrawAll();
});

const VertexTools = {
    DELETE: 0,
    MAKE_SRC: 1,
    MAKE_TARGET: 2,
    DELETE_SRC: 3,
    DELETE_TARGET: 4
}

function vertexToolClick(param) {
    if (selectedVertex == null) {
        return;
    }
    if (param == VertexTools.DELETE) {
        graph.deleteVertex(selectedVertex);
        selectedVertex = null;
        changeVertexToolsVisible(false);
        redrawAll();
    } else if (param == VertexTools.MAKE_SRC) {
        graph.makeSource(selectedVertex.number);
        selectedVertex = null;
        changeVertexToolsVisible(false);
        redrawAll();
        
    } else if (param == VertexTools.MAKE_TARGET) {
        graph.makeTarget(selectedVertex.number);
        selectedVertex = null;
        changeVertexToolsVisible(false);
        redrawAll();
    } else if (param == VertexTools.DELETE_SRC) {
        graph.deleteSource(selectedVertex.number);
        selectedVertex = null;
        changeVertexToolsVisible(false);
        redrawAll();
    } else if (param == VertexTools.DELETE_TARGET) {
        graph.deleteTarget(selectedVertex.number);
        selectedVertex = null;
        changeVertexToolsVisible(false);
        redrawAll();
    }
}

const EdgeTools = {
    DELETE: 0,
    EXPAND: 1,
    CONTRACT: 2,
    CHANGE_ORIENTATION: 3,
    SET_WEIGHT: 4
}

function edgeToolClick(param) {
    if (selectedEdge == null) {
        return;
    }
    if (param == EdgeTools.DELETE) {
        graph.deleteEdge(selectedEdge);
        selectedEdge = null;
    } else if (param == EdgeTools.EXPAND) {
        graph.expandEdge(selectedEdge);
    } else if (param == EdgeTools.CONTRACT) {
        graph.contractEdge(selectedEdge);
    } else if (param == EdgeTools.CHANGE_ORIENTATION) {
        selectedEdge.changeOrientation();
    } else if (param == EdgeTools.SET_WEIGHT) {
        let newWeight = window.prompt("Enter new edge weight", "0");
        selectedEdge.weight = newWeight;
    }
    selectedEdge = null;
    changeEdgeToolsVisible(false);
    redrawAll();
}

// Display a modal popup, the ball will stop moving
function showAnyModal(anyModal) {
    stopPlaying();
    anyModal.modal('show');
}

function printArr(array) {
    var str = "";
    for (var i = 0; i < array.length; i++) {
        str += array[i].print() + " ";
    }
    return str;
}