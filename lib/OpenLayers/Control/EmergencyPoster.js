 /**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Button.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.EmergencyPoster = OpenLayers.Class(OpenLayers.Control.Panel, {

	//serviceURL: 'http://ws.geonorge.no/ngnk2/ngnk?SOSIKSYS=23',
    serviceURL: 'http://openwps.statkart.no/skwms1/wps.elevation',
	title: null,
	pointSelector: null,
    pointData: null,
	button: null,
	coordinates: null,
	termsAccepted: false,
	toggeledOn: false,
	markerLayer: null,
	termsWidget: null,
    termsAcceptButton: null,
    locationWidth: null,
    locationName: null,
    locationRedoButton: null,
    locationAcceptButton: null,
    previewLightbox: null,
    previewWidget: null,
    previewOverlay: null,
	pointSelectInstructionWidget: null,
    main : null,

    initialize: function(options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Emergency poster': 'Nødplakat',
            'Make an emergency poster': 'Lag en nødplakat',
            'Select a position in the map': 'Velg et punkt i kartet',
            'Legal': 'Ansvar',
            'Location': 'Sted',
            'Preview': 'Visning',
            'Name your marker': 'Gi punktet ditt et navn',
            'E.g. the name of your cabin': 'F.eks. navn på hytta',
            'Location is': 'Stedet er',
            'Choose a different location nearby': 'Velg et annet stedsnavn i nærheten',
            'The Emergency poster is developed in cooperation with the Joint Rescue Coordination Centres and the emergency services. The Norwegian Mapping Authority is responsible for the data layer; meaning names of locations and mapping - as well as the underlying technology.' : 'Nødplakaten er utviklet i samarbeid med Hovedredningsentralene og nødetatene. Kartverket er ansvarlig for datagrunnlaget, dvs. stedsnavn og kart - samt teknologien bak.',
            'It\'s the user\'s responsibility to ensure that the location displayed on the poster is correct.' : 'Det er brukerens ansvar å kontrollere at det er korrekt hytte eller sted som vises på plakaten.',
            'The Norwegian Mapping Authority is not responsible for possible errors caused by the user, data layer or technology.': 'Kartverket tar ikke ansvar for mulige feil som skyldes brukeren, datagrunnlaget eller teknologien.',
            'New location': 'Velg nytt sted',
            'Accept and prepare print' : 'Godkjenn og klargjør utskrift',
            'Accept and proceed' : 'Jeg godtar og går videre',
            'Download PDF' : 'Lagre PDF',
            'Doctor' : 'Lege',
            'Police' : 'Politi',
            'Fire' : 'Brann',
            'While speaking to the emergency services, say the following:' : 'Ved henvendelse til nødetaten, si følgende:',
            'My location is' : 'Stedet er',
            'My position is' : 'Min posisjon er',
            'in' : 'i',
            'degrees' : 'grader',
            'minutes' : 'minutter',
            'seconds' : 'sekunder',
            'decimal degrees' : 'desimalgrader',
            'decimal minutes' : 'desimalminutter',
            'north' : 'nord',
            'east' : 'øst'
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
            that = this,
            panel,
            toolElement;

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
            if (OpenLayers.Element.hasClass(this.div, 'panel')) {
                panel = this.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'emergency-poster');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                this.div = toolElement;
            } else {
                this.div.appendChild(btn);
            }
        }

        this.main = document.createElement('div');
        this.main.setAttribute( 'id', 'emergencyMainMenu' );
        this.main.innerHTML = '<div class="arrow"></div>';
        document.body.appendChild( this.main );

        OpenLayers.Event.observe(btn, 'click',
            //penLayers.Function.bind(this.toggleSelectZoom, this)
            function() {
                if (that.toggeledOn) {
                	that.reset();
                    that.selectPointDeactivate();
                } else {
                	that.setup();
                	that.selectPointActivate();
                    that.step1start();
                }    
            }
        );

        OpenLayers.Util.appendToggleToolClick({'self':this});

        this.button = btn;

        this.map.events.register( 'move', this, this.moveEmergencyMainMenu );

        return btn;                                               
    },

    hideControls: function () {
    	if ( OpenLayers.Element.hasClass( this.div, 'active' ) )
    	    this.reset();  
    }, //hideControls


    addMarkerLayer: function () {
    	var emergencyMarkerStyles = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                pointRadius: 11.5, // sized according to type attribute
                fillColor: "#ffcc66",
                strokeColor: "#ff9933",
                strokeWidth: 2,
                graphicZIndex: 1,
                externalGraphic: 'theme/norgeskart/img/emergency-marker.png',
                graphicWidth: 47,
                graphicHeight: 54,
                graphicYOffset: -44, // 50
                graphicXOffset: -9 // 18

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

    drawPreviewPopup: function(){

        var self = this;
            self.previewLightbox = document.createElement('div');
            self.previewWidget = document.createElement('div');

        OpenLayers.Element.removeClass(self.main, 'active');

        OpenLayers.Element.addClass(self.previewLightbox, 'emergency-poster-preview-popup splashscreen show');
        OpenLayers.Element.addClass(self.previewWidget, 'widget');
        
        self.previewWidget.innerHTML = 
            '<div class="header">'+
                '<h1 class="h">'+OpenLayers.Lang.translate('Emergency poster')+'</h1>' + 
                '<ol class="progress preview-active">'+
                    '<li class="terms">'+
                        'step <span class="step-number">1</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Legal')+'</label>'+
                    '</li>'+
                    '<li class="location">'+
                        'step <span class="step-number">2</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Location')+'</label>'+
                    '</li>'+
                    '<li class="preview">'+
                        'step <span class="step-number">3</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Preview')+'</label>'+
                    '</li>'+
                '</ol>'+
            '</div>'+
            '<div class="preview-container">'+
                '<div class="preview">'+
                    '<div class="header">'+
                        '<h1>Nødplakat for <strong>"Storholmstua"</strong></h1>'+
                    '</div>'+
                    '<table class="emergency-phone-numbers">'+
                        '<tr>'+
                            '<td>'+OpenLayers.Lang.translate('Doctor')+': <strong>113</strong></td>'+
                            '<td>'+OpenLayers.Lang.translate('Police')+': <strong>112</strong></td>'+
                            '<td>'+OpenLayers.Lang.translate('Fire')+': <strong>110</strong></td>'+
                        '</tr>'+
                    '</table>'+
                    '<p class="semi-header">'+
                        OpenLayers.Lang.translate('While speaking to the emergency services, say the following:')+
                    '</p>'+
                    '<div class="location-details-wrapper">'+
                        '<div class="location-details-header">'+
                            '<p>'+OpenLayers.Lang.translate('My location is')+'</p>'+
                            '<h2>'+self.pointData['placename']['value']+' '+OpenLayers.Lang.translate('in')+' X kommune</h2>'+
                            '<p>'+OpenLayers.Lang.translate('My position is')+'</p>'+
                            '<h2>'+
                                 '64 '+OpenLayers.Lang.translate('degrees')+' 18 '+OpenLayers.Lang.translate('minutes')+' 44 '+OpenLayers.Lang.translate('seconds')+' nord,'+
                                '</br>'+
                                '11 '+OpenLayers.Lang.translate('degrees')+' 29 '+OpenLayers.Lang.translate('minutes')+' 39 '+OpenLayers.Lang.translate('seconds')+' øst'+
                            '</h2>'+
                        '</div>'+
                        '<div class="location-details-iframe-container">'+
                            '<iframe src="'+self.getIframeURL()+'"></iframe>'+
                        '</div>'+
                        '<div class="location-details-coords">'+
                            '<p class="semi-header">'+
                                OpenLayers.Lang.translate('General coordinate information')+':'+
                            '</p>'+
                            '<table class="emergency-details-coordsinfo">'+
                                '<tr>'+
                                    '<td></td>'+
                                    '<td>'+OpenLayers.Lang.translate('degrees')+'/'+OpenLayers.Lang.translate('minutes')+'/'+OpenLayers.Lang.translate('seconds')+'</td>'+
                                    '<td>'+OpenLayers.Lang.translate('decimal degrees')+'</td>'+
                                    '<td>'+OpenLayers.Lang.translate('decimal minutes')+'</td>'+
                                '</tr>'+
                                '<tr>'+
                                    '<td>'+OpenLayers.Lang.translate('north')+' (lat)</td>'+
                                    '<td><strong>xx/xx/xx</strong></td>'+
                                    '<td><strong>xx/xx/xx</strong></td>'+
                                    '<td><strong>xx/xx/xx</strong></td>'+
                                '</tr>'+
                                '<tr>'+
                                    '<td>'+OpenLayers.Lang.translate('east')+' (long)</td>'+
                                    '<td><strong>xx/xx/xx</strong></td>'+
                                    '<td><strong>xx/xx/xx</strong></td>'+
                                    '<td><strong>xx/xx/xx</strong></td>'+
                                '</tr>'+
                            '</table>'+
                            '<table class="emergency-details-gridsystem">'+
                                '<tr>'+
                                    '<td>UTM: <strong>Sone32 620611 7134188</strong></td>'+
                                    '<td>MGRS: <strong>32W PS 2061 3418</strong></td>'+
                                '</tr>'+
                            '</table>'+
                        '</div>'+
                    '</div>'+
                    '<img src="img/logo-black-small.png" alt="Kartverket" />'+
                '</div>'+
            '</div>';

        self.previewOverlay = document.createElement('div');
        OpenLayers.Element.addClass(self.previewOverlay, 'overlay');
        self.previewLightbox.appendChild(self.previewOverlay);

        OpenLayers.Event.observe( self.previewOverlay, 'click',
            OpenLayers.Function.bind( self.previewOverlayObserver, self )
        );

        var buttonPanel = document.createElement('div');
        OpenLayers.Element.addClass(buttonPanel, "button-panel");

        self.previewSaveButton = document.createElement('button');
        OpenLayers.Element.addClass(self.previewSaveButton, 'save');
        self.previewSaveButton.innerHTML = OpenLayers.Lang.translate('Download PDF');;

        OpenLayers.Event.observe( self.previewSaveButton, 'click',
            OpenLayers.Function.bind( self.previewSaveButtonObserver, self )
        );

        self.previewPrintButton = document.createElement('button');
        OpenLayers.Element.addClass(self.previewPrintButton, 'print');
        self.previewPrintButton.innerHTML = OpenLayers.Lang.translate('Print');

        OpenLayers.Event.observe( self.previewPrintButton, 'click',
            OpenLayers.Function.bind( self.previewPrintButtonObserver, self )
        );

        buttonPanel.appendChild(self.previewSaveButton);
        buttonPanel.appendChild(self.previewPrintButton);

        self.previewWidget.appendChild(buttonPanel);
        self.previewLightbox.appendChild(self.previewWidget);

        document.body.appendChild(self.previewLightbox);
    },

    removePreviewPopup: function(){
        if (this.previewLightbox) {
            this.previewLightbox.parentNode.removeChild(this.previewLightbox);
            this.previewLightbox = null;
            this.previewWidget = null;
        }
        if (this.previewSaveButton) {
            OpenLayers.Event.stopObservingElement(this.previewSaveButton);
            this.previewSaveButton = null;
        }
        if (this.previewPrintButton) {
            OpenLayers.Event.stopObservingElement(this.previewPrintButton);
            this.previewPrintButton = null;
        }
    },

    drawLocationPopup: function (container) {

        var self = this, main = container || self.main;
            self.locationWidget = document.createElement('div');

        OpenLayers.Element.addClass(self.locationWidget, "emergency-poster-location-popup");

        self.locationWidget.innerHTML = 
            '<div class="header">' + 
                '<h1 class="h">'+OpenLayers.Lang.translate('Emergency poster')+'</h1>' + 
                '<ol class="progress location-active">'+
                    '<li class="terms">'+
                        'step <span class="step-number">1</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Legal')+'</label>'+
                    '</li>'+
                    '<li class="location">'+
                        'step <span class="step-number">2</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Location')+'</label>'+
                    '</li>'+
                    '<li class="preview">'+
                        'step <span class="step-number">3</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Preview')+'</label>'+
                    '</li>'+
                '</ol>'+
            '</div>' + 
            '<div class="step-body">' + 
                '<div class="emergency-point-name-input-wrapper">' + 
                    '<label for="emergencyPointNameInput">'+OpenLayers.Lang.translate('Name your marker')+':</label>' +
                    '<input type="text" id="emergencyPointNameInput">' + 
                    '<span>('+OpenLayers.Lang.translate('E.g. the name of your cabin')+')</span>' + 
                '</div>' + 
                '<div class="emergency-point-location-wrapper">' + 
                    '<h2>'+OpenLayers.Lang.translate('Location is')+'</h2>' + 
                    '<h3>'+self.pointData['placename']['value']+', X kommune</h3>' + 
                    '<label for="">'+OpenLayers.Lang.translate('Choose a different location nearby')+':</label>' + 
                    '<select id="emergencyPointAltLocationMenu">' + 
                        '<option>Kongeheia 212 m</option>' + 
                        '<option>Lillehagen 240 m</option>' + 
                        '<option>Maritoppen 308 m</option>' + 
                    '</select>' + 
                '</div>' +
            '</div>';

        var iframeContainer = document.createElement('div');
            iframeContainer.appendChild(self.getIframe());
        OpenLayers.Element.addClass(iframeContainer, 'iframe-container');

        self.locationWidget.appendChild(iframeContainer);

        var buttonPanel = document.createElement('div');
        OpenLayers.Element.addClass(buttonPanel, "button-panel");

        self.locationRedoButton = document.createElement('button');
        OpenLayers.Element.addClass(self.locationRedoButton, 'redo');
        self.locationRedoButton.innerHTML = OpenLayers.Lang.translate('New location');;

        OpenLayers.Event.observe( self.locationRedoButton, 'click',
            OpenLayers.Function.bind( self.locationRedoButtonObserver, self )
        );

        self.locationAcceptButton = document.createElement('button');
        OpenLayers.Element.addClass(self.locationAcceptButton, 'accept');
        self.locationAcceptButton.innerHTML = OpenLayers.Lang.translate('Accept and prepare print');

        OpenLayers.Event.observe( self.locationAcceptButton, 'click',
            OpenLayers.Function.bind( self.locationAcceptButtonObserver, self )
        );

        buttonPanel.appendChild(self.locationRedoButton);
        buttonPanel.appendChild(self.locationAcceptButton);

        self.locationWidget.appendChild(buttonPanel);

        main ? main.appendChild(self.locationWidget) : 
            document.body.appendChild(self.locationWidget);

        // TODO : Make more intelligent
        self.map.moveByPx( 0, -125 );
    },

    removeLocationPopup: function () {
        if (this.locationWidget) {
            this.locationWidget.parentNode.removeChild(this.locationWidget);
            this.locationWidget = null;
        }
        if (this.locationRedoButton) {
            OpenLayers.Event.stopObservingElement(this.locationRedoButton);
            this.locationRedoButton = null;
        }
        if (this.locationAcceptButton) {
            OpenLayers.Event.stopObservingElement(this.locationAcceptButton);
            this.locationAcceptButton = null;
        }
    },

    drawTermsPopup: function ( container ) {
        var self = this, main = container || self.main;
            self.termsWidget = document.createElement('div');

    	OpenLayers.Element.addClass(self.termsWidget, "emergency-poster-terms-popup loading");

        self.termsWidget.innerHTML =
            '<div class="loadingNotice">Loading...</div>'+
            '<div class="header">'+
                '<h1 class="h">'+OpenLayers.Lang.translate('Emergency poster')+'</h1>' + 
                '<ol class="progress terms-active">'+
                    '<li class="terms">'+
                        'step <span class="step-number">1</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Legal')+'</label>'+
                    '</li>'+
                    '<li class="location">'+
                        'step <span class="step-number">2</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Location')+'</label>'+
                    '</li>'+
                    '<li class="preview">'+
                        'step <span class="step-number">3</span> of <span>3</span>'+
                        '<span class="step-label">'+OpenLayers.Lang.translate('Preview')+'</label>'+
                    '</li>'+
                '</ol>'+
            '</div>'+
            '<div class="step-body">' +
                '<h2 class="h">'+OpenLayers.Lang.translate('Legal')+'</h2>'+
                '<p>'+
                    OpenLayers.Lang.translate('The Emergency poster is developed in cooperation with the Joint Rescue Coordination Centres and the emergency services. The Norwegian Mapping Authority is responsible for the data layer; meaning names of locations and mapping - as well as the underlying technology.')+
                '</p>'+
                '<p>'+ 
                    OpenLayers.Lang.translate('It\'s the user\'s responsibility to ensure that the location displayed on the poster is correct.')+
                '</p>'+
                '<p>'+
                    OpenLayers.Lang.translate('The Norwegian Mapping Authority is not responsible for possible errors caused by the user, data layer or technology.')+
                '</p>'+
            '</div>';

        var buttonPanel = document.createElement('div');
        OpenLayers.Element.addClass(buttonPanel, "button-panel");
        self.termsAcceptButton = document.createElement('button');
        self.termsAcceptButton.innerHTML = OpenLayers.Lang.translate('Accept and proceed');

        OpenLayers.Event.observe( self.termsAcceptButton, 'click',
            OpenLayers.Function.bind( self.termsButtonObserver, self )
        );

        buttonPanel.appendChild(self.termsAcceptButton);
        self.termsWidget.appendChild(buttonPanel);
	
    	main ? main.appendChild(self.termsWidget) :
    	  document.body.appendChild(self.termsWidget);
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
        OpenLayers.Util.renderToggleToolClick({'self':this});

        this.addMarkerLayer();
        this.toggeledOn = true;

        OpenLayers.Element.addClass(this.div, 'active');
    },
    selectPointActivate: function () {
        this.pointSelector.activate();
        OpenLayers.Element.addClass(this.map.div, 'select-emergency-poster-point');
        this.map.events.register('pointselect', this, this.pointSelectedHandler);
	},
	selectPointDeactivate: function () {
        this.pointSelector.deactivate();
        OpenLayers.Element.removeClass(this.map.div, 'select-emergency-poster-point');
        this.map.events.unregister('pointselect', this, this.pointSelectedHandler);
	},
    step1start: function () {
        this.removePointSelectInstruction();
        this.drawPointSelectInstruction();
    },
    step1end: function () {
        this.removePointSelectInstruction();
    },
    step3start: function(){
        this.removeLocationPopup();
        this.drawLocationPopup();
    },
    step3end: function(){
        this.removeLocationPopup();
    },
    step4start: function(){
        this.removePreviewPopup();
        this.drawPreviewPopup();
    },

    redraw: function () {

    },
    reset: function () {
        this.toggeledOn = false;
        this.coordinates = null;
        this.termsAccepted = false;
        this.locationName = null;

        if (this.pointSelectInstructionWidget) {
        	this.removePointSelectInstruction();
        }
        if (this.pointSelector.active) {
        	this.selectPointDeactivate();
        }
        if (this.termsWidget) {
        	this.removeTermsPopup();
        }        
        if (this.locationWidget) {
            this.removeLocationPopup();
        }
        if (this.previewLightbox) {
            this.removePreviewPopup();
        }

        this.removeMarkerLayer();
        OpenLayers.Element.removeClass(this.div, 'active');
        
        if ( this.main ) OpenLayers.Element.removeClass(this.main, 'active');
    },

    previewPrintButtonObserver: function (evt) {
        this.previewPrintHandler();
    },

    previewSaveButtonObserver: function (evt) {
        //
    },

    previewOverlayObserver: function(evt){
        // TODO: Save marker for reopening in lightbox
        this.reset();
    },

    locationRedoButtonObserver: function (evt) {
        this.locationRedoHandler();
    },

    locationAcceptButtonObserver: function (evt) {
        this.locationAcceptHandler();
    },

    termsButtonObserver: function ( evt ) { 
       this.termsAcceptedHandler();
    },

    pointSelectedHandler: function (evt) {
    	this.setCoordinates(evt.lonLat);
        this.getPointData();
        this.addPositionMarker();
        this.step1end();
    	this.step2start();
    },
    
    setCoordinates: function (lonLat) {
    	this.coordinates = lonLat;
    },

    getPointData: function () {
        
        var self = this;
        var url = self.serviceURL;
        var epsg = new OpenLayers.LonLat(self.coordinates.lon, self.coordinates.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var request = 'request=Execute&service=WPS&version=1.0.0&identifier=elevation&datainputs=[' 
                        + 'lat='+epsg.lat+';lon='+epsg.lon + ';epsg=4326;]';

        OpenLayers.Util.createAjaxRequest(function(result){
            self.pointData = self.parsePointData(result);
            OpenLayers.Element.removeClass(self.termsWidget, 'loading');
            console.log(self.pointData);
        }, url, request);

    },

    parsePointData: function (text) {

        var self = this, attr = self.attr, out = [];
        var temp = (text || '').replace(/\r/g,'').replace(/\n/g,'').replace(/\s+/g,' ');
        var list = [], data = {}, reg  = /(.*)(\<wps\:output\>(.*)\<\/wps:output\>)/i;

        do {
            test = temp.match(reg) || [];
            list.push(test[2] || '');
            temp = test[1] || '';
        } while (temp.match(reg));
        
        for (var i=0; i <list.length; i++) {
            var test = list[i].match( /\<ows\:identifier\>(.*)\<\/ows\:identifier\>/i ) || [];
            var key  = test[1];
            if ( !key ) continue;
            
            if ( !data[key] )data[key] = {};
                    
            test = list[i].match( /\<ows\:title\>(.*)\<\/ows\:title\>/i ) || [];
            data[key]['title'] = test[1] || '';

            test = list[i].match( /\<wps\:data\>(.*)\<\/wps\:data\>/i );
            test = test ? test[1].match( /\>(.*)\<\// ) || test : [];
            data[key]['value'] = test[1] || '';
        } // end of for loop

        return data;

    },
    
    termsAcceptedHandler: function (evt) {
    	this.termsAccepted = true;
    	this.step2end();
        this.step3start();
    },

    locationRedoHandler: function (evt) {
        this.reset();
        this.setup();
        this.selectPointActivate();
        this.step1start();
    },

    locationAcceptHandler: function(evt){
        this.step3end();
        this.step4start();
    },

    previewPrintHandler: function(){
        window.print();
    },

    getServicURL : function () {
	   var self = this, url = self.serviceURL, c = self.coordinates;
	   return ! url || ! c ? '' :  
	       [url,'Ost='+c.lon,'Nord='+c.lat,'harlest=ja'].join('&');
    },

    getIframe : function () {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', this.getIframeURL());
        iframe.setAttribute('width', '352px');
        iframe.setAttribute('height', '187px');
        return iframe;
    },

    getIframeURL : function () {
        var url, hash, lon = parseInt(this.coordinates.lon), lat = parseInt(this.coordinates.lat);

        hash = window.location.hash.replace(/#([0-9]+\/){3}/, '#' + this.map.zoom + '/' + lon + '/' + lat + '/'); // + 'm' + '/' + lon + '/' + lat + '/');
        url = window.location.protocol + '//' + window.location.host + window.location.pathname + 'statisk.html' + hash; // + encodeURIComponent(OpenLayers.Lang.translate('Emergency marker'));

        return url;
    },

    moveEmergencyMainMenu: function ( e ) {
        var self = this, main = self.main, center = self.coordinates;
        if ( ! center || ! main || ! OpenLayers.Element.hasClass(main,'active') ) return;

        var d = self.map.getPixelFromLonLat(center);
        var l = 'left:'+d['x']+'px;';
        var t = 'top:'+d['y']+'px;';

        main.setAttribute('style', l+t );
    },

    setCoordinate : function( center ) {
        if ( center ) this.coordinates = center;
    },

    step2start: function () {
        var self = this, main = self.main, center = self.coordinates;

    	if ( center && main) {	    
    	    OpenLayers.Element.addClass(main, 'active');
    	    self.map.setCenter( center );
    	    var h = 550, s = OpenLayers.Util.getWindowSize(),  w = [
                    parseInt( OpenLayers.Util.getStyle(main,'width')  ) || 0,
                    parseInt( OpenLayers.Util.getStyle(main,'height') ) || 0
                ];

    	    w[2] = w[0]/2, w[3] = w[1] /2;
    	    s[2] = s[0]/2, s[3] = s[1] /2;
    	    
    	    var t = h + w[3], m = s[3] - t, d = 10;
    	    if ( m <= 0 ) { 	    
                if ( t+w[3]+d > s[1] ) m += (t+w[3] - s[1] - d);
                self.map.moveByPx( 0, m );
    	    }
    	}

        if (self.locationWidget) {
            self.removeLocationPopup();
        }

        self.removeTermsPopup();
    	self.drawTermsPopup();
    },

    step2end: function(){
        this.removeTermsPopup();
    },

    CLASS_NAME: "OpenLayers.Control.EmergencyPoster"
});

OpenLayers.Control.EmergencyPointSelector = OpenLayers.Class(OpenLayers.Control, {
    initialize: function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },    
    redraw: function(evt) {
        var lonLat = this.map.getLonLatFromPixel(evt.xy);
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