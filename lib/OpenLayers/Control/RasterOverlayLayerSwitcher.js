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
            var show = !OpenLayers.Element.hasClass( parent, 'show' );
            //close all other popup selectors: 
            var lses = map.getControlsByClass("OpenLayers.Control.RasterOverlayLayerSwitcher").concat(
                         map.getControlsByClass("OpenLayers.Control.VectorLayerSwitcher"));
            for (r in lses) {
              if (!!lses[r].toggleWidgetDiv.parentNode) {
              OpenLayers.Element.removeClass(lses[r].toggleWidgetDiv.parentNode, 'show' );
            }}
            if (show) {
              OpenLayers.Element.addClass( parent, 'show' );
            }
            var widget = self.dataLayersDiv.parentElement;
            var offset = widget.getBoundingClientRect().bottom - $(window).height();
            if (offset > 0) {
              widget.style.top = widget.style.top.split("px")[0] - offset - 5 + "px"; // don't you love mixed type?
            }
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
                /*if (checked) {
                    OpenLayers.Element.addClass(inputElem, "is-checked");
                }*/
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
                labelSpan.innerHTML = OpenLayers.Lang.translate(layer.name);

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
    updateMap: function() {
      var i, layerEntry;
      for (i in this.dataLayers) {
        layerEntry = this.dataLayers[i];
        layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
      }
    },

    disableAll: function() {
      for (var i in this.dataLayers) {
        this.dataLayers[i].layer.setVisibility(false);
        this.dataLayers[i].inputElem.checked = false;
        OpenLayers.Element.removeClass(this.dataLayers[i].inputElem, "is-checked");
        OpenLayers.Element.removeClass(this.dataLayers[i].labelSpan, "for-checked");
      }
    },

    disableOthers: function() {
      var lses = map.getControlsByClass("OpenLayers.Control.RasterOverlayLayerSwitcher").concat(
                 map.getControlsByClass("OpenLayers.Control.VectorLayerSwitcher"));

      for (i in lses) {
        lses[i].disableAll();
      }
    },


    setLayerVisibilityByShortId: function (shortId) {
        var i, len, layerEntry, pin;

 
        for (i in this.dataLayers) {
            if (this.dataLayers[i].layer.shortid == shortId) {
                this.disableOthers();
            }
        }
        for (i in this.dataLayers) {
            layerEntry = this.dataLayers[i];

            if (layerEntry.layer.shortid == shortId) {
                pin = i;
                OpenLayers.Element.addClass(layerEntry.inputElem, "is-checked");
                OpenLayers.Element.addClass(layerEntry.labelSpan, "for-checked");
                layerEntry.inputElem.checked = true;
            } 
        }
        this.pin = pin;
        this.updateMap();
    },

    setLayerVisibilityByButton: function (button) {
        var i, len, layerEntry, pin;

        this.disableOthers();
 
        for (i in this.dataLayers) {
            layerEntry = this.dataLayers[i];

            if (layerEntry.inputElem.value == button.value) {
                pin = i;
                OpenLayers.Element.addClass(layerEntry.inputElem, "is-checked");
                OpenLayers.Element.addClass(layerEntry.labelSpan, "for-checked");
                layerEntry.inputElem.checked = true;

                this.updateMap();

                if (!!layerEntry.layer.maxExtent) {
                  var extent = layerEntry.layer.maxExtent;
                  if (!extent.containsLonLat(map.getCenter())) {
                    map.zoomToExtent(extent);
                  }
                }
                var omap = map.getControlsByClass("OpenLayers.Control.OverviewMapExpandable")[0];
                if (!!layerEntry.layer.hideOverview) {
                  $(omap.element).hide(200);
                } else {
                  $(omap.element).show(200);
                }
            }
        }
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
            button = evt.buttonElement;

        if (button._layerSwitcher === this.id) {
            if (button["for"]) {
                button = document.getElementById(button["for"]);
            }
            if (!button.disabled) {
              this.setLayerVisibilityByButton(button); 
            }
            this.map.events.triggerEvent('rasterLayersChangedByClick', {});
        }
    },        
    CLASS_NAME: "OpenLayers.Control.RasterOverlayLayerSwitcher"
});
