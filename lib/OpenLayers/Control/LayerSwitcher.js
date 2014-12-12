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

String.prototype.trunc = String.prototype.trunc || function(n) {
  return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
};

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
        if (this.pauseRedraw) {
          return false;
        }
        if ( NK.compactMode != this.compactMode) {
          return true;
        }
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
                 (layerState.visibility != layer.visibility) || 
                 (layerState.isStarred != layer.isStarred) ) {
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
        this.compactMode = !!NK.compactMode;

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
                'id': layer.id,
                'isStarred': !!layer.isStarred
            };
        }

        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }

        function setOpacity(name) {
          return function(event, ui) {
            map.getLayer(name).setOpacity(ui.value/100.0);
          }
        }

        this.events.fallThrough = true; /* forward mouseup events to the tree, for drag&drop */
        var visDiv = $("#"+this.visibleDiv.id);
        var avlDiv = $("#"+this.availableDiv.id);
        visDiv.fancytree({
          extensions: ["dnd","table","gridnav"],
          source: [],
          minExpandLevel: 1,
          keyboard: true,
          titlesTabbable: true,
          dnd: {
            dragStart: function(node, data) { return true;},
            dragEnter: function(node, data) { 
              if (!data.otherNode) {
                return false;
              }
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
          },
          table: {
            nodeColumnIdx: 0    
          },
          renderColumns: function(event, data) {
            var node = data.node;
            var tdList = $(node.tr).find(">td");
            tdList.eq(2).html("<div id='slider-" + node.key + "'></div>");
            $("#slider-"+node.key).slider({
              min: 0,
              max: 100,
              value: map.getLayer(node.key).opacity * 100,
              slide: setOpacity(node.key)
            });
          }
        });
        function storeCollapsedState(observer, expanded) {
          return function(event, data) {
            observer.layerExpanded[data.node.key] = expanded;
          }
        };
        avlDiv.fancytree({
          extensions: ["dnd", "table", "gridnav"],
          //extensions: ["dnd"],
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
          },
          table: {
            checkboxColumnIdx: 0,
            nodeColumnIdx: 1,
            indentation: 16
          },
          renderColumns: function(event, data) {
            var node = data.node;
            var tdList = $(node.tr).find(">td");
            var guid = NK.guid = NK.guid + 1 || 0;
            var info = "";
            if (node.isTopLevel()) {
              info =  "<span class='service-metadata' attribution-for='"+node.data.layerid+"'>("+OpenLayers.Lang.translate("about")+")</span>";
            } else if (!node.hideCheckbox) {
              var selected = !!map.getLayer(node.key).isStarred;
              info = '<button id="star-'+guid+'" title="' + OpenLayers.Lang.translate('Show in compact mode') + '"><svg class="star' + (selected ? ' selected' : '') + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51 48"><path d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"/></svg></button>';
            }
            tdList.eq(2).html(info);

            if (node.isTopLevel()) {
              $(document).tooltip({ 
                items:   "[attribution-for]",
                content: function() {
                  var layer = map.getLayer($(this).attr('attribution-for'));
                  if (!!layer) {
                    //return "<a href='"+layer.attribution.href+"'>
                    var html = "<span style='font-size: 12px'>";
                    if (!!layer.attribution.logo) {
                      html += "<img src='"+layer.attribution.logo+"' alt='logo' max-height='60px' style='float:right; padding-left:10px'>";
                    }
                    html += layer.attribution.title + "<p>" + layer.description + "</p></span>";
                    return html;
                  } else {
                    return false;
                  }
                } 
              });
            } else if (!node.hideCheckbox) {
              var star = $('#star-'+guid); 
              star.click(function() {
                var layer = map.getLayer(node.key);
                layer.isStarred = !layer.isStarred;
                star.children().attr('class', layer.isStarred ? 'star selected' : 'star');
              });
              
            }
          }
        });
        
        var visTree = visDiv.fancytree("getRootNode");
        var avlTree = avlDiv.fancytree("getRootNode");
        if (!avlTree.findFirst) return; //weird

        // TODO: do not recreate the whole tree every single redraw
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];

            if (!!this.filter) {
              if (layer[this.filter.key] != this.filter.value) {
                continue;
              }
            }
            if (NK.compactMode && (!(layer.isStarred || layer.visibility))) {
              continue;
            }

            if (layer.displayInLayerSwitcher) {
                var expanded = (layer.id in this.layerExpanded) ? this.layerExpanded[layer.id] : (!NK.compactMode);
                layerData = {"title": layer.name, "tooltip":layer.url, "key":layer.id, "expanded": expanded };
                this.layerExpanded[layer.id] = expanded;
                if (layer.getVisibility()) {
                  visTree.addChildren(layerData);
                  layerData['selected'] = true;
                }
                var parents = (!!layer.parent) && avlTree.findAll(layer.parent);
                if (!!parents && !!parents.length) {
                  for (var p in parents) {
                    if (parents[p].title == layer.parent) { /* only accept exact matches */
                      parents[p].addChildren(layerData);
                      break;
                    }
                  }
                } else if (!!layer.serviceTitle) {
                  var service = avlTree.findFirst(layer.serviceTitle);
                  if (!service) {
                    var expanded = (layer.url in this.layerExpanded) ? this.layerExpanded[layer.url] : (!NK.compactMode);
                    service = avlTree.addChildren({"title":layer.type.toUpperCase()+": "+layer.serviceTitle, "key":layer.url, "layerid":layer.id, 
                                                  "tooltip":layer.url, "hideCheckbox": true, "unselectable": true, "expanded": expanded });
                    this.layerExpanded[layer.url] = expanded;
                  }
                  if (!!layer.parent) {
                    var expanded = (layer.parent in this.layerExpanded) ? this.layerExpanded[layer.parent] : (!NK.compactMode);
                    var service = service.addChildren({"title":layer.parent, "key":layer.parent, "tooltip":layer.url, "hideCheckbox": true, "unselectable": true, "expanded": expanded });
                    this.layerExpanded[layer.parent] = expanded;
                  } 
                  service.addChildren(layerData);
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

        this.visibleDiv = document.createElement("table");
        this.visibleDiv.id = this.id + "_visibleTree";
        this.visibleDiv.innerHTML = "<colgroup><col width='*'></col><col width='20px'></col><col width='50px'></col></colgroup>";
        this.visibleDiv.innerHTML += "<thead><tr height=0><th></th><th></th><th></th></tr></thead>";
        this.visibleDiv.innerHTML += "<tbody><tr><td></td><td></td><td></td></tr></tbody>";
        OpenLayers.Element.addClass(this.visibleDiv, "visibleDiv");

        this.layersDiv.appendChild(this.visibleLbl);
        this.layersDiv.appendChild(this.visibleDiv);

        this.availableLbl = document.createElement("div");
        var compactLabel = NK.compactMode ? "All" : "Only starred";
        this.availableLbl.innerHTML = OpenLayers.Lang.translate("Available overlays")  + " - <button style='color:#333' id='compact-toggle'>" + 
                                      OpenLayers.Lang.translate(compactLabel) + "</button>";


        this.availableDiv = document.createElement("table");
        this.availableDiv.id = this.id + "_availableTree";
        this.availableDiv.innerHTML = "<colgroup><col width='*'></col><col width='20px'></col><col width='50px'></col></colgroup>";
        this.availableDiv.innerHTML += "<thead><tr height=0><th></th><th></th><th></th></tr></thead>";
        this.availableDiv.innerHTML += "<tbody><tr><td></td><td></td><td></td></tr></tbody>";
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

        var compactSpan = $("#compact-toggle");
        compactSpan.click(this, function(evt) {
          var self=evt.data;
          NK.compactMode = !NK.compactMode;

          if (!NK.compactMode) {
            self.pauseRedraw = true;
            for (var l in NK.registeredLayers) {
              NK.registeredLayers[l]();
              delete NK.registeredLayers[l];
            }
            self.pauseRedraw = false;
          }

          compactSpan.html(OpenLayers.Lang.translate(NK.compactMode ? "All" : "Only starred"));
          self.redraw();
          NK.functions.updateHistory();
        });
    },

    CLASS_NAME: "OpenLayers.Control.LayerSwitcher"
});
