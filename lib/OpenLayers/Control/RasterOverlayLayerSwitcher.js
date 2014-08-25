/** 
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Console.js
 * @requires OpenLayers/Events.js
 * @requires OpenLayers/Events/buttonclick.js
 * @requires OpenLayers/Control/LayerSwitcher.js
  */

OpenLayers.Control.RasterOverlayLayerSwitcher = 
	OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {

    layerGroup: null,

    /** 
     * Method: loadContents
     * Set up the labels and divs for the control
     */
    loadContents: function() {
        var self=this;

        // layers list div        
        this.layersDiv = document.createElement("div");
        this.layersDiv.id = this.id + "_layersDiv";
        OpenLayers.Element.addClass(this.layersDiv, "layersDiv");

        self.toggleWidgetDiv = document.createElement("div");
        OpenLayers.Element.addClass(self.toggleWidgetDiv, "vectorWidgetToggleBtn");
        self.toggleWidgetDiv.tabIndex = 0;
        self.toggleWidgetDiv.innerHTML = this.options.title;

        this.dataLayersDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.dataLayersDiv, "dataLayersDiv");

        self.widget = OpenLayers.Util.createWidget( self.dataLayersDiv );
        if (this.options.popup) {
          this.layersDiv.appendChild(self.toggleWidgetDiv);
          this.layersDiv.appendChild(self.widget);

          var clickFunction = function( e ) {
            var parent = self.toggleWidgetDiv.parentNode;
            //self.toggleClass( parent, 'show' );
            OpenLayers.Element.toggleClass( parent, 'show' );
          };

          OpenLayers.Event.observe(
            self.toggleWidgetDiv,
            'click',
            clickFunction,
            true
          );

        } else {
          this.layersDiv.appendChild(this.dataLayersDiv);
        }
        this.div.appendChild(this.layersDiv);
        this.map.events.register('rasterLayerChangeRequest', this, this.rasterLayerChangeRequestHandler);
    },
    rasterLayerChangeRequestHandler: function (evt) {
        this.setLayerVisibilityByShortId(evt.shortId);
    },
    initialize: function(options) {
        this.options = options;
        OpenLayers.Control.LayerSwitcher.prototype.initialize.apply(this, arguments);
        if (options.layerGroup) {
            this.layerGroup = options.layerGroup;
        }
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

        var self = this, 
            trigger = null,
            containsOverlays = false,
        	containsBaseLayers = false,
        	layers,
        	layer,
        	i,
        	len,
        	li,
        	inputElem,
        	checked,
        	labelSpan,
        	groupDiv,
        	layerList;

        if (!this.checkRedraw()) { 
            return this.div; 
        } 

        //clear out previous layers 
        this.clearLayersArray("data");
        
        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        layers = this.map.layers.slice();

        len = layers.length;
        this.layerStates = new Array(len);
        for (i = 0; i < len; i++) {
            layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name, 
                'visibility': layer.visibility,
                'inRange': layer.inRange,
                'id': layer.id
            };
        }

        if (!this.ascending) { 
            layers.reverse(); 
        }
        if (layers.length > 0) {
        	layerList = document.createElement('ul');
        }
        for (i = 0, len = layers.length; i < len; i++) {
            layer = layers[i];
            baseLayer = layer.isBaseLayer;

            if ( ((this.layerGroup && this.layerGroup === layer.layerGroup) || this.layergroup === null) && !baseLayer && (layer.CLASS_NAME === "OpenLayers.Layer.WMTS" || layer.CLASS_NAME === "OpenLayers.Layer.WMS")) {

                containsOverlays = true;

                // only check a baselayer if it is *the* baselayer, check data
                //  layers if they are visible
                checked = layer.getVisibility();
    
                // create input element
                inputElem = document.createElement("input");
                inputElem.id = this.id + "_input_" + layer.name;
                inputElem.name = this.id + "raster_layer_selector";
                inputElem.type = "radio";
                inputElem.value = layer.name;
                inputElem.checked = checked;
                inputElem.defaultChecked = checked;
                inputElem.className = "olButton";
                if (checked) {
                    OpenLayers.Element.addClass(inputElem, "is-checked");
                }
                inputElem._layer = layer.id;
                inputElem._layerSwitcher = this.id;

                if (!layer.inRange) {
                    inputElem.disabled = true;
                }
                
                // create span
                labelSpan = document.createElement("label");
                labelSpan["for"] = inputElem.id;
                OpenLayers.Element.addClass(labelSpan, "labelSpan olButton");
                if (checked) {
                    OpenLayers.Element.addClass(labelSpan, "for-checked");
                }
                labelSpan._layer = layer.id;
                labelSpan._layerSwitcher = this.id;
                labelSpan.innerHTML = layer.name;

                // create list item
                li = document.createElement("li");
                li.id = layer.shortid.replace(/\./g, '-') + '-selector';
                OpenLayers.Element.addClass(li, 'raster-layer-selector-item');

                if (!layer.displayInLayerSwitcher) {
                    OpenLayers.Element.addClass(li, 'hidden');
                }

                this.dataLayers.push({
                    'layer': layer,
                    'inputElem': inputElem,
                    'labelSpan': labelSpan
                });

                trigger = document.createElement('span');
                trigger.setAttribute('id', layer.layer);
                OpenLayers.Element.addClass(trigger, 'layerTriggerTarget');
                OpenLayers.Event.observe(trigger, 'click', OpenLayers.Function.bind(self.activate, self));
                this.events.register("click", this, this.activate);

                labelSpan.appendChild( trigger );
                li.appendChild(inputElem);
                li.appendChild(labelSpan);
                layerList.appendChild(li);		
            }
        }
        if (layerList) {
        	layerList.className = "rasterLayerList";
        	this.dataLayersDiv.appendChild(layerList);
        }

        return this.div;
    },
    /** 
     * Method: It'll activate the current layer.
     *
     * Parameters:
     * e - {Window.Event}
     */
    activate: function( e ) {
    	var target = e.target;
        
        var label = target;
        if (target.tagName != "LABEL") {
          label = target.parentNode;
        }

    	var input = document.getElementById(label['for']);

    	return input == null || input.checked ? null :	
    	    this.onButtonClick({ 'buttonElement' : label });
    },
    /** 
     * Method: updateMap
     * Cycles through the loaded data and base layer input arrays and makes
     *     the necessary calls to the Map object such that that the map's 
     *     visual state corresponds to what the user has selected in 
     *     the control.
     */
    updateMap: function( order, disableAll ) {
    	var i, 
            layerEntry, 
            current;

    	if (!order) {
            order = [0,0];
        }
        // set the correct visibilities for the overlays	
    	if (order[1] <= order[0]) {	    
            for (i = 0; i < this.dataLayers.length; i++) {
        		layerEntry = this.dataLayers[i];
        		if (layerEntry.inputElem.checked) {
        		    current = layerEntry;
        		} else {
        		    layerEntry.layer.setVisibility(layerEntry.inputElem.checked && (!disableAll));
                }
            }
 
    	} else {
            for (i = this.dataLayers.length -1; i >= 0; i--) {
                layerEntry = this.dataLayers[i];
                if (layerEntry.inputElem.checked) {
                    current = layerEntry;
                } else {
                    layerEntry.layer.setVisibility(layerEntry.inputElem.checked && (!disableAll));
                }
            }
    	}
        if (current) {
            current.layer.setVisibility(!disableAll);
        }
    },
    setLayerVisibilityByShortId: function (shortId) {
        var i, 
            len, 
            layerEntry, 
            pin;

        for (i = 0, len = this.dataLayers.length; i < len; i += 1) {
            layerEntry = this.dataLayers[i];

            if (layerEntry.layer.shortid !== shortId) {
                OpenLayers.Element.removeClass(layerEntry.inputElem, "checked");
                OpenLayers.Element.removeClass(layerEntry.inputElem, "is-checked");
                layerEntry.inputElem.checked = false;
            } else {
                pin = i;
                OpenLayers.Element.addClass(layerEntry.inputElem, "checked");
                OpenLayers.Element.addClass(layerEntry.inputElem, "is-checked");
                layerEntry.inputElem.checked = true;
            }
        }
        this.updateMap( [this.pin || 0, pin || 0] );
        this.pin = pin;
    },
    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function (evt) {
        var i, 
            len, 
            layerEntry, 
            pin = 0, 
            button = evt.buttonElement;

        if (button._layerSwitcher === this.id) {
            if (button["for"]) {
                button = document.getElementById(button["for"]);
            }
            if (!button.disabled) {
                var rasterControls = map.getControlsByClass("OpenLayers.Control.RasterOverlayLayerSwitcher");
                var dataLayers = [].concat.apply([],rasterControls.map(function(x){return x.dataLayers}));
                for (i = 0, len = dataLayers.length; i < len; i += 1) {

                    layerEntry = dataLayers[i];

                    if (layerEntry.inputElem !== button) {
                        OpenLayers.Element.removeClass(layerEntry.inputElem, "checked");
                        OpenLayers.Element.removeClass(layerEntry.inputElem, "is-checked");
                        layerEntry.inputElem.checked = false;                        
                    } else {
                        pin = i;
                        OpenLayers.Element.addClass(layerEntry.inputElem, "checked");
                        OpenLayers.Element.addClass(layerEntry.inputElem, "is-checked");
                        layerEntry.inputElem.checked = true;

                        if (!!layerEntry.layer.maxExtent) {
                          var extent = layerEntry.layer.maxExtent;
                          if (!extent.containsLonLat(map.getCenter())) {
                            map.zoomToExtent(extent);
                          }
                        }

                    }
                }
                for (i = 0; i < rasterControls.length; i++) { 
                  rasterControls[i].updateMap( [this.pin || 0, pin || 0] , this != rasterControls[i] );
                }
                this.pin = pin;
            }
            this.map.events.triggerEvent('rasterLayersChangedByClick', {});
        }
    },        
    CLASS_NAME: "OpenLayers.Control.RasterOverlayLayerSwitcher"
});
