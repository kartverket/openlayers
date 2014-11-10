/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Events/buttonclick.js
 */

/**
 * Class: OpenLayers.Control.LayerSwitcher
 * The LayerSwitcher control displays a table of contents for the map. This
 * allows the user interface to switch between BaseLasyers and to show or hide
 * Overlays. By default the switcher is shown minimized on the right edge of
 * the map, the user may expand it by clicking on the handle.
 *
 * To create the LayerSwitcher outside of the map, pass the Id of a html div
 * as the first argument to the constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.LayerSwitcher = OpenLayers.Class(OpenLayers.Control, {

    /**  
     * Property: layerStates 
     * {Array(Object)} Basically a copy of the "state" of the map's layers 
     *     the last time the control was drawn. We have this in order to avoid
     *     unnecessarily redrawing the control.
     */
    layerStates: null,

    layerExpanded: {},

  // DOM Elements

    /**
     * Property: layersDiv
     * {DOMElement}
     */
    layersDiv: null,



    /**
     * Property: minimizeDiv
     * {DOMElement}
     */
    minimizeDiv: null,

    /**
     * Property: maximizeDiv
     * {DOMElement}
     */
    maximizeDiv: null,

    /**
     * APIProperty: ascending
     * {Boolean}
     */
    ascending: true,

    /**
     * Constructor: OpenLayers.Control.LayerSwitcher
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.layerStates = [];
        //this.options = options; 
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {

        //clear out layers info and unregister their events
        this.clearLayersArray("base");
        this.clearLayersArray("data");

        this.map.events.un({
            buttonclick: this.onButtonClick,
            addlayer: this.redraw,
            changelayer: this.redraw,
            removelayer: this.redraw,
            changebaselayer: this.redraw,
            scope: this
        });
        this.events.unregister("buttonclick", this, this.onButtonClick);

        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        this.map.events.on({
            addlayer: this.redraw,
            changelayer: this.redraw,
            removelayer: this.redraw,
            changebaselayer: this.redraw,
            scope: this
        });
        if (this.outsideViewport) {
            this.events.attachToElement(this.div);
            this.events.register("buttonclick", this, this.onButtonClick);
        } else {
            this.map.events.register("buttonclick", this, this.onButtonClick);
        }
    },

    /**
     * Method: dragw
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the
     *     switcher tabs.
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this);

        // create layout divs
        this.loadContents();

        // set mode to minimize
        if(!this.outsideViewport) {
            this.minimizeControl();
        }

        // populate div with current info
        this.redraw();

        return this.div;
    },

    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function(evt) {
        var button = evt.buttonElement;
        if (button === this.minimizeDiv) {
            this.minimizeControl();
        } else if (button === this.maximizeDiv) {
            this.maximizeControl();
        }
    },

    /**
     * Method: clearLayersArray
     * User specifies either "base" or "data". we then clear all the
     *     corresponding listeners, the div, and reinitialize a new array.
     *
     * Parameters:
     * layersType - {String}
     */
    clearLayersArray: function(layersType) {
        if (this[layersType + "LayersDiv"]) {
            this[layersType + "LayersDiv"].innerHTML = "";
        }
        this[layersType + "Layers"] = [];
    },


    /**
     * Method: checkRedraw
     * Checks if the layer state has changed since the last redraw() call.
     *
     * Returns:
     * {Boolean} The layer state changed since the last redraw() call.
     */
    checkRedraw: function() {
        if ( !this.layerStates.length ||
             (this.map.layers.length != this.layerStates.length) ) {
            return true;
        }

        for (var i = 0, len = this.layerStates.length; i < len; i++) {
            var layerState = this.layerStates[i];
            var layer = this.map.layers[i];
            if ( (layerState.name != layer.name) ||
                 (layerState.inRange != layer.inRange) ||
                 (layerState.id != layer.id) ||
                 (layerState.visibility != layer.visibility) ) {
                return true;
            }
        }

        return false;
    },

    /**
     * Method: redraw
     * Goes through and takes the current state of the Map and rebuilds the
     *     control to display that state. Groups base layers into a
     *     radio-button group and lists each data layer with a checkbox.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    redraw: function() {
        //if the state hasn't changed since last redraw, no need
        // to do anything. Just return the existing div.
        if (!this.checkRedraw()) {
            return this.div;
        }

        //clear out previous layers
        this.clearLayersArray("base");
        this.clearLayersArray("data");

        var containsOverlays = false;

        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        var len = this.map.layers.length;
        this.layerStates = new Array(len);
        for (var i=0; i <len; i++) {
            var layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name,
                'visibility': layer.visibility,
                'inRange': layer.inRange,
                'id': layer.id
            };
        }

        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }

        this.events.fallThrough = true; /* forward mouseup events to the tree, for drag&drop */
        var visDiv = $("#"+this.visibleDiv.id);
        var avlDiv = $("#"+this.availableDiv.id);
        visDiv.fancytree({
          extensions: ["dnd"],
          source: [],
          minExpandLevel: 1,
          keyboard: true,
          titlesTabbable: true,
          dnd: {
            dragStart: function(node, data) { return true;},
            dragEnter: function(node, data) { 
              return ["before", "after"];
            },
            dragDrop :  function(node, data) {
              var thisLayer = map.getLayer(data.otherNode.key); //node to be moved
              var thatLayer = map.getLayer(node.key);           //nodo to move to
              //if (data.hitMode == "before") {
              map.setLayerIndex(thisLayer, map.getLayerIndex(thatLayer)); //replace position
              //} else {
              //  map.setLayerIndex(thisLayer, map.getLayerIndex(thatLayer)+1); //replace next position
              //}
            }
          }
        });
        function storeCollapsedState(observer, expanded) {
          return function(event, data) {
            observer.layerExpanded[data.node.key] = expanded;
          }
        };
        avlDiv.fancytree({
          source: [],
          minExpandLevel: 1,
          keyboard: true,
          titlesTabbable: true,
          checkbox: true,
          icons: false,
          expand: storeCollapsedState(this, true),
          collapse: storeCollapsedState(this, false),
          select: function(event, data) {
            map.getLayer(data.node.key).setVisibility(data.node.selected);
          }
        });
        
        var visTree = visDiv.fancytree("getRootNode");
        var avlTree = avlDiv.fancytree("getRootNode");
        if (!avlTree.findFirst) return; //weird

        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];

            if (!!this.filter) {
              if (layer[this.filter.key] != this.filter.value) {
                continue;
              }
            }

            if (layer.displayInLayerSwitcher) {
                var expanded = (layer.id in this.layerExpanded) ? this.layerExpanded[layer.id] : true;
                layerData = {"title": layer.name, "tooltip":layer.url, "key":layer.id, "expanded": expanded };
                if (layer.getVisibility()) {
                  visTree.addChildren(layerData);
                  layerData['selected'] = true;
                }
                if (!!layer.parent) {
                  var parents = avlTree.findAll(layer.parent);
                  for (var p in parents) {
                    if (!parents[p].unselectable) { /* ignore service title nodes */
                      parents[p].addChildren(layerData);
                      break;
                    }
                  }
                } else if (!!layer.serviceTitle) {
                  var parent = avlTree.findFirst(layer.serviceTitle);
                  if (!parent) {
                    var expanded = (layer.url in this.layerExpanded) ? this.layerExpanded[layer.url] : true;
                    parent = avlTree.addChildren({"title":layer.type.toUpperCase()+": "+layer.serviceTitle, "key":layer.url, 
                                                  "tooltip":layer.url, "hideCheckbox": true, "unselectable": true, "expanded": expanded })
                  }
                  parent.addChildren(layerData);
                } else {
                  avlTree.addChildren(layerData);
                } 
            }
        }

        visTree.setExpanded(true);
        avlTree.setExpanded(true);
        // if no overlays, dont display the overlay label

        return this.div;
    },

    /**
     * Method: maximizeControl
     * Set up the labels and divs for the control
     *
     * Parameters:
     * e - {Event}
     */
    maximizeControl: function(e) {

        // set the div's width and height to empty values, so
        // the div dimensions can be controlled by CSS
        this.div.style.width = "";
        this.div.style.height = "";

        this.showControls(false);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * Method: minimizeControl
     * Hide all the contents of the control, shrink the size,
     *     add the maximize icon
     *
     * Parameters:
     * e - {Event}
     */
    minimizeControl: function(e) {

        // to minimize the control we set its div's width
        // and height to 0px, we cannot just set "display"
        // to "none" because it would hide the maximize
        // div
        this.div.style.width = "0px";
        this.div.style.height = "0px";

        this.showControls(true);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * Method: showControls
     * Hide/Show all LayerSwitcher controls depending on whether we are
     *     minimized or not
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {

        this.maximizeDiv.style.display = minimize ? "" : "none";
        this.minimizeDiv.style.display = minimize ? "none" : "";

        this.layersDiv.style.display = minimize ? "none" : "";
    },

    /**
     * Method: loadContents
     * Set up the labels and divs for the control
     */
    loadContents: function() {

        // layers list div
        this.layersDiv = document.createElement("div");
        this.layersDiv.id = this.id + "_layersDiv";
        OpenLayers.Element.addClass(this.layersDiv, "layersDiv");

        this.visibleLbl = document.createElement("div");
        this.visibleLbl.innerHTML = OpenLayers.Lang.translate("Visible overlays");

        this.visibleDiv = document.createElement("div");
        this.visibleDiv.id = this.id + "_visibleTree";
        OpenLayers.Element.addClass(this.visibleDiv, "visibleDiv");

        this.layersDiv.appendChild(this.visibleLbl);
        this.layersDiv.appendChild(this.visibleDiv);

        this.availableLbl = document.createElement("div");
        this.availableLbl.innerHTML = OpenLayers.Lang.translate("Available overlays");

        this.availableDiv = document.createElement("div");
        this.availableDiv.id = this.id + "_availableTree";
        OpenLayers.Element.addClass(this.availableDiv, "availableDiv");

        this.layersDiv.appendChild(this.availableLbl);
        this.layersDiv.appendChild(this.availableDiv);

        this.div.appendChild(this.layersDiv);

        // maximize button div
        var img = OpenLayers.Util.getImageLocation('layer-switcher-maximize.png');
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MaximizeDiv",
                                    null,
                                    null,
                                    img,
                                    "absolute");
        OpenLayers.Element.addClass(this.maximizeDiv, "maximizeDiv olButton");
        this.maximizeDiv.style.display = "none";

        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        var img = OpenLayers.Util.getImageLocation('layer-switcher-minimize.png');
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MinimizeDiv",
                                    null,
                                    null,
                                    img,
                                    "absolute");
        OpenLayers.Element.addClass(this.minimizeDiv, "minimizeDiv olButton");
        this.minimizeDiv.style.display = "none";

        this.div.appendChild(this.minimizeDiv);
    },

    CLASS_NAME: "OpenLayers.Control.LayerSwitcher"
});
