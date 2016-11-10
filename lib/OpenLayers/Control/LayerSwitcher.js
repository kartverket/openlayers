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
     * Property: parents
     * {Object}
     */
    parents: {},

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
        //this.compactMode = !!NK.compactMode;

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
            var name = layer.name;
            var parent = layer.parent;
            this.layerStates[i] = {
                'name': name,
                'visibility': layer.visibility,
                'inRange': layer.inRange,
                'id': layer.id,
                'isStarred': !!layer.isStarred
            };
            if (layer.isUrlDataLayer) {
              var level = this.parents.hasOwnProperty(parent) ? this.parents[parent] : 0;
              if (this.parents.hasOwnProperty(name) == false) {
                this.parents[name] = level + 1;
              }
            }
        }
        
        var visible = 0;
        var total = 0;
        
        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }
        for (var i = 0, j = layers.length; i < j; i++) {
          var layer = layers[i];
          var name = layer.name;
          if (layer.isUrlDataLayer) {
            var id = 'fg_layer_' + layer.id;
            var li = document.getElementById(id);
            if (!li) {
              li = document.createElement('li');
              li.className = 'layer-list-item layer-list-item-fg';
              li.id = id;
              li.dataset.id = layer.id;
              li.dataset.name = name;
              var parent = layer.parent;
              var level = this.parents.hasOwnProperty(parent) ? this.parents[parent] : 0;
              if (level) {
                li.classList.add('level-' + level);
              }
              li.innerHTML = this.prettifyName(layer.title);
              li.addEventListener('click', this.toggleLayerVisibility.bind(this, layer.id), false);
              this.fgDiv.appendChild(li);
            }
            if (layer.visibility) {
              visible++;
              li.classList.add('active');
            } else {
              li.classList.remove('active');
            }
            total++;
          } else {
            var id = 'layer_' + layer.shortid;
            var li = document.getElementById(id);
            if (!li) {
              li = document.createElement('li');
              li.className = 'layer-list-item layer-list-item-bg';
              li.id = id;
              li.innerHTML = OpenLayers.Lang.translate(name);
              this.bgDiv.appendChild(li);
            }
            if (layer.visibility) {
              li.classList.remove('hidden');
            } else {
              li.classList.add('hidden');
            }
          }
        }
        
        this.fgDescVisible.textContent = visible;
        this.fgDescTotal.textContent = total;

        return this.div;
    },
    
    prettifyName: function (name) {
      return name.indexOf('<!') !== -1 ? name.replace(/<!.*\[CDATA\[|\]\]>/gi, '') : name;
    },
    
    /**
     * Method toggleLayerVisibility
     * Toggles visibility of layer by name.
     * 
     * Parameters:
     * name - {String}
     * e - {Event}
     */
    toggleLayerVisibility: function (id, e) {
      var layer = map.getLayer(id);
      if (layer) {
        var visibility = !layer.visibility;
        layer.isStarred = visibility;
        layer.setVisibility(visibility);
      }
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
        this.layersDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.layersDiv, "layersDiv");
        
        this.bgLabel = document.createElement('h3');
        this.bgLabel.classList.add('list-label');
        this.bgLabel.innerHTML = OpenLayers.Lang.translate('Background layers');
        this.layersDiv.appendChild(this.bgLabel);
        
        this.bgDiv = document.createElement('ul');
        this.bgDiv.id = 'bg_' + this.id;
        this.bgDiv.classList.add('layer-list');
        this.layersDiv.appendChild(this.bgDiv);
        
        this.fgLabel = document.createElement('h3');
        this.fgLabel.classList.add('list-label');
        this.fgLabel.innerHTML = OpenLayers.Lang.translate('Service overlays');
        this.layersDiv.appendChild(this.fgLabel);
        
        this.fgDescVisible = document.createElement('span');
        this.fgDescVisible.textContent = '0';
        
        this.fgDescTotal = document.createElement('span');
        this.fgDescTotal.textContent = '0';
        
        this.fgDesc = document.createElement('small');
        this.fgDesc.classList.add('pull-right');
        this.fgDesc.appendChild(document.createTextNode('Viser '));
        this.fgDesc.appendChild(this.fgDescVisible);
        this.fgDesc.appendChild(document.createTextNode(' av '));
        this.fgDesc.appendChild(this.fgDescTotal);
        this.fgDesc.appendChild(document.createTextNode(' lag.'));
        this.fgLabel.appendChild(this.fgDesc);
        
        this.fgDiv = document.createElement('ul');
        this.fgDiv.id = 'fg_' + this.id;
        this.fgDiv.classList.add('layer-list');
        this.layersDiv.appendChild(this.fgDiv);
        
        this.div.appendChild(this.layersDiv);
    },
    
    toggleStarredLayers: function (event) {
      var self = event.data;
      NK.compactMode = event.target.checked || false;
      if (!NK.compactMode) {
        self.pauseRedraw = true;
        for (var l in NK.registeredLayers) {
          NK.registeredLayers[l]();
          delete NK.registeredLayers[l];
        }
        self.pauseRedraw = false;
      }
      self.redraw();
      NK.functions.updateHistory();
    },

    CLASS_NAME: "OpenLayers.Control.LayerSwitcher"
});
