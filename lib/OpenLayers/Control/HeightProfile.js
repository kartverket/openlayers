/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/Path.js
 * @requires OpenLayers/Format/GPX.js
 * @requires OpenLayers/Format/WKT.js
 */

/**
 * Class: OpenLayers.Control.HeightProfile
 * The HeightProfile control.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

OpenLayers.Control.HeightProfile = OpenLayers.Class(OpenLayers.Control, {

	heightProfileServiceUrl: null,
	feature: null,
	gpxStorageUrl: null,
	gpxFormat: null,
	wktFormat: null,
	mapBounds: null,
	wgs84Projection: null,
	fileAPISupported: null,
	fileReader: null,
	drawControl: null,
	layer: null,
	imgUrl: null,
	profileLB: null,
	profileLBWidget: null,
	profileLBImageCnt: null,
	profileLBCloseBtn: null,
	svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="382.129px" height="227.463px" viewBox="0 0 382.129 227.463" preserveAspectRatio="xMidYMid meet" class="icon graph"><path d="M 44.803,203.847 24.659,181.616 119.387,95.782 246.782,130.166 335.958,25.029 358.837,44.434 257.347,164.09 127.389,129.014 z M 382.128,34.731 c 0,19.182 -15.549,34.73 -34.73,34.73 -19.181,0 -34.731,-15.548 -34.731,-34.73 0,-19.182 15.55,-34.731 34.73,-34.731 19.182,0 34.731,15.549 34.731,34.731 m -95.333,103.834 c 0,19.182 -15.549,34.729 -34.73,34.729 -19.181,0 -34.73,-15.548 -34.73,-34.729 0,-19.181 15.549,-34.731 34.73,-34.731 19.181,0 34.73,15.55 34.73,34.731 M 69.462,192.732 c 0,19.182 -15.55,34.729 -34.731,34.729 C 15.55,227.461 0,211.914 0,192.732 0,173.55 15.55,158.001 34.731,158.001 c 19.181,0 34.731,15.55 34.731,34.731 m 88.657,-80.335 c 0,19.182 -15.55,34.73 -34.731,34.73 -19.181,0 -34.731,-15.549 -34.731,-34.73 0,-19.182 15.55,-34.731 34.731,-34.731 19.181,0 34.731,15.549 34.731,34.731" /></svg>',
	illustration: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="213" height="54" viewBox="0 0.119 213 54" preserveAspectRatio="xMidYMid meet"><path d="m 8.983,28.946 c 1.713,-0.1 2.522,-1.004 1.868,-2.619 -0.348,-0.861 -1.28,-1.657 -2.335,-1.407 -0.783,0.185 -1.365,0.823 -1.495,1.86 -0.18,1.445 0.623,1.865 1.723,2.166 m 0.2,-6.943 c -2.392,-0.382 -4.725,1.984 -4.623,4.803 0.126,3.462 2.567,5.157 4.623,5.044 2.773,-0.15 5.301,-2.77 5.28,-5.527 -0.016,-1.988 -2.851,-4.418 -5.04,-4.32 m 46.56,-9.839 c -13.175,3.006 -25.379,9 -38.4,12.48 m -4.801,-5.04 C 8.798,18.225 5.374,18.605 2.47,21.531 c -1.998,2.011 -2.63,6.483 -1.179,9.339 1.463,2.881 3.51,4.588 7.159,4.949 6.173,0.613 11.26,-5.934 8.216,-12.396 -0.856,-1.816 -2.704,-2.271 -3.883,-3.58 m 177.84,4.08 c -0.659,-1.268 -1.161,-2.941 -3.098,-2.107 -0.812,0.349 -1.521,1.181 -1.228,2.349 0.213,0.858 0.573,1.661 1.453,1.889 0.937,0.241 1.84,-0.008 2.391,-0.933 0.181,-0.306 0.322,-0.637 0.481,-0.958 m -46.799,19.68 c -0.787,-2.496 -2.523,-4.113 -4.794,-5.293 -1.702,-0.885 -3.188,-0.525 -5.284,1.453 -2.164,2.043 -2.978,5.09 -1.922,7.201 1.024,2.049 3.784,3.709 5.995,3.328 3.033,-0.521 5.896,-2.391 6.005,-6.449 M 66.305,9.524 C 65.892,8.601 65.3,7.839 64.302,7.242 c -0.984,0.837 -1.355,1.683 -0.396,2.761 0.903,1.014 1.691,0.756 2.399,-0.24 m 71.518,36.24 c 1.713,-0.1 2.522,-1.002 1.868,-2.619 -0.349,-0.859 -1.28,-1.656 -2.336,-1.406 -0.782,0.186 -1.364,0.822 -1.494,1.861 -0.18,1.445 0.623,1.863 1.724,2.164 m 50.397,-31.92 c 7.656,-0.607 9.531,3.85 10.029,9.389 1.89,2.895 0.121,4.716 -1.638,6.681 -3.245,3.623 -10.082,4.496 -14.146,1.205 -3.549,-2.875 -2.282,-6.796 -1.836,-10.303 0.002,0.001 0.481,-6.114 7.591,-6.972 z m -51.359,39.84 c -2.377,-0.346 -4.633,-0.795 -6.514,-2.604 -2.642,-2.545 -2.621,-5.648 -1.813,-8.656 1.392,-5.197 5.049,-7.939 10.252,-7.496 0.901,0.078 1.758,0.256 2.373,0.783 2.223,1.902 4.18,4.127 5.017,6.947 1.584,5.334 -3.152,10.965 -9.074,11.025 M 59.605,8.716 c 0.678,4.447 2.913,4.734 3.593,5.056 1.887,0.893 3.557,0.506 5.032,-0.753 1.521,-1.302 2.147,-3.043 1.68,-5.02 -0.754,-3.187 -2.558,-4.16 -4.787,-4.292 0,0.001 -5.863,-1.091 -5.518,5.009 z m 9.339,-6.873 c -4.63,-3.146 -11.286,-0.805 -12.701,7.443 -0.119,5.877 3.885,8.996 8.876,8.265 3.239,-0.475 5.601,-1.624 7.185,-4.427 2.278,-4.032 0.948,-8.843 -3.12,-11.281 m 125.28,21.84 c -0.46,0.998 -0.306,2.188 -0.962,3.119 -2.102,2.978 -4.726,3.177 -7.438,2.164 -2.721,-1.018 -3.348,-4.244 -2.579,-7.428 0.463,-1.923 1.952,-3.27 4.022,-3.598 2.5,-0.396 4.163,0.996 5.508,2.87 0.584,0.814 1.233,1.609 1.449,2.634 m -14.401,5.52 c -6.974,2.193 -13.595,5.297 -20.392,7.941 -4.621,1.797 -9.291,3.371 -14.168,4.299 m -16.079,-2.4 C 123.545,36.335 117.877,33.415 112.148,30.636 101.815,25.622 91.52,20.532 81.173,15.547 78.528,14.274 75.744,13.284 73.024,12.164" style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10" /><rect width="10.058109" height="10" x="193.94098" y="25.373072" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" /><path d="m 197.652,26.552 c -1.92,-3.619 -4.329,-1.619 -4.028,0.181 m 7.81,7.359 c -0.671,-1.72 -1.41,-3.06 -2.091,-4.229 -0.68,-1.19 -1.29,-2.21 -1.689,-3.311 -1.47,-3.05 1.149,-3.739 2.47,-2.13 0.311,0.49 0.61,0.99 0.9,1.5 1.63,2.83 2.89,5.73 3.35,6.601 m -6.001,3.719 c -0.25,-0.72 -0.551,-1.39 -0.869,-2.04 -1,-2.06 -2.261,-3.87 -3.32,-6.02 -0.331,-0.48 -0.63,-0.96 -0.911,-1.431 -1.21,-2.02 -2.019,-3.79 -2.839,-4.32 -1.811,-1.16 -3.19,0.73 -2.01,2.94 1.22,2.76 6.779,11.34 7.309,12.97 m -0.001,10e-4 c -5.568,-5.659 -8.8,-3.5 -3.738,2.591 2.699,4.04 9.938,8.649 12.059,10.88 1.3,-0.601 2.941,-1.17 4.88,-2.16 1.53,-0.78 1.941,-1.22 3.391,-2.51 -2.75,-12.12 -6.75,-20.53 -9.67,-23.441 -1.75,-0.769 -2.119,0.861 -1.631,2.22" style="fill:#ffffff;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10" /></svg>',

	gpxTracks: null,

	initialize: function (options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);

		this.gpxFormat = new OpenLayers.Format.GPX();
		this.wktFormat = new OpenLayers.Format.WKT();
		this.wgs84Projection = new OpenLayers.Projection("EPSG:4326");
		this.fileAPISupported = (window.File && window.FileReader && window.FileList && window.Blob);
		this.title = OpenLayers.Lang.translate('Height profile');
	},

	clearFeature: function () {
		this.removeFeature();
		this.resetFileInput();
		this.submitButton.disabled = true;
	},

	featureAdded: function (feature) {
		this.feature = feature;
		if (this.fileInput) {
			this.fileInput.value = null;
		}
		this.submitButton.disabled = false;
	},

	removeFeature: function () {
		if (this.feature) {
			this.feature.destroy();
		}
		this.feature = null;

		if (this.heightProfileWrapperElement) {
			this.heightProfileWrapperElement.innerHTML = null;
		}
	},

	featureAddedHandler: function (evt) {
		this.feature = evt.feature;
		this.submitButton.disabled = false;
	},

	getFeatureAsWGS84: function () {
		var featureClone;

		featureClone = this.feature.clone();
		featureClone.geometry.transform(this.map.projection, this.wgs84Projection);

		return featureClone;
	},

	convertFeaturesToServiceCompliantGPX: function (features) {
		var gpx;

		gpx = this.gpxFormat.write(features);
		gpx = gpx.replace(/<gpx:/g, '<').replace(/<\/gpx:/g, '</');

		return gpx;
	},

	uploadGPX: function (gpx) {

		var self,
			request;

		$.support.cors = true;
        request = $.ajax({
            url: this.gpxStorageUrl,
            type: 'POST',
            data: gpx,
            crossDomain: true,
   			context: this,
   			success: function (response, statusText) {
   				// TODO: implement parsing gpxDataUrl from response
   				var gpxDataUrl;

   				console.log('gpx lagret som ' + response);
   				gpxDataUrl = response;

   				if (gpxDataUrl.indexOf('http') === 0) {
	   				this.getHeightProfileImageUrl(gpxDataUrl.replace(/ /g, ''));
	   			} else {
	   				this.showGPXUploadError();
	   				console.log('error: ' + response);
	   				gpxDataUrl =  prompt('');

	   				if (gpxDataUrl) {
	   					this.getHeightProfileImageUrl(gpxDataUrl);
		   			}
	   			}
   			},
   			error: function () {
   				this.showGPXUploadError();

   				var gpxDataUrl =  prompt('GPX-filserveren er ikke i drift\nScriptet fortsetter med dummy-data\nHvis du vil, kan du skrive inn en url til en GPX-fil her:') || 'http://seierstad.dyndns.org/test/track-2013-05-11-cycling.gpx';
				this.getHeightProfileImageUrl(gpxDataUrl);
   			}
        }); // request
	},

	showGPXUploadError: function () {
		this.showError();
	},

	getHeightProfileImageUrl: function (gpxDataUrl) {
		var request,
			requestParams;

		requestParams = {
			request: 'Execute',
			service: 'WPS',
			version: '1.0.0',
			identifier: 'elevationChart',
			dataInputs: '[gpx=' + gpxDataUrl + ']'
		};

		this.showProfileLightbox();
		$.support.cors = true;

        request = $.ajax({
            url: this.heightProfileServiceUrl,
            data: requestParams,
            dataType: 'xml',
            crossDomain: true,
            context: this,
            error: this.showError,
			success: function (xml, status, jqXHR) {
				var xlinkNS,
					mpsNS,
					referenceNode,
					successNodes,
					imgUrl;

				xlinkNS  = 'http://www.w3.org/1999/xlink';
				mpsNS = 'http://www.opengis.net/wps/1.0.0';

				successNodes = xml.getElementsByTagNameNS(mpsNS, 'ProcessSucceeded');

				if (successNodes.length > 0) {
					// the request was successful
					referenceNode = xml.getElementsByTagNameNS(mpsNS, 'Reference')[0];
					self.imgUrl = referenceNode.getAttributeNS(xlinkNS, 'href');
					
					this.showProfileImage(self.imgUrl);

				} else {

					this.removeProfileLightbox();
					this.showError();

				}
			}
			
        }); // request
	},

	showError: function (message) {

		if (this.profileLB) {
			this.removeProfileLightbox();
		}

		if (!this.errorMessageElement) {
			this.errorMessageElement = document.createElement('div');
			OpenLayers.Element.addClass(this.errorMessageElement, 'error-message');
			this.cnt.appendChild(this.errorMessageElement);
		}

		this.errorMessageElement.innerHTML = message || OpenLayers.Lang.translate('An error occured.');

	},

	removeError: function () {
		if (this.errorMessageElement) {
			this.errorMessageElement.parentNode.removeChild(this.errorMessageElement);
			this.errorMessageElement = null;
		}
	},

	profileLBCloseBtnObserver: function(evt){
		this.removeProfileLightbox();
	},

	profileLBOverlayObserver: function(evt){
		this.removeProfileLightbox();
	},

	profileLBSaveBtnObserver: function(evt){
		window.open(self.imgUrl, '_blank');
	},

	showProfileLightbox: function(){

		var self = this;/*, main = container || self.main;*/
            self.profileLB = document.createElement('div');
            self.profileLBOverlay = document.createElement('div');
            self.profileLBWidget   = document.createElement('div');
            self.profileLBCloseBtn = document.createElement('a');
            self.profileLBCloseBtn.setAttribute('id', 'heightProfileLightboxCloseBtn');
            self.profileLBCloseBtn.setAttribute('href', '#');
            self.profileLBCloseBtn.innerHTML = OpenLayers.Lang.translate('Close');
            self.profileLBImageCnt = document.createElement('div');

        OpenLayers.Element.addClass(self.profileLB, 'height-profile-lightbox splashscreen show');
        OpenLayers.Element.addClass(self.profileLBOverlay, 'overlay');
        OpenLayers.Element.addClass(self.profileLBWidget, 'widget loading');
        OpenLayers.Element.addClass(self.profileLBCloseBtn, 'close');
        OpenLayers.Element.addClass(self.profileLBImageCnt, 'image-wrapper');

        self.profileLBWidget.innerHTML = 
        	'<div class="loadingNotice">'+OpenLayers.Lang.translate('Generating height profile visualization')+'...</div>'+
    		'<div class="header">'+
				'<h1 class="h">'+OpenLayers.Lang.translate('Your height profile')+'</h1>'+
				self.profileLBCloseBtn.outerHTML+
			'</div>';

		self.profileLBWidget.appendChild(self.profileLBImageCnt);

        self.profileLB.appendChild(self.profileLBOverlay);

        OpenLayers.Event.observe( self.profileLBOverlay, 'click',
            OpenLayers.Function.bind( self.profileLBOverlayObserver, self )
        );

        self.profileLBSaveBtn = document.createElement('button');
        OpenLayers.Element.addClass(self.profileLBSaveBtn, 'save');
        self.profileLBSaveBtn.innerHTML = OpenLayers.Lang.translate('Open print friendly');;

        OpenLayers.Event.observe( self.profileLBSaveBtn, 'click',
            OpenLayers.Function.bind( self.profileLBSaveBtnObserver, self )
        );

        var buttonPanel = document.createElement('div');
        OpenLayers.Element.addClass(buttonPanel, "button-panel");

        buttonPanel.appendChild(self.profileLBSaveBtn);

        self.profileLBWidget.appendChild(buttonPanel);

        self.profileLB.appendChild(self.profileLBWidget);

        document.body.appendChild(self.profileLB);

        OpenLayers.Event.observe(document.getElementById('heightProfileLightboxCloseBtn'), 'click',
            OpenLayers.Function.bind( self.profileLBCloseBtnObserver, self )
        );

	},

	removeProfileLightbox: function(){
		var self = this;
		self.profileLB.parentNode.removeChild(self.profileLB);
		self.profileLB = null;
		self.profileLBWidget = null;
		self.profileLBOverlay = null;
		self.profileLBImageCnt = null;
		self.profileLBCloseBtn = null;
	},

	showProfileImage: function (imageUrl) {

		var self = this;

		if (self.profileLBWidget && self.profileLBImageCnt) {
			OpenLayers.Element.removeClass(self.profileLBWidget, 'loading');
			self.profileLBImageCnt.innerHTML = '<img src="'+imageUrl+'" />';
		}

	},

	setMap: function (map) {
		var self = this,
			drawControlOptions,
			layerOptions = {'visibility': false};

		OpenLayers.Control.prototype.setMap.apply(this, [map]);

		if (this.trackStyleMap) {
			layerOptions.styleMap = this.trackStyleMap;
		}

		this.layer = new OpenLayers.Layer.Vector(OpenLayers.Lang.translate('HeightProfileDrawing'), layerOptions);
		this.map.addLayer(this.layer);

		drawControlOptions = {
			featureAdded: OpenLayers.Function.bind(self.featureAdded, self),
			layerOptions: layerOptions
		};

        this.drawControl = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Path, drawControlOptions);
       	this.map.addControl(this.drawControl);
       	this.mapBounds = this.map.getMaxExtent();
	},

	newSketchHandler: function (evt) {
		this.clearFeature();
		this.removeError();
		this.wktInput.value = null;
	},

	resetFileInput: function () {
		if (this.fileInput) {
			this.fileInput.value = null;
		}
	},

	activate: function () {
		OpenLayers.Control.prototype.activate.apply(this);

		OpenLayers.Util.renderToggleToolClick({'self': this});
    	OpenLayers.Element.addClass(this.div, 'active');
    	this.layer.setVisibility(true);
    	this.drawControl.activate();
		this.drawControl.handler.layer.events.register("beforefeatureadded", this, this.newSketchHandler);
		this.layer.events.register("featureadded", this, this.featureAddedHandler);
	},

	deactivate: function () {
		if (this.layer) {
			this.layer.setVisibility(false);
			this.layer.events.unregister("featureadded", this, this.featureAddedHandler);
		}
		if (this.drawControl && this.drawControl.handler && this.drawControl.handler.layer && this.drawControl.handler.layer.events) {
			this.drawControl.handler.layer.events.unregister("beforefeatureadded", this, this.newSketchHandler);
		}
		this.drawControl.deactivate();
		OpenLayers.Element.removeClass(this.div, 'active');
		this.removeError();
		OpenLayers.Control.prototype.deactivate.apply(this);
	},

	destroy: function () {
    	this.map.removeControl(this.drawControl);
    	this.drawControl.deactivate();
    	this.drawControl.destroy();
    	this.drawControl = null;
        if (this.layer) {
        	this.map.removeLayer(this.layer);
        	this.layer.destroy();
        	this.layer = null;
        }
		OpenLayers.Control.prototype.deactivate.apply(this);
	},
    draw: function () {
        var self = this, 
            cName = 'height-profile-button nkButton',
            mapped, 
            btn, 
            toolElement, 
            panel,
            element,
            i,
            j,
            wktLabel;

	    mapped = 'OpenLayers_Control_HeightProfile' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind(self.toggleWidget, self)
        );
        
		OpenLayers.Util.appendToggleToolClick({'self':self});

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE(this.svgIcon);

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'height-profile');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                self.div = toolElement;
            } else {
                self.div.appendChild(btn);
            }
        }

    	self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        self.div.appendChild(self.widget);

        this.cnt.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Make a height profile') + '</h1>';
        this.usageInstructions = document.createElement('div');
        this.usageInstructions.innerHTML = '<p>' + OpenLayers.Lang.translate('Click in the map to draw a line.') + '</p><div class="illustration-wrapper">' + OpenLayers.Util.hideFromOldIE(this.illustration) + '</div><p>' + OpenLayers.Lang.translate('Double click to finish') + '</p>';
        this.cnt.appendChild(this.usageInstructions);

        this.viewProfileForm = document.createElement('form');
        this.viewProfileForm.setAttribute('action', this.gpxStorageUrl);
        this.viewProfileForm.setAttribute('method', 'POST');

        if (this.fileAPISupported) {
			// show track from GPX file in the map if FileAPI is supported

	        this.viewProfileForm.innerHTML = '<label for="gpx-file-upload">' + OpenLayers.Lang.translate('Upload GPX file') + '</label>';
 
	        this.fileInput = document.createElement('input');
	        this.fileInput.setAttribute('type', 'file');
	        this.fileInput.setAttribute('name', 'gpx-file');
	        this.fileInput.setAttribute('id', 'gpx-file-upload');
			this.viewProfileForm.appendChild(this.fileInput);

			this.fileReader = new FileReader();
			OpenLayers.Event.observe(this.fileReader, 'load', OpenLayers.Function.bind(this.drawTrackFromFile, this));
			OpenLayers.Event.observe(this.fileInput, 'change', OpenLayers.Function.bind(this.fileInputChangeHandler, this));			
		}

		wktLabel =  document.createElement('label');
        wktLabel.setAttribute('for', 'wkt-linestring-input');
        wktLabel.innerHTML = OpenLayers.Lang.translate('Enter WKT geometry data');
        this.viewProfileForm.appendChild(wktLabel);

        this.wktInput = document.createElement('input');
        this.wktInput.setAttribute('type', 'text');
        this.wktInput.setAttribute('name', 'wkt-linestring');
        this.wktInput.setAttribute('id', 'wkt-linestring-input');
        this.wktInput.setAttribute('placeholder', 'LINESTRING(...)');
        this.wktInput.setAttribute('pattern', '\\s*[Ll][Ii][Nn][Ee][Ss][Tt][Rr][Ii][Nn][Gg]\\s*\\(\\s*(.*)\\s*\\)\\s*');
		this.viewProfileForm.appendChild(this.wktInput);
		OpenLayers.Event.observe(this.wktInput, 'keyup', OpenLayers.Function.bind(this.wktInputChangeHandler, this));

		if (this.gpxTracks && this.gpxTracks.length > 0) {
	        this.gpxTracksElement = document.createElement('fieldset');
	        this.gpxTracksElement.innerHTML = '<legend>' + OpenLayers.Lang.translate('Popular routes') + '</legend>';

	        for (i = 0, j = this.gpxTracks.length; i < j; i += 1) {
	        	element = this.gpxTracks[i].link = document.createElement('button');
	        	OpenLayers.Element.addClass(element, 'popular-route');
	        	element.innerHTML = OpenLayers.Lang.translate(this.gpxTracks[i].name);
	        	element.setAttribute('value', this.gpxTracks[i].url);
	        	this.gpxTracksElement.appendChild(element);

	        	OpenLayers.Event.observe(element, 'click', OpenLayers.Function.bind(function (evt) {
					evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
					evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
					var url = evt && evt.target && evt.target.value;
	        		this.drawTrackFromUrl(url);
					/* the links will only show the tracks in the map, the user has to press "create height profile" 
					this.getHeightProfileImageUrl(url);
					*/
	        		return false;
	        	}, self));
	        }

	        this.cnt.appendChild(this.gpxTracksElement);
	        // TODO: add click handlers
	    }

        this.submitButton = document.createElement('button');
        this.submitButton.setAttribute('type', 'submit');
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = OpenLayers.Lang.translate('Show height profile');
		this.viewProfileForm.appendChild(this.submitButton);
        this.cnt.appendChild(this.viewProfileForm);

		OpenLayers.Event.observe(this.viewProfileForm, 'submit', OpenLayers.Function.bind(this.viewProfileSubmitHandler, this));

        return self.div; 
    }, // draw	

    viewProfileSubmitHandler: function (evt) {

        evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
		this.uploadGPX(this.convertFeaturesToServiceCompliantGPX(this.getFeatureAsWGS84()));

		return false;
    },

    fileInputChangeHandler: function (evt) {
		var files,
			i,
			f;

        evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
		evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;

		this.removeError();
		files = evt.target.files;
	    // files is a FileList of File objects.
	    for (i = 0; f = files[i]; i += 1) {
            this.fileReader.readAsText(f);
	    }
	},

    drawTrackFromFile: function (evt) {
		var features, 
			feature,
			i,
			j;

		features = this.gpxFormat.read(evt.target.result);
		if (features.length > 0) {
			this.drawTrack(features);
		} else {
			this.showError(OpenLayers.Lang.translate('Unable to read track from file.'));
			this.clearFeature();
		}
	},
	drawTrack: function (features) {
		this.layer.removeAllFeatures();
		for (i = 0, j = features.length; i < j; i += 1) {
			feature = features[i];
			feature.geometry.transform(this.wgs84Projection, this.map.getProjection());
		}
		this.layer.addFeatures([features[0]], {silent: true}); // silent: true to avoid submitting the track automatically
		this.feature = features[0];
		this.zoomToBoundsOffset(this.mapContainsTrack(feature), -1);
		this.submitButton.disabled = false;
		this.wktInput.value = null;
	},
	drawTrackFromUrl: function (url) {
		var self,
			request;

		$.support.cors = true;

        request = $.ajax({
            url: url,
            crossDomain: true,
   			context: this,
   			success: function (response, statusText) {
	   			var features = this.gpxFormat.read(response);
	   			this.resetFileInput();
	   			this.drawTrack(features);
   			}
        }); // request
	},

	mapContainsTrack: function (feature) {
		var c,
			i,
			j,
			bounds;

		if (feature.geometry && feature.geometry.bounds) {
			return this.mapBounds.containsBounds(feature.geometry.bounds) ? feature.geometry.bounds : false;
		}

		if (feature.geometry && feature.geometry.components) {
			bounds = new OpenLayers.Bounds();

			for (i = 0, j = feature.geometry.components.length; i < j; i += 1) {
				c = feature.geometry.components[i];
				bounds.extend(c);
			}
			return this.mapBounds.containsBounds(bounds) ? bounds : false;
		}

		return false;
	},

	wktInputChangeHandler: function (evt) {
		var feature = null,
			i,
			j,
			inputValue;

		inputValue = evt.target.value;

		if (!this.wktLastInputValue) {
			this.wktLastInputValue = '';
		}
		if (inputValue !== this.wktLastInputValue) {
			feature = this.wktFormat.read(inputValue);
			this.submitButton.disabled = true;
			this.wktLastInputValue = inputValue;

			if (feature) {
				if (this.mapContainsTrack(feature) || (feature.geometry.transform(this.wgs84Projection, this.map.projection) && this.mapContainsTrack(feature))) { // geometry.transform() transforms in place. 
					this.clearFeature();
					this.layer.addFeatures([feature], {silent: true}); // silent: true to avoid submitting the track automatically
					this.feature = feature;
					this.submitButton.disabled = false;
					this.zoomToBoundsOffset(this.mapContainsTrack(feature), -1);
				}
			}
		}
	},

	zoomToBoundsOffset: function (bounds, offset) {
        var center = bounds.getCenterLonLat();
        this.map.setCenter(center, this.map.getZoomForExtent(bounds, true) + offset);
    },

    toggleWidget: function () {
    	OpenLayers.Element.hasClass(this.div, 'active') ? this.deactivate() : this.activate();
    },

    showControls: function () {
    	this.activate();
    }, // showControls

    hideControls: function () {
    	this.deactivate();
    }, //hideControls needed for OpenLayers.Utils.toggleToolClick compatibility

	CLASS_NAME: "OpenLayers.Control.HeightProfile"
});