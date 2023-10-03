var vertexCount = 0;

var vertexRadius = 18;

class Vertex {
    constructor(x, y, number = -1) {
        this.x = x;
        this.y = y;
        if (number != -1) {
            this.number = number;
            if (number >= vertexCount) {
                vertexCount = number + 1;
            }
        } else {
            this.number = vertexCount++;
        }
        this.radius = vertexRadius;
    }

    draw(selectedVertex, sources, targets, colorSet) {
        var ctx = fgCanvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = colorSet.getVertexColor(this.number);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = colorSet.getVertexColor(this.number);
        let text = this.number;
        let sIndex = sources.indexOf(this.number);
        let tIndex = targets.indexOf(this.number);
        if (this.number != -1 && sIndex != -1) {
            if (sources.length > 1) {
                text = "S" + sIndex + "(" + text + ")";
            } else {
                text = "S" + text;
            }
        } else if (this.number != -1 && tIndex != -1) {
            if (sources.length > 1) {
                text = "T" + tIndex + "(" + text + ")";
            } else {
                text = "T" + text;
            }
        }
        let metrics = ctx.measureText(text);
        let txtWidth = metrics.width;
        let txtHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        ctx.fillText(text, this.x - txtWidth / 2, this.y + txtHeight / 2);
        ctx.closePath();

        if (selectedVertex == this) {
            // Draw highlighting circle around vertex
            ctx.strokeStyle = colorSet.highlightColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    }

    eq(other) {
        return this.number == other.number;
    }

    print() {
        return "Vertex " + this.number;
    }
}
