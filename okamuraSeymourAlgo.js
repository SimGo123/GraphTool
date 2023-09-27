class OkamuraSeymourAlgo extends Algorithm {

    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("graph is not planar embedded!");
            fulfilled = false;
        }
        if (graph.sources.length != graph.targets.length) {
            alert("can't run okamura-seymour, different number of sources and targets!");
            fulfilled = false;
        }
        console.log('sources: ' + graph.sources.length);
        if (graph.sources.length == 0) {
            alert("can't run okamura-seymour, no sources / targets!");
            fulfilled = false;
        }
        return fulfilled;
    }

    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        await super.pause("Check if all sources and targets are on outer facet", "");

        let outerFacetPoss = tryGetOuterFacet(graph);
        let onOuterFacet = outerFacetPoss.length == 1;
        let verticeNrsOnOuterFacet = getUniqueVerticeNrsOnFacet(outerFacetPoss[0]);
        graph.sources.forEach(source => {
            if (!verticeNrsOnOuterFacet.includes(source)) {
                onOuterFacet = false;
            }
        });
        graph.targets.forEach(target => {
            if (!verticeNrsOnOuterFacet.includes(target)) {
                onOuterFacet = false;
            }
        });
        if (!onOuterFacet) {
            await super.pause("Not all sources and targets are on the outer facet", "");
            super.onFinished();
            return;
        } 
        if (!await this.testEulerCondition()) {
            super.onFinished();
            return;
        }
        await this.getBracketStructure(verticeNrsOnOuterFacet);

        super.onFinished();
        // {"canvasWidth":921,"canvasHeight":538,"sources":[9,3,2],"targets":[7,5,10],"vertices":[{"x":374,"y":229,"nr":0},{"x":348,"y":122,"nr":1},{"x":263,"y":29,"nr":2},{"x":238,"y":157,"nr":3},{"x":215,"y":305,"nr":4},{"x":205,"y":391,"nr":5},{"x":308,"y":455,"nr":6},{"x":496,"y":465,"nr":7},{"x":599,"y":411,"nr":8},{"x":633,"y":253,"nr":9},{"x":496,"y":135,"nr":10}],"edges":[{"v1nr":0,"v2nr":1,"weight":null,"orientation":"U"},{"v1nr":1,"v2nr":2,"weight":null,"orientation":"U"},{"v1nr":2,"v2nr":3,"weight":null,"orientation":"U"},{"v1nr":3,"v2nr":4,"weight":null,"orientation":"U"},{"v1nr":4,"v2nr":0,"weight":null,"orientation":"U"},{"v1nr":1,"v2nr":10,"weight":null,"orientation":"U"},{"v1nr":10,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":9,"v2nr":8,"weight":null,"orientation":"U"},{"v1nr":9,"v2nr":7,"weight":null,"orientation":"U"},{"v1nr":7,"v2nr":8,"weight":null,"orientation":"U"},{"v1nr":7,"v2nr":6,"weight":null,"orientation":"U"},{"v1nr":6,"v2nr":5,"weight":null,"orientation":"U"},{"v1nr":5,"v2nr":4,"weight":null,"orientation":"U"},{"v1nr":0,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":0,"v2nr":3,"weight":null,"orientation":"U"},{"v1nr":1,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":2,"v2nr":10,"weight":null,"orientation":"U"},{"v1nr":5,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":4,"v2nr":9,"weight":null,"orientation":"U"}]}
    }

    async testEulerCondition() {
        await super.pause("Test for the euler condition",
            "For each vertex, calculate the capacity as the number of incident edges"
            + " and the density as 1 if the vertex is a source or target, 0 otherwise."
            + " Then calculate fcap({v}) = cap({v}) - dens({v})."
            + " If fcap({v}) < 0 or fcap({v}) is odd for any vertex v, the euler condition is not fulfilled.");
        for (let i = 0; i < graph.vertices.length; i++) {
            let vertex = graph.vertices[i];
            let incidentEdges = graph.getIncidentEdges(vertex);
            let capacity = incidentEdges.length;
            let density = (graph.sources.includes(vertex.number)
                || graph.targets.includes(vertex.number)) ? 1 : 0;
            let fcap = capacity - density;
            if (fcap < 0 || fcap % 2 != 0) {
                let violatingColorSet = new ColorSet();
                violatingColorSet.addVertexColor(vertex.number, "red");
                redrawAll(violatingColorSet);
                await super.pause("Vertex " + vertex.number + " violates the euler condition",
                    "It has capacity " + capacity + " and density " + density + ", so fcap({" + vertex.number + "}) = " + fcap);
                return false;
            }
        }
        return true;
    }

    //{"canvasWidth":921,"canvasHeight":538,"sources":[9,3,2],"targets":[5,10,7],"vertices":[{"x":374,"y":229,"nr":0},{"x":348,"y":122,"nr":1},{"x":263,"y":29,"nr":2},{"x":238,"y":157,"nr":3},{"x":215,"y":305,"nr":4},{"x":205,"y":391,"nr":5},{"x":308,"y":455,"nr":6},{"x":496,"y":465,"nr":7},{"x":599,"y":411,"nr":8},{"x":633,"y":253,"nr":9},{"x":496,"y":135,"nr":10}],"edges":[{"v1nr":0,"v2nr":1,"weight":null,"orientation":"U"},{"v1nr":1,"v2nr":2,"weight":null,"orientation":"U"},{"v1nr":2,"v2nr":3,"weight":null,"orientation":"U"},{"v1nr":3,"v2nr":4,"weight":null,"orientation":"U"},{"v1nr":4,"v2nr":0,"weight":null,"orientation":"U"},{"v1nr":1,"v2nr":10,"weight":null,"orientation":"U"},{"v1nr":10,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":9,"v2nr":8,"weight":null,"orientation":"U"},{"v1nr":9,"v2nr":7,"weight":null,"orientation":"U"},{"v1nr":7,"v2nr":8,"weight":null,"orientation":"U"},{"v1nr":7,"v2nr":6,"weight":null,"orientation":"U"},{"v1nr":6,"v2nr":5,"weight":null,"orientation":"U"},{"v1nr":5,"v2nr":4,"weight":null,"orientation":"U"},{"v1nr":0,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":0,"v2nr":3,"weight":null,"orientation":"U"},{"v1nr":1,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":2,"v2nr":10,"weight":null,"orientation":"U"},{"v1nr":5,"v2nr":9,"weight":null,"orientation":"U"},{"v1nr":4,"v2nr":9,"weight":null,"orientation":"U"}]}
    async getBracketStructure(outerFacetVertexNrs) {
        await super.pause("Get bracket structure","");
        let bracketString = "";
        let bracketStructure = [];
        let visited = [];
        let bracketVertexNrs = [];
        outerFacetVertexNrs.forEach(vertexNr => {
            let sIndex = graph.sources.indexOf(vertexNr);
            let tIndex = graph.targets.indexOf(vertexNr);
            if (sIndex != -1) {
                if (!visited.includes(sIndex)) {
                    bracketString += "(S"+sIndex+" ";
                    bracketStructure.push(BRACKETS.OPEN);
                } else {
                    bracketString += "S"+sIndex+") ";
                    bracketStructure.push(BRACKETS.CLOSE);

                }
                visited.push(sIndex);
                bracketVertexNrs.push(vertexNr);
            } else if (tIndex != -1) {
                if (!visited.includes(tIndex)) {
                    bracketString += "(T"+tIndex+" ";
                    bracketStructure.push(BRACKETS.OPEN);
                } else {
                    bracketString += "T"+tIndex+") ";
                    bracketStructure.push(BRACKETS.CLOSE);
                }
                visited.push(tIndex);
                bracketVertexNrs.push(vertexNr);
            }
        });
        await super.pause("Current bracket structure", bracketString + "<br>Now correct it.");
        let correctedSources = [];
        let correctedTargets = new Array(graph.targets.length).fill(-1);
        let indexStack = [];
        let correctedBracketStr = "";
        bracketStructure.forEach((bracket, i) => {
            if (bracket == BRACKETS.OPEN) {
                correctedSources.push(bracketVertexNrs[i]);
                correctedBracketStr += "(S"+(correctedSources.length-1)+" ";
                indexStack.push(correctedSources.length-1);
            } else if (bracket == BRACKETS.CLOSE) {
                console.log('is',indexStack);
                let index = indexStack.pop();
                correctedTargets[index] = bracketVertexNrs[i];
                correctedBracketStr += "T"+index+") ";
            }
        });
        graph.sources = correctedSources;
        graph.targets = correctedTargets;
        redrawAll();
        await super.pause("Corrected bracket structure", correctedBracketStr);
    }
}

const BRACKETS = {
    OPEN: 0,
    CLOSE: 1
}