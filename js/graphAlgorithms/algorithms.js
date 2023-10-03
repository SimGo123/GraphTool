const ALGORITHMS = {
    TRIANGULATION: 0,
    PLANAR_SEPARATOR: 1,
    WEIGHT_MAX_MATCHING: 2,
    MIXED_MAX_CUT: 3,
    MAX_FLOW: 4,
    DISJUNCT_ST_PATHS: 5,
    PLANARITY_TEST: 6,
    OKAMURA_SEYMOUR: 7,
};

var algorithm = null;

async function algorithmClick(param) {
    if (algorithm != null) {
        // TODO cancel current algorithm
    }
    switch (param) {
        case ALGORITHMS.TRIANGULATION:
            algorithm = new TriangulationAlgo();
            break;
        case ALGORITHMS.PLANAR_SEPARATOR:
            algorithm = new PlanarSeparatorAlgo();
            break;
        case ALGORITHMS.WEIGHT_MAX_MATCHING:
            algorithm = new WeightMaxMatchingAlgo();
            break;
        case ALGORITHMS.MIXED_MAX_CUT:
            algorithm = new MixedMaxCutAlgo();
            break;
        case ALGORITHMS.MAX_FLOW:
            algorithm = new MaxFlowAlgo();
            break;
        case ALGORITHMS.DISJUNCT_ST_PATHS:
            algorithm = new DisjunctSTPathsAlgo();
            break;
        case ALGORITHMS.PLANARITY_TEST:
            algorithm = new PlanarityTestAlgo();
            break;
        case ALGORITHMS.OKAMURA_SEYMOUR:
            algorithm = new OkamuraSeymourAlgo();
            break;
        default:
            // code for default case
            break;
    }

    if (algorithm) {
        $("#algoControlPanel").removeClass("invisible");
        $("#stepButton").removeClass("disabled");
        $("#stepButton").removeClass("collapse");
        $("#runCompleteButton").removeClass("collapse");
        $("#runCompleteButton").removeClass("disabled");
        $("#stepCard").removeClass("bg-success");
        $("#stepCard").removeClass("bg-danger");
        $("#finishButton").addClass("collapse");
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

function finishClick() {
    $("#finishButton").addClass("collapse");
    $("#algoControlPanel").addClass("invisible");
}

class Algorithm {
    constructor() {
        this.shouldContinue = false;
        this.runComplete = false;
        this.isSubAlgo = false; // Set to true if this algo is run as part of another algo
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
        $("#stepDescription").html(stepDesc);
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

    onFinished(wasSuccessful = false, message = null) {
        if (!this.isSubAlgo) {
            if (message) {
                $("#finishButton").removeClass("collapse");
                $("#stepButton").addClass("collapse");
                $("#runCompleteButton").addClass("collapse");
                $("#stepTitle").text("Result");
                if (wasSuccessful) {
                    $("#stepCard").addClass("bg-success");
                    $("#stepDescription").html(message);
                } else {
                    $("#stepCard").addClass("bg-danger");
                    $("#stepDescription").html(message);
                }
            } else {
                $("#algoControlPanel").addClass("invisible");
            }
            // $("#stepButton").removeClass("disabled");
            // $("#runCompleteButton").removeClass("disabled");
        }
    }
}
