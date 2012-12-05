/** 
 * @requires OpenLayers/Control/LayerSwitcher.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Console.js
 */

/**
 * Class: OpenLayers.Control.Legend
 * 
 * Inherits from:
 *  - <OpenLayers.Control.LayerSwitcher>
 */
OpenLayers.Control.Legend = 
  OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {

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
            zoomend: this.redraw,
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
            zoomend: this.redraw,
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
        this.div.style.width = "";
        this.div.style.height = "25px";

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

        this.wrapperDiv.style.display = minimize ? "none" : "";
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
     * Method: checkRedraw
     * Checks if the layer state has changed since the last redraw() call.
     * 
     * Returns:
     * {Boolean} The layer state changed since the last redraw() call. 
     */
    checkRedraw: function() {
        var redraw = false;
        if ( !this.layerStates.length ||
             (this.map.layers.length != this.layerStates.length) ) {
            redraw = true;
        } else {
            for (var i=0, len=this.layerStates.length; i<len; i++) {
                var layerState = this.layerStates[i];
                var layer = this.map.layers[i];
                if ( (layerState.name != layer.name) || 
                     (layerState.inRange != layer.inRange) || 
                     (layerState.id != layer.id) || 
                     (layerState.scale != layer.map.getScale()) || 
                     (layerState.visibility != layer.visibility) ) {
                    redraw = true;
                    break;
                }    
            }
        }    
        return redraw;
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
        var containsBaseLayers = false;
        
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
                'scale': layer.map.getScale(),
                'id': layer.id
            };
        }    

        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var baseLayer = layer.isBaseLayer;

            if (layer.displayInLayerSwitcher && (!!layer.legend) && (!!layer.visibility)) {

                if (baseLayer) {
                    containsBaseLayers = true;
                } else {
                    containsOverlays = true;
                }    

                // only check a baselayer if it is *the* baselayer, check data
                //  layers if they are visible
                var checked = (baseLayer) ? (layer == this.map.baseLayer)
                                          : layer.getVisibility();
    
                  // create span
                  var labelSpan = document.createElement("label");
                  OpenLayers.Element.addClass(labelSpan, "olControlLegendLabel");
                  labelSpan._layer = layer.id;
                  labelSpan._layerSwitcher = this.id;
                  if (!baseLayer && !layer.inRange) {
                      labelSpan.style.color = "gray";
                  }
                  labelSpan.innerHTML = layer.name;
                  labelSpan.style.verticalAlign = (baseLayer) ? "bottom" 
                                                            : "baseline";
                  // create line break
                  var br = document.createElement("br");
    
                  // create legend
                  var img = document.createElement("img");
                  img.src = layer.legend + '&SCALE=' + layer.map.getScale();

                  // create line break
                  var br2 = document.createElement("br");
                
                  var groupArray = (baseLayer) ? this.baseLayers
                                               : this.dataLayers;
                  groupArray.push({
                      'layer': layer,
                      'labelSpan': labelSpan,
                      'img': img
                  });
                                                     
    
                  var groupDiv = (baseLayer) ? this.baseLayersDiv
                                             : this.dataLayersDiv;
                  groupDiv.appendChild(labelSpan);
                  groupDiv.appendChild(br);
                  groupDiv.appendChild(img);
                  groupDiv.appendChild(br2);
            }
        }

        return this.div;
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

        this.wrapperDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.wrapperDiv, "olControlLegendWrapperDiv");

        this.baseLayersDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.baseLayersDiv, "baseLayersDiv");

        this.dataLayersDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.dataLayersDiv, "dataLayersDiv");

        if (this.ascending) {
            this.wrapperDiv.appendChild(this.baseLayersDiv);
            this.wrapperDiv.appendChild(this.dataLayersDiv);
        } else {
            this.wrapperDiv.appendChild(this.dataLayersDiv);
            this.wrapperDiv.appendChild(this.baseLayersDiv);
        }    
        this.layersDiv.appendChild(this.wrapperDiv);
 
        this.div.appendChild(this.wrapperDiv);

        var img = OpenLayers.Util.getImageLocation('legend.png');
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MaximizeDiv", 
                                    null, 
                                    null, 
                                    img, 
                                    "absolute");
        OpenLayers.Element.addClass(this.maximizeDiv, "olControlLegendMaximizeDiv olButton");
        this.maximizeDiv.style.display = "none";
        
        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MinimizeDiv", 
                                    null, 
                                    null, 
                                    img, 
                                    "absolute");
        OpenLayers.Element.addClass(this.minimizeDiv, "olControlLegendMinimizeDiv olButton");
        this.minimizeDiv.style.display = "none";

        this.div.appendChild(this.minimizeDiv);
    },
    
    CLASS_NAME: "OpenLayers.Control.Legend"
});
