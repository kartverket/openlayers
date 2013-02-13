/** 
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 * @requires OpenLayers/Console.js
 * @requires OpenLayers/Events/buttonclick.js
 * @requires OpenLayers/Control/LayerSwitcher.js
  */

OpenLayers.Control.VectorLayerSwitcher = 
	OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {
    /** 
     * Property: layerGroup
     * {String}
     */
    layerGroup: null,
    name      : 'Plast- / papirkart',
    /** 
     * Method: loadContents
     * Set up the labels and divs for the control
     */
    loadContents: function() {
	var self = this, timer = 0;

        // layers list div        
        self.layersDiv = document.createElement("div");
        self.layersDiv.id = self.id + "_layersDiv";
        OpenLayers.Element.addClass(self.layersDiv, "layersDiv");

        self.toggleWidgetDiv = document.createElement("div");
        OpenLayers.Element.addClass(self.toggleWidgetDiv, "vectorWidgetToggleBtn");
	self.toggleWidgetDiv.innerHTML = self.name;
	
        self.dataLayersDiv = document.createElement("div");
        OpenLayers.Element.addClass(self.dataLayersDiv, "dataLayersDiv");

	self.widget = OpenLayers.Util.createWidget( self.dataLayersDiv );
        self.layersDiv.appendChild(self.toggleWidgetDiv);
	self.layersDiv.appendChild(self.widget);
        self.div.appendChild(self.layersDiv);
	
	self.toggleWidgetDiv.addEventListener( 'click', function( e ) {
	    var parent = self.toggleWidgetDiv.parentNode;  
	    //self.toggleClass( parent, 'show' ); 
	    OpenLayers.Element.toggleClass( parent, 'show' );
	}, true );
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

        var containsOverlays = false,
        	containsBaseLayers = false,
        	layers,
        	layer,
        	i, j,
        	len,
        	li,
        	inputElem,
        	checked,
        	labelSpan,
        	groupDiv,
        	layerList,
            lllen;

        if (!this.checkRedraw()) { 
            return this.div; 
        } 

        //clear out previous layers 
        this.clearLayersArray("data");
        
        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        layers = this.map.getLayersByClass("OpenLayers.Layer.Vector").slice();
        if (this.layerGroup) {
            for (i = 0; i < layers.length; i += 1) {
                if (this.layerGroup !== layers[i].getOptions()["layerGroup"]) {
                    layers.splice(i, 1);
                    i -= 1;
                }
            }
        }
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

        if (!this.ascending) { layers.reverse(); }
        if (layers.length > 0) {
        	layerList = document.createElement('ul');
        }
        for (i = 0, len = layers.length; i < len; i++) {
            layer = layers[i];
            baseLayer = layer.isBaseLayer;

            if (layer.displayInLayerSwitcher && !baseLayer) {

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
                inputElem._layer = layer.id;
                inputElem._layerSwitcher = this.id;

                if (!layer.inRange) {
                    inputElem.disabled = true;
                }
                
                // create span
                labelSpan = document.createElement("label");
                labelSpan["for"] = inputElem.id;
                OpenLayers.Element.addClass(labelSpan, "labelSpan olButton");
                labelSpan._layer = layer.id;
                labelSpan._layerSwitcher = this.id;
                if (!baseLayer && !layer.inRange) {
                    labelSpan.style.color = "gray";
                }
                labelSpan.innerHTML = layer.name;
                labelSpan.style.verticalAlign = "baseline";
                // create list item
                li = document.createElement("li");
    
                this.dataLayers.push({
                    'layer': layer,
                    'inputElem': inputElem,
                    'labelSpan': labelSpan
                });
    
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
     * Method: updateMap
     * Cycles through the loaded data and base layer input arrays and makes
     *     the necessary calls to the Map object such that that the map's 
     *     visual state corresponds to what the user has selected in 
     *     the control.
     */
    updateMap: function( order ) {
	var self = this, parent = self.toggleWidgetDiv.parentNode;
    	var i, layerEntry, current;
	if ( ! order ) order = [0,0];

        // set the correct visibilities for the overlays
	if ( order[1] <= order[0]  ) {
            for (i = 0; i < self.dataLayers.length; i++) {
                layerEntry = self.dataLayers[i];
                if ( layerEntry.inputElem.checked )
                    current = layerEntry;
                else
                    layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
            }
            if ( current ) current.layer.setVisibility( true );
        }
        else {
            for (i = self.dataLayers.length -1; i >= 0; i--) {
                layerEntry = self.dataLayers[i];
                if ( layerEntry.inputElem.checked )
                    current = layerEntry;
                layerEntry.layer.setVisibility(layerEntry.inputElem.checked);

            }
        }
		
	// Set activity logical.
	current ? OpenLayers.Element.addClass( parent, 'active' ) : 
	    OpenLayers.Element.removeClass( parent, 'active' );

	// Trigger the preferred layer.
	if ( current && current.layer.preferred ) {
	    var target = document.getElementById( current.layer.preferred );
	    if ( target != null ) target.click(); 	    
	}
    },
    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function (evt) {
        var i, len, layerEntry, pin, button = evt.buttonElement;

	if (button._layerSwitcher === this.id) {
            if (button["for"]) {
                button = document.getElementById(button["for"]);
            }
            if (!button.disabled) {
            	for (i = 0, len = this.dataLayers.length; i < len; i += 1) {
            	    layerEntry = this.dataLayers[i];
            	    if (layerEntry.inputElem !== button) {
            		layerEntry.inputElem.className = "";
            	    } else {
			pin = i;
            		layerEntry.inputElem.className = button.checked ? "" : "checked";
            		layerEntry.inputElem.checked = !button.checked;
            	    }
            	}
        	this.updateMap( [this.pin ||0, pin || 0]);
		this.pin = pin;
            }
        }
    },        

    /**
     * Method: 
     */
    getWindowSize: function () {
	var w = 0, h = 0;
	if(!window.innerWidth){ //IE
	    if(!(document.documentElement.clientWidth == 0)){
		w = document.documentElement.clientWidth;h = document.documentElement.clientHeight;
	    } else {
		w = document.body.clientWidth;h = document.body.clientHeight;
	    }
	} else {
	    w = window.innerWidth;h = window.innerHeight;
	}
	return {'width':w,'height':h};
    },        

    /**
     * Method: 
     */
    getOffset: function ( dom ) {
	var x = 0, y = 0;
	if ( dom ) {
	    x = dom.offsetLeft, y = dom.offsetTop;		
	    while (dom = dom.offsetParent) {
		x += dom.offsetLeft, y += dom.offsetTop;
	    }
	}		
	return {'left': x, 'top': y };
    },        

    CLASS_NAME: "OpenLayers.Control.VectorLayerSwitcher"
});	