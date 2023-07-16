var isPlaying = false;

const Modes = {
    SELECTION: 0,
    VERTICES: 1,
    EDGES: 2,
    ALGORITHMS: 3,
    PREDEFINED: 4
};
var currentMode = Modes.SELECTION;
var graphModesGroup = $("#graphModes");
var modeItems = graphModesGroup.children("li");

const VertexTools = {
    DELETE: 0
}

const EdgeTools = {
    DELETE: 0,
    EXPAND: 1,
    CONTRACT: 2
}

function modeClick(param) {
    currentMode = param;

    let toolBoxFuncs = [changeVertexToolsVisible, changeEdgeToolsVisible, changeAlgorithmsVisible, changePredefinedVisible];

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
        $("#algoControlPanel").addClass("invisible");
    } else {
        changeAlgorithmsVisible(false);
        changePredefinedVisible(false);
        $("#algoControlPanel").addClass("invisible");
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
    }
});

// Display a modal popup, the ball will stop moving
function showAnyModal(anyModal) {
    stopPlaying();
    anyModal.modal('show');
}