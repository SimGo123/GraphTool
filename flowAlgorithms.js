class MaxFlowAlgo extends Algorithm {
    // TODO Adapt to MaxFlowAlgo
    preconditionsCheck() {
        let fulfilled = true;
        if (!graph.isPlanarEmbedded()) {
            alert("Graph is not planar embedded!");
            fulfilled = false;
        }
        $.each(graph.edges, function (_index, edge) {
            if (edge.weight == null) {
                alert("can't calculate weight max matching, " + edge.print() + " has no weight!");
                fulfilled = false;
                return false;
            }
        });
        return fulfilled;
    }

    async run() {
        super.numSteps = "X";

        if (!this.preconditionsCheck()) {
            super.onFinished();
            return;
        }

        await super.pause("Check if S and T on same facet", "Check if the source and the target are on the same facet. That would reduce complexity from O(nlogn) to O(n)");

        let facets = getAllFacets();
        let onSameFacet = false;
        facets.forEach((facet) => {
            let verticeNumbers = getUniqueVerticeNrsOnFacet(facet);
            if (verticeNumbers.includes(graph.source) && verticeNumbers.includes(graph.target)) {
                onSameFacet = true;
            }
        });

        if (onSameFacet) {
            await super.pause("S and T are on the same facet.", "");
            // TODO Check if S and T are on outer facet
        }

        super.onFinished();
    }
}