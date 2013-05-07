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
    },

    /**
    * Method: startBox
    *
    * Parameters:
    * xy - {<OpenLayers.Pixel>}
    */
    startBox: function (xy) {

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

        this.callback("done", [this.bounds]);
    },

    updateBounds: function (xy) {
        var start, end, top, bottom, left, rigth;

        start = this.dragHandler.start;
        end = xy;
        top = Math.min(start.y, end.y);
        bottom = Math.max(start.y, end.y);
        left = Math.min(start.x, end.x);
        right = Math.max(start.x, end.x);
        this.bounds = new OpenLayers.Bounds(left, bottom, right, top);
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
        this.measures.innerHTML = 'x: ' + (this.bounds.right - this.bounds.left) + 'px, y: ' + (this.bounds.bottom - this.bounds.top) + 'px';
        console.log('measures updated');
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
        OpenLayers.Element.removeClass(
            this.map.viewPortDiv, "olDrawBox"
        );

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
    deactivate: function () {
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            if (this.dragHandler.deactivate()) {
                if (this.resizableBox) {
                    this.removeBox();
                }
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
