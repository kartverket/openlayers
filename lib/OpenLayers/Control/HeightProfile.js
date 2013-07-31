/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/Path.js
 * @requires OpenLayers/Format/GPX.js
 */

/**
 * Class: OpenLayers.Control.HeightProfile
 * The HeightProfile control.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

OpenLayers.Control.HeightProfile = OpenLayers.Class(OpenLayers.Control, {

	url: null,
	feature: null,
	gpxUrl: null,
	gpxFormat: null,
	drawControl: null,
	layer: null,
	svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="382.129px" height="227.463px" viewBox="0 0 382.129 227.463" preserveAspectRatio="xMidYMid meet" class="icon graph"><path d="M 44.803,203.847 24.659,181.616 119.387,95.782 246.782,130.166 335.958,25.029 358.837,44.434 257.347,164.09 127.389,129.014 z M 382.128,34.731 c 0,19.182 -15.549,34.73 -34.73,34.73 -19.181,0 -34.731,-15.548 -34.731,-34.73 0,-19.182 15.55,-34.731 34.73,-34.731 19.182,0 34.731,15.549 34.731,34.731 m -95.333,103.834 c 0,19.182 -15.549,34.729 -34.73,34.729 -19.181,0 -34.73,-15.548 -34.73,-34.729 0,-19.181 15.549,-34.731 34.73,-34.731 19.181,0 34.73,15.55 34.73,34.731 M 69.462,192.732 c 0,19.182 -15.55,34.729 -34.731,34.729 C 15.55,227.461 0,211.914 0,192.732 0,173.55 15.55,158.001 34.731,158.001 c 19.181,0 34.731,15.55 34.731,34.731 m 88.657,-80.335 c 0,19.182 -15.55,34.73 -34.731,34.73 -19.181,0 -34.731,-15.549 -34.731,-34.73 0,-19.182 15.55,-34.731 34.731,-34.731 19.181,0 34.731,15.549 34.731,34.731" /></svg>',

	initialize: function (options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		this.gpxFormat = new OpenLayers.Format.GPX();
	},

	featureAdded: function (feature) {
		this.feature = feature;
	},
	removeFeature: function () {
		if (this.feature) {
			this.feature.destroy();
		}
	},
	featureAddedHandler: function (evt) {
		this.feature = evt.feature;
		this.getHeightProfile([this.feature]);
	},
	getHeightProfile: function (featureArray) {
		var gpx = this.gpxFormat.write(featureArray);
		console.log(gpx);
	},
	setMap: function (map) {
		var self = this,
			drawControlOptions;

		OpenLayers.Control.prototype.setMap.apply(this, [map]);

		this.layer = new OpenLayers.Layer.Vector(OpenLayers.Lang.translate('HeightProfileDrawing'));
		this.map.addLayer(this.layer);

		drawControlOptions = {
			featureAdded: OpenLayers.Function.bind(self.featureAdded, self)
		};

        this.drawControl = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Path, drawControlOptions);
       	this.map.addControl(this.drawControl);
	},

	activate: function () {
		OpenLayers.Control.prototype.activate.apply(this);

		OpenLayers.Util.renderToggleToolClick({'self': this});
    	OpenLayers.Element.addClass(this.div, 'active');
    	this.drawControl.activate();
		this.drawControl.handler.layer.events.register("beforefeatureadded", this, this.removeFeature);
		this.layer.events.register("featureadded", this, this.featureAddedHandler);
	},
	deactivate: function () {
		this.drawControl.deactivate();
		OpenLayers.Element.removeClass(this.div, 'active');
		if (this.feature) {
			this.feature.destroy();
		}
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
            panel;

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
  
        this.cnt.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Height profile') + '</h1>';
        return self.div;
    }, // draw	


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