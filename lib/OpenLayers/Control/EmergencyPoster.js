 /**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Button.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
 OpenLayers.Control.EmergencyPointSelector = OpenLayers.Class(OpenLayers.Control, {
    redraw: function(evt) {
        var lonLat = this.map.getLonLatFromPixel(evt.xy);
//        console.log('clicked at ' + lonLat.lon + ' ' + lonLat.lat);
        this.map.events.triggerEvent("pointselect", {'lonLat': lonLat});
    },
    /**
     * APIMethod: activate
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.register('click', this, this.redraw);
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('click', this, this.redraw);
            return true;
        } else {
            return false;
        }
    },

    CLASS_NAME: "OpenLayers.Control.EmergencyPointSelector"
});


OpenLayers.Control.EmergencyPoster = OpenLayers.Class(OpenLayers.Control.Panel, {

	serviceURL: 'http://ws.geonorge.no/ngnk2/ngnk?SOSIKSYS=23',

	title: null,

	pointSelector: null,

	button: null,

	coordinates: null,

	termsAccepted: false,

	toggeledOn: false,

	markerLayer: null,

	termsWidget: null,

	termsAcceptButton: null,

	pointSelectInstructionWidget: null,

    initialize: function(options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Emergency poster': 'Lag nødplakat',
            'Make an emergency poster': 'Lag en nødplakat',
            'Select a position in the map': 'Velg et punkt i kartet'
        });
        
        this.title = OpenLayers.Lang.translate('Emergency poster');
    },

    setMap: function(map) {
        this.map = map;

        var ps;

        ps = new OpenLayers.Control.EmergencyPointSelector();
        this.map.addControls([ps]);
        this.pointSelector = ps;

        if (this.handler) {
            this.handler.setMap(map);
        }
        this.map.events.on()
    },

    draw: function () {
        var position, 
            size, 
            imgLocation,
            btn,
            that = this;

        OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);

        btn = OpenLayers.Util.createButton(
                    'OpenLayers_Control_EmergencyPoster_' + this.map.id,
                    null,
                    null,
                    null, "static");
        
        btn.title = this.title;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="emergency-poster icon"><circle cx="32" cy="32" r="30" fill="#ec0303" /><path fill-rule="evenodd" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z M 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg>');
        OpenLayers.Element.addClass(btn, 'emergency-poster-button');

        if (this.div == null) {
            this.div = btn;
        } else {
            this.div.appendChild(btn);
        }

        OpenLayers.Event.observe(btn, 'click',
            //penLayers.Function.bind(this.toggleSelectZoom, this)
            function() {
                if (that.toggeledOn) {
                	that.reset();
                } else {
                	that.setup();
                	that.selectPointActivate();
                }    
            }
        );
        this.button = btn;

        return btn;                                               
    },

    addMarkerLayer: function () {
    	var emergencyMarkerStyles = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                pointRadius: 11.5, // sized according to type attribute
                fillColor: "#ffcc66",
                strokeColor: "#ff9933",
                strokeWidth: 2,
                graphicZIndex: 1,
                externalGraphic: '/theme/norgeskart/img/emergency-marker.png',
                graphicWidth: 47,
                graphicHeight: 54,
                graphicYOffset: -44,
                graphicXOffset: -9

            }),
            "select": new OpenLayers.Style({
                fillColor: "#66ccff",
                strokeColor: "#3399ff",
                graphicZIndex: 2
            })
        });
        var layers = this.map.getLayersByName("emergencyPositionLayer");
        if (layers && layers.length > 0) {
        	this.markerLayer = layers[0];
        } else {
	        this.markerLayer = new OpenLayers.Layer.Vector("emergencyPositionLayer", {
	            shortid: "emergencyPositionLayer",
	            styleMap: emergencyMarkerStyles
	        });
	        this.map.addLayer(this.markerLayer);
	    }
    },
    removeMarkerLayer: function () {
    	if (this.markerLayer) { 
    		this.markerLayer.removeAllFeatures();
	    	this.markerLayer.destroy();
	    	this.markerLayer = null;
    	}
    },
    addPositionMarker: function () {
    	this.markerLayer.removeAllFeatures();
        var point = new OpenLayers.Geometry.Point(this.coordinates.lon, this.coordinates.lat);
        var feature = new OpenLayers.Feature.Vector(point, {}, null);

        this.markerLayer.addFeatures([feature]);
    },

    drawPointSelectInstruction: function () {
    	var content = document.createElement('div');
    	content.innerHTML = OpenLayers.Lang.translate('Make an emergency poster') + '<br/>' + OpenLayers.Lang.translate('Select a position in the map');
    	this.pointSelectInstructionWidget = OpenLayers.Util.createWidget(content, 1);
    	this.div.appendChild(this.pointSelectInstructionWidget);
    },
    removePointSelectInstruction: function () {
    	if (this.pointSelectInstructionWidget) {
	    	this.pointSelectInstructionWidget.parentNode.removeChild(this.pointSelectInstructionWidget);
	    	this.pointSelectInstructionWidget = null;
	    }
    },
    termsButtonObserver: function (evt) {
    	var control = map.getControlsByClass("OpenLayers.Control.EmergencyPoster")[0];
    	control.events.triggerEvent('emergencypostertermsaccepted');
    },
    drawTermsPopup: function () {
    	this.termsWidget = document.createElement('div');
    	OpenLayers.Element.addClass(this.termsWidget, "emergency-poster-terms-popup");
    	var html = '<div class="header"><h1 class="h">Nødplakat</h1><div class="steps"></div></div><div class="terms-body">';
        html += '<h2 class="h">Ansvar</h2>';
        html += '<p>Nødplakaten er utviklet i samarbeid med Hovedredningsentralene og nødetatene. Kartverket er ansvarlig for datagrunnlaget, dvs. stedsnavn og kart - samt teknologien bak.</p>';
        html += '<p>Det er brukerens ansvar å kontrollere at det er korrekt hytte eller sted som vises på plakaten.';
        html += '<p>Kartverket tar ikke ansvar for mulige feil som skyldes brukeren, datagrunnlaget eller teknologien.';
        html += '</div>';
        this.termsWidget.innerHTML = html;
        var buttonPanel = document.createElement('div');
        OpenLayers.Element.addClass(buttonPanel, "button-panel");
        this.termsAcceptButton = document.createElement('button');
        this.termsAcceptButton.innerHTML = "Jeg godtar og går videre";

        OpenLayers.Event.observe(this.termsAcceptButton, 'click', this.termsButtonObserver, true);
        buttonPanel.appendChild(this.termsAcceptButton);
        this.termsWidget.appendChild(buttonPanel);
        document.body.appendChild(this.termsWidget);
    },
	removeTermsPopup: function () {
		if (this.termsAcceptButton) {
			OpenLayers.Event.stopObservingElement(this.termsAcceptButton);
	    	this.termsAcceptButton.parentNode.removeChild(this.termsAcceptButton);
	    	this.termsAcceptButton = null;
    	}
    	if (this.termsWidget) {
	    	this.termsWidget.parentNode.removeChild(this.termsWidget);
	    	this.termsWidget = null;
	    }
    },
    setup: function () {
        this.addMarkerLayer();
        this.toggeledOn = true;
        OpenLayers.Element.addClass(this.div, 'active');
    },
    selectPointActivate: function () {
        this.pointSelector.activate();
        OpenLayers.Element.addClass(this.map.div, 'select-emergency-poster-point');
        this.map.events.register('pointselect', this, this.pointSelectedHandler);
        this.drawPointSelectInstruction();
	},
	selectPointDeactivate: function () {
        this.pointSelector.deactivate();
        OpenLayers.Element.removeClass(this.map.div, 'select-emergency-poster-point');
        this.map.events.unregister('pointselect', this, this.pointSelectedHandler);
        this.removePointSelectInstruction();
	},
    step2start: function () {
    	var that = this;
    	this.drawTermsPopup();
        this.events.register('emergencypostertermsaccepted', that, this.termsAcceptedHandler);
	},
	step2end: function () {
		var that = this;
		this.removeTermsPopup();
        this.events.unregister('emergencypostertermsaccepted', that, this.termsAcceptedHandler);
        this.reset();
	},

    redraw: function () {

    },
    reset: function () {
    	this.toggeledOn = false;
        this.coordinates = null;
        this.termsAccepted = false;
        if (this.pointSelectInstructionWidget) {
        	this.removePointSelectInstruction();
        }
        if (this.pointSelector.active) {
        	this.selectPointDeactivate();
        }
        if (this.termsWidget) {
        	this.removeTermsPopup();
        }        
        this.removeMarkerLayer();
        OpenLayers.Element.removeClass(this.div, 'active');
    },
    pointSelectedHandler: function (evt) {
    	this.setCoordinates(evt.lonLat);
        this.addPositionMarker();
    	this.selectPointDeactivate();
    	this.step2start();
    },
    setCoordinates: function (lonLat) {
    	this.coordinates = lonLat;
    },
    termsAcceptedHandler: function (evt) {
    	this.termsAccepted = true;
    	var url = this.serviceURL;
    	url += '&Ost=' + this.coordinates.lon;
    	url += '&Nord=' + this.coordinates.lat;
    	if(this.termsAccepted) {
    		url += '&harlest=ja';
    	} else {
    		url += '&harlest=nei';
    	}
    	window.open(url);
    	this.step2end();
    },

    CLASS_NAME: "OpenLayers.Control.EmergencyPoster"
});