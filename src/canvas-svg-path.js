(function (window, document, undefined) {

    // current path template
    var currentPath = {
        type: "path",
        points: new Array(),
        style: {}
    }

    // canvas DOM element
    var canvas = null;

    // canvas context
    var ctx = null;

    // elements drawn to the canvas
    var elements = [];

    var SVGCanvas = (function () {

        var SVGCanvas = function (id) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext("2d");

            /* Settings */
            this.strokeStyle = "black";
            this.lineWidth = 1;
            this.lineCap = "butt";
            this.lineJoin = "miter";
            this.miterLimit = 10;
            this.fillStyle = "transparent";
            this.shadowOffsetX = 0;
            this.shadowOffsetY = 0;
            this.shadowBlur = 0;
            this.shadowColor = "transparent black";
            this.font = "10px sans-serif";
            this.textAlign = "start";
            this.textBaseline = "alphabetic";
            this.globalAlpha = 1.0;
            this.globalCompositeOperation = "source-over";

            this.util = {

                updateCanvasSettings: function () {
                    for (key in this) { ctx[key] = this[key]; }
                },

                pushToStack: function () {
                    if (currentPath.points.length > 0) {
                        elements.push(currentPath);
                        currentPath = {
                            type: "path",
                            points: new Array(),
                            style: {}
                        }
                    }
                },
                getPath: function () {
                    var path = "";
                    for (var i = 0; i < elements.length; i++) {
                        var elem = elements[i];
                        if (elem.type == "path") {
                            var points = "";
                            for (var j = 0; j < elem.points.length; j++) {
                                var point = elem.points[j];
                                if (point.action == "move") {
                                    points += "M" + point.x + " " + point.y + " ";
                                } else if (point.action == "line") {
                                    points += "L" + point.x + " " + point.y + " ";
                                } else if (point.action == "quadratic") {
                                    points += "Q" + point.x1 + " " + point.y1 + " " + point.x + " " + point.y + " ";
                                } else if (point.action == "bezier") {
                                    points += "C" + point.x2 + " " + point.y2 + " " + point.x1 + " " + point.y1 + " " + point.x + " " + point.y + " ";
                                }
                            }
                            path = points;

                        }
                    }
                    return path;
                },
                generateSVG: function () {

                    var xml = "<?xml version=\"1.0\" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"><svg width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
                    for (var i = 0; i < elements.length; i++) {
                        var elem = elements[i];
                        var style = "";
                        for (var attr in elem.style) {
                            style += attr + ":" + elem.style[attr] + "; ";
                        }
                        if (elem.type == "text") {
                            xml += '<text x="' + elem.x + '" y="' + elem.y + '" style="' + style + '" >' + elem.text + '</text>';
                        } else if (elem.type == "path") {
                            var points = "";
                            for (var j = 0; j < elem.points.length; j++) {
                                var point = elem.points[j];
                                if (point.action == "move") {
                                    points += "M" + point.x + " " + point.y + " ";
                                } else if (point.action == "line") {
                                    points += "L" + point.x + " " + point.y + " ";
                                } else if (point.action == "quadratic") {
                                    points += "Q" + point.x1 + " " + point.y1 + " " + point.x + " " + point.y + " ";
                                } else if (point.action == "bezier") {
                                    points += "C" + point.x2 + " " + point.y2 + " " + point.x1 + " " + point.y1 + " " + point.x + " " + point.y + " ";
                                }
                            }
                            xml += '<path d="' + points + '" style="' + style + '" />';

                        }
                    }
                    xml += "</svg>"
                    return xml;

                }
            }
        }

        SVGCanvas.fn = SVGCanvas.prototype = {
            constructor: SVGCanvas,
            getCanvas: function () { return canvas; },
            getContext: function () { return ctx; },

            beginPath: function () {
                this.util.pushToStack();
                ctx.beginPath();
            },

            closePath: function () {
                this.util.pushToStack();
                ctx.closePath();
            },

            moveTo: function (x, y) {
                currentPath.points.push({ "action": "move", "x": x, "y": y });
                ctx.moveTo(x, y);
            },

            lineTo: function (x, y) {
                currentPath.points.push({ "action": "line", "x": x, "y": y });
                ctx.lineTo(x, y);
            },

            quadraticCurveTo: function (cpx, cpy, x, y) {
                currentPath.points.push({ "action": "quadratic", "x": x, "y": y, "x1": cpx, "y1": cpy });
                ctx.quadraticCurveTo(cpx, cpy, x, y);
            },

            stroke: function () {
                var path;
                if (currentPath.points.length > 0) {
                    path = currentPath;
                } else {
                    path = elements[elements.length - 1];
                }
                // path.style["fill"] = 'transparent';
                path.style["stroke"] = ctx.strokeStyle = this.strokeStyle;
                path.style["stroke-width"] = ctx.lineWidth = this.lineWidth;
                path.style["stroke-linecap"] = ctx.lineCap = this.lineCap;
                path.style["stroke-miterlimit"] = ctx.miterLimit = this.miterLimit;
                path.style["stroke-linejoin"] = ctx.lineJoin = this.lineJoin;
                this.util.updateCanvasSettings();
                ctx.stroke();
            },

            fill: function () {
                var path;
                if (currentPath.points.length > 0) {
                    path = currentPath;
                } else {
                    path = elements[elements.length - 1];
                }
                path.style["fill"] = ctx.fillStyle = this.fillStyle;
                console.log();
                this.util.updateCanvasSettings();
                ctx.fill();
            },
            toDataURL: function (type, args) {
                if (type == "image/svg+xml") {
                    return this.util.generateSVG();
                } else {
                    return ctx.toDataURL(type, args);
                }
            },
            getPath: function () {
                return this.util.getPath();
            }
        }
        return SVGCanvas;
    })();

    window.SVGCanvas = SVGCanvas;

})(window, document);