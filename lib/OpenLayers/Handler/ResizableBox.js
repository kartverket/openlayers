/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Handler.js
 * @requires OpenLayers/Handler/Box.js
 * @requires OpenLayers/Handler/Drag.js
 */

/**
 * Class: OpenLayers.Handler.ResizableBox
 * Handler for dragging a rectangle across the map.  Box is displayed 
 * on mouse down (or displayed immediately if a box is provided as a constructor argument), moves on mouse move, and is finished on deactivate.
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Box> 
 */
OpenLayers.Handler.ResizableBox = OpenLayers.Class(OpenLayers.Handler.Box, {

    /** 
     * Property: dragHandler 
     * {<OpenLayers.Handler.Drag>} 
     */
    dragHandler: null,

    /**
     * APIProperty: boxDivClassName
     * {String} The CSS class to use for drawing the box. Default is
     *     olHandlerResizableBox
     */
    boxDivClassName: 'olHandlerResizableBox',
    
    /**
     * Property: boxOffsets
     * {Object} Caches box offsets from css. This is used by the getBoxOffsets
     * method.
     */
    boxOffsets: null,

    /**
     * Property: bounds
     * {OpenLayers.Bounds} Initial selected area can be set as a constructor parameter
     */
    bounds: null,
    pixelBounds: null,
    boxLayer: null,

    /**
     * Constructor: OpenLayers.Handler.Box
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 
     * callbacks - {Object} An object with a properties whose values are
     *     functions.  Various callbacks described below.
     * options - {Object} 
     *
     * Named callbacks:
     * start - Called when the box drag operation starts.
     * done - Called when the box drag operation is finished.
     *     The callback should expect to receive a single argument, the box 
     *     bounds or a pixel. If the box dragging didn't span more than a 5 
     *     pixel distance, a pixel will be returned instead of a bounds object.
     */
    initialize: function(control, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, arguments);
        this.dragHandler = new OpenLayers.Handler.Drag(
            this, 
            {
                down: this.startBox, 
                move: this.moveBox, 
                out: this.removeBox,
                up: this.endBox
            }, 
            {keyMask: this.keyMask}
        );
        if (options && options.resizableBox) {
            this.resizableBox = options.resizableBox;
        }
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Height:': 'Høyde:',
            'Width:': 'Bredde:'
        });
    },

    /**
     * Method: destroy
     */
    destroy: function() {
        OpenLayers.Handler.prototype.destroy.apply(this, arguments);
        if (this.dragHandler) {
            this.dragHandler.destroy();
            this.dragHandler = null;
        }            
    },

    /**
     * Method: setMap
     */
    setMap: function (map) {
        OpenLayers.Handler.prototype.setMap.apply(this, arguments);
        if (this.dragHandler) {
            this.dragHandler.setMap(map);
        }
        this.boxLayer = new OpenLayers.Layer.Vector('embedBoxLayer', {
            shortid: "embed.box", 
            styleMap: NK.styles.dekning.land, 
            visibility: true
        });
        this.map.addLayer(this.boxLayer);
    },

    /**
    * Method: startBox
    *
    * Parameters:
    * xy - {<OpenLayers.Pixel>}
    */
    startBox: function (xy) {
        var style, p1, p2, p3, p4, pnt, ln;

        this.boxLayer.removeAllFeatures();

        this.boxControl = new OpenLayers.Control.DrawFeature(this.boxLayer,
            OpenLayers.Handler.RegularPolygon, {
                handlerOptions: {
                    sides: 4,
                    irregular: true
                }
            }
        );
        this.boxControl.activate();
/*
        this.removeBox();
        var handle;

        this.callback("start", []);
        this.resizableBox = OpenLayers.Util.createDiv('resizableBox', {
            x: -9999, y: -9999
        });
        this.resizableBox.className = this.boxDivClassName;                                         
        this.resizableBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
        
        this.map.viewPortDiv.appendChild(this.resizableBox);
        
        OpenLayers.Element.addClass(
            this.map.viewPortDiv, "olDrawBox"
        );
        this.addMeasures();
*/
    },

    /**
    * Method: moveBox
    */
    moveBox: function (xy) {
        var startX = this.dragHandler.start.x;
        var startY = this.dragHandler.start.y;
        var deltaX = Math.abs(startX - xy.x);
        var deltaY = Math.abs(startY - xy.y);

        var offset = this.getBoxOffsets();
        this.resizableBox.style.width = (deltaX + offset.width + 1) + "px";
        this.resizableBox.style.height = (deltaY + offset.height + 1) + "px";
        this.resizableBox.style.left = (xy.x < startX ?
            startX - deltaX - offset.left : startX - offset.left) + "px";
        this.resizableBox.style.top = (xy.y < startY ?
            startY - deltaY - offset.top : startY - offset.top) + "px";

        this.updateBounds(xy);
        this.updateMeasures();
    },

    /**
    * Method: endBox
    */
    endBox: function(end) {

        this.updateBounds(end);
        this.updateMeasures();
//        this.removeBox();
        this.addHandles();

        this.callback("done", [this.bounds, this.resizableBox, this.pixelBounds]);
    },

    updateBounds: function (xy) {
        var start, end, top, bottom, left, rigth, tl, br, tlp, brp;

        start = this.dragHandler.start;
        end = xy;
        top = Math.min(start.y, end.y);
        bottom = Math.max(start.y, end.y);
        left = Math.min(start.x, end.x);
        right = Math.max(start.x, end.x);
        tl =  this.map.getLonLatFromPixel({x: left, y: top});
        br =  this.map.getLonLatFromPixel({x: right, y: bottom});
        this.bounds = new OpenLayers.Bounds();
        this.bounds.extend(tl);
        this.bounds.extend(br);

        // update bounds in pixel measures
        tlp = this.map.getPixelFromLonLat(new OpenLayers.LonLat(this.bounds.left, this.bounds.top));
        brp = this.map.getPixelFromLonLat(new OpenLayers.LonLat(this.bounds.right, this.bounds.bottom));
        this.pixelBounds = new OpenLayers.Bounds(
            Math.min(tlp.x, brp.x),
            Math.min(tlp.y, brp.y),
            Math.max(tlp.x, brp.x),
            Math.max(tlp.y, brp.y)
        );
    },

    addHandles: function () {
        this.handles = {top: {}, right: {}, bottom: {}, left: {}};

        for (handle in this.handles) {
            if (this.handles.hasOwnProperty(handle)) {
                this.handles[handle].div = document.createElement('div');
                OpenLayers.Element.addClass(this.handles[handle].div, handle);
                OpenLayers.Element.addClass(this.handles[handle].div, 'handle');
                this.resizableBox.appendChild(this.handles[handle].div);
                this.handles[handle].handler = new OpenLayers.Handler.Drag(
                    this, 
                    {
                        down: function(evt, data) {console.log(evt)}, 
                        move: function(evt, data) {console.log(evt)}, 
                        out: function(evt, data) {console.log(evt)},
                        up: function(evt, data) {console.log(evt)}
                    }, 
                    {keyMask: this.keyMask}
                );
            }
        }
    },

    removeHandles: function () {
        var handle;
        if (this.handles && this.handles) {
            for (handle in this.handles) {
                if (this.handles.hasOwnProperty(handle) && this.handles[handle].div) {
                    OpenLayers.Event.stopObservingElement(this.handles[handle].div);
                    this.handles[handle].div.parentNode.removeChild(this.handles[handle].div);
                    this.handles[handle].div = null;
                    this.handles[handle].handler.destroy();
                    this.handles[handle].handler = null;
                }
            }
        }
    },

    addMeasures: function () {
        this.measures = document.createElement('div');
        OpenLayers.Element.addClass(this.measures, 'measures');
        this.resizableBox.appendChild(this.measures);
    },

    updateMeasures: function () {
        if (!this.measures) {
            this.addMeasures();
        }
        if (this.pixelBounds) {
            var size = this.pixelBounds.getSize();
            this.measures.innerHTML = '<span>' + OpenLayers.Lang.translate('Width:') + ' ' + size.w + 'px</span><span>' + OpenLayers.Lang.translate('Height:') + ' ' + size.h + 'px</span>';
        }
    },

    /**
     * Method: removeBox
     * Remove the zoombox from the screen and nullify our reference to it.
     */
    removeBox: function() {
        if (this.resizableBox) {
        this.map.viewPortDiv.removeChild(this.resizableBox);
            this.resizableBox = null;
        }
        this.boxOffsets = null;
    },

    /**
     * Method: activate
     */
    activate: function () {
        if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            this.dragHandler.activate();
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: deactivate
     */
    deactivate: function (params) {
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            if (this.dragHandler.deactivate()) {
                if (!params || !params.keepBox) {
                    if (this.resizableBox) {
                        this.removeBox();
                    }
                }
                OpenLayers.Element.removeClass(
                    this.map.viewPortDiv, "olDrawBox"
                );
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: getBoxOffsets
     * Determines border offsets for a box, according to the box model.
     * 
     * Returns:
     * {Object} an object with the following offsets:
     *     - left
     *     - right
     *     - top
     *     - bottom
     *     - width
     *     - height
     */
    getBoxOffsets: function() {
        if (!this.boxOffsets) {
            // Determine the box model. If the testDiv's clientWidth is 3, then
            // the borders are outside and we are dealing with the w3c box
            // model. Otherwise, the browser uses the traditional box model and
            // the borders are inside the box bounds, leaving us with a
            // clientWidth of 1.
            var testDiv = document.createElement("div");
            //testDiv.style.visibility = "hidden";
            testDiv.style.position = "absolute";
            testDiv.style.border = "1px solid black";
            testDiv.style.width = "3px";
            document.body.appendChild(testDiv);
            var w3cBoxModel = testDiv.clientWidth == 3;
            document.body.removeChild(testDiv);
            
            var left = parseInt(OpenLayers.Element.getStyle(this.resizableBox,
                "border-left-width"));
            var right = parseInt(OpenLayers.Element.getStyle(
                this.resizableBox, "border-right-width"));
            var top = parseInt(OpenLayers.Element.getStyle(this.resizableBox,
                "border-top-width"));
            var bottom = parseInt(OpenLayers.Element.getStyle(
                this.resizableBox, "border-bottom-width"));
            this.boxOffsets = {
                left: left,
                right: right,
                top: top,
                bottom: bottom,
                width: w3cBoxModel === false ? left + right : 0,
                height: w3cBoxModel === false ? top + bottom : 0
            };
        }
        return this.boxOffsets;
    },
  
    CLASS_NAME: "OpenLayers.Handler.Box"
});
