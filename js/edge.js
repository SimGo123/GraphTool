const EdgeOrientation = {
    UNDIRECTED: 'U',
    NORMAL: 'N',
    REVERSED: 'R'
};

class Edge {
    constructor(v1nr, v2nr, id = null, weight = null, orientation = EdgeOrientation.UNDIRECTED) {
        this.v1nr = v1nr;
        this.v2nr = v2nr;
        this.id = id;
        this.weight = weight;
        this.orientation = orientation;
        this.thickness = 5;
    }

    changeOrientation() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
                this.orientation = EdgeOrientation.NORMAL;
                break;
            case EdgeOrientation.NORMAL:
                this.orientation = EdgeOrientation.REVERSED;
                break;
            case EdgeOrientation.REVERSED:
                this.orientation = EdgeOrientation.UNDIRECTED;
                break;
        }
    }

    /**
     * 
     * @returns {number} The number of the vertex at the start of the edge, depending on the orientation.
     */
    getStartVertexNr() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
            case EdgeOrientation.NORMAL:
                return this.v1nr;
            case EdgeOrientation.REVERSED:
                return this.v2nr;
        }
    }

    /**
     * 
     * @returns {number} The number of the vertex at the end of the edge, depending on the orientation.
     */
    getEndVertexNr() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
            case EdgeOrientation.NORMAL:
                return this.v2nr;
            case EdgeOrientation.REVERSED:
                return this.v1nr;
        }
    }

    draw(pGraph, selectedEdge, colorSet,
        multiEdge = false, loop = false, occurences = 1, multiEdgeIndex = -1, revPoints = false) {
        let v1r = pGraph.getVertexByNumber(this.v1nr);
        let v2r = pGraph.getVertexByNumber(this.v2nr);
        let v1 = new Point(v1r.x, v1r.y);
        let v2 = new Point(v2r.x, v2r.y);
        if (revPoints) {
            let temp = v1;
            v1 = v2;
            v2 = temp;
        }
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        var ctx = fgCanvas.getContext("2d");
        if (selectedEdge == this) {
            ctx.strokeStyle = colorSet.highlightColor;
            ctx.lineWidth = 7;
        } else {
            ctx.strokeStyle = colorSet.getEdgeColor(this);
            ctx.lineWidth = 3;
        }
        if ((occurences == 1 || occurences % 2 != 0)
            && (multiEdgeIndex == -1 || multiEdgeIndex == Math.floor(occurences / 2))) {
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
            ctx.closePath();
            if (this.weight != null) {
                let vecLen = this.weight.toString().length * 7;
                ctx.fillStyle = colorSet.getEdgeColor(this);
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, vecLen);
                controlVec = controlVec.y < 0 ? controlVec : changeVectorLength(new Point(-dy, dx), vecLen);
                ctx.fillText(this.weight, (v1.x + v2.x) / 2 + controlVec.x, (v1.y + v2.y) / 2 + controlVec.y);
            }
        }
        let startPoint = new Point(v1.x + dx / 2, v1.y + dy / 2);
        if (loop) {
            // Draw loop
            let vertex = v1;
            let length = 50;
            let height = 20;

            ctx.beginPath();
            ctx.moveTo(vertex.x, vertex.y);
            ctx.bezierCurveTo(vertex.x + length / 2, vertex.y + height, vertex.x + length, vertex.y + height, vertex.x + length, vertex.y);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(vertex.x, vertex.y);
            ctx.bezierCurveTo(vertex.x + length / 2, vertex.y - height, vertex.x + length, vertex.y - height, vertex.x + length, vertex.y);
            ctx.stroke();
            ctx.closePath();

            // Write loop count into loop, if > 1
            if (occurences > 1) {
                ctx.fillStyle = colorSet.getEdgeColor(this);
                ctx.fillText(occurences, vertex.x + length / 2, vertex.y + 5);
            }
        } else if (multiEdge) {
            // Draw multiple edges with bezier curves
            let vectorLen = 20;
            let steps = vectorLen * 2 / (occurences - 1);
            let curr = vectorLen - multiEdgeIndex * steps;

            let update = vectorLen / 4;
            if (curr > 0) {
                // Control points are perpendicular to edge
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, curr);

                let control1 = new Point(v1.x + controlVec.x, v1.y + controlVec.y);
                let control2 = new Point(v2.x + controlVec.x, v2.y + controlVec.y);
                controlVec = changeVectorLength(controlVec, curr - update);
                startPoint.x += controlVec.x;
                startPoint.y += controlVec.y;

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, v2.x, v2.y);
                ctx.stroke();
                ctx.closePath();
                // Log control1.x, control1.y, control2.x, control2.y, v2.x, v2.y
            } else if (curr < 0) {
                curr = -1 * curr;

                let controlVec = new Point(-dy, dx);
                controlVec = changeVectorLength(controlVec, curr);

                let control1 = new Point(v1.x + controlVec.x, v1.y + controlVec.y);
                let control2 = new Point(v2.x + controlVec.x, v2.y + controlVec.y);
                controlVec = changeVectorLength(controlVec, curr - update);
                startPoint.x += controlVec.x;
                startPoint.y += controlVec.y;

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, v2.x, v2.y);
                ctx.stroke();
                ctx.closePath();
            }
            if (this.weight != null) {
                let vecLen = this.weight.toString().length * 7;
                ctx.fillStyle = colorSet.getEdgeColor(this);
                let controlVec = new Point(dy, -dx);
                controlVec = changeVectorLength(controlVec, vecLen);
                controlVec = controlVec.y < 0 ? controlVec : changeVectorLength(new Point(-dy, dx), vecLen);
                ctx.fillText(this.weight, startPoint.x + controlVec.x, startPoint.y + controlVec.y);
            }
        }

        // Arrow for normal edge direction
        let deg90Vec = new Point(dy, -dx);
        let deg45Vec1 = new Point(dx - (dx - deg90Vec.x) / 2, dy - (dy - deg90Vec.y) / 2);
        deg45Vec1 = changeVectorLength(deg45Vec1, 10);
        let deg90Vec2 = new Point(-deg90Vec.x, -deg90Vec.y);
        let deg45Vec2 = new Point(dx - (dx - deg90Vec2.x) / 2, dy - (dy - deg90Vec2.y) / 2);
        deg45Vec2 = changeVectorLength(deg45Vec2, 10);

        // Changes if reverse edge direction
        if ((this.orientation == EdgeOrientation.REVERSED && !revPoints)
            || (this.orientation == EdgeOrientation.NORMAL && revPoints)) {
            deg45Vec1 = new Point(-deg45Vec1.x, -deg45Vec1.y);
            deg45Vec2 = new Point(-deg45Vec2.x, -deg45Vec2.y);
        }
        // Draw direction arrow
        if (this.orientation != EdgeOrientation.UNDIRECTED) {
            //let startPoint = new Point(v1.x + dx / 2, v1.y + dy / 2);
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(startPoint.x - deg45Vec1.x, startPoint.y - deg45Vec1.y);
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(startPoint.x - deg45Vec2.x, startPoint.y - deg45Vec2.y);
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }
    }

    eq(other, withId = false, withWeightAndOrient = false) {
        let idEq = withId ? this.id == other.id : true;
        let weightOrientEq = withWeightAndOrient ? (this.weight == other.weight && this.orientation == other.orientation) : true;
        return (this.v1nr == other.v1nr && this.v2nr == other.v2nr && idEq && weightOrientEq)
            || (this.v1nr == other.v2nr && this.v2nr == other.v1nr && idEq && weightOrientEq);
        // Also equal if edges are reversed
        // return (this.v1.eq(other.v1) && this.v2.eq(other.v2) && idEq)
        //     || (this.v1.eq(other.v2) && this.v2.eq(other.v1) && idEq);
    }

    print() {
        let idString = (this.id == null ? "" : " id: " + this.id);
        return "Edge " + this.v1nr + " " + this.v2nr + " (" + this.orientation + ")" + idString;
    }

    /**
     * A short string representation of the edge, depending on the orientation.
     * 
     * @returns {string} A string representation of the edge, depending on the orientation.
     */
    prt() {
        switch (this.orientation) {
            case EdgeOrientation.UNDIRECTED:
                return this.v1nr + " -- " + this.v2nr;
            case EdgeOrientation.NORMAL:
                return this.v1nr + " -> " + this.v2nr;
            case EdgeOrientation.REVERSED:
                return this.v2nr + " -> " + this.v1nr;
        }
    }
}
