/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/Point.js
 * @requires OpenLayers/Handler/Path.js
 * @requires OpenLayers/Handler/Polygon.js
 */

/**
 * Class: OpenLayers.Control.Draw
 * The Draw control contains controllers for drawing point, line or polygon features on a vector layer when active.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

OpenLayers.Control.Draw = OpenLayers.Class(OpenLayers.Control, {
	layer: null,
	widget: null,
	div: null,
	cnt: null,
	drawControls: {},
	features: [],

	initialize: function (options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		
	},

	addFeature: function (feature) {
		this.features.push(feature);
		console.log(this.features.length);
	},

	setMap: function (map) {
		var key,
			self = this,
			drawControlOptions;

		OpenLayers.Control.prototype.setMap.apply(this, [map]);

		this.layer = new OpenLayers.Layer.Vector(OpenLayers.Lang.translate('Drawing'));
		this.map.addLayer(this.layer);

		drawControlOptions = {featureAdded: OpenLayers.Function.bind(self.addFeature, self)};
        this.drawControls.point = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Point, drawControlOptions);
        this.drawControls.line = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Path, drawControlOptions);
        this.drawControls.polygon = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Polygon, drawControlOptions);

        for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
            	this.map.addControl(this.drawControls[key]);
        	}
        }
	},

	activate: function () {
		OpenLayers.Control.prototype.activate.apply(this);

	},

	deactivate: function () {
		var key;
		for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
            	this.map.removeControl(this.drawControls[key]);
            	this.drawControls[key].deactivate();
            	this.drawControls[key].destroy();
            	this.drawControls[key] = null;
        	}
        }
        if (this.layer) {
        	this.map.removeLayer(this.layer);
        	this.layer.destroy();
        	this.layer = null;
        }
		OpenLayers.Control.prototype.deactivate.apply(this);
	},
	deactivateDrawControls: function () {
		for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
            	this.drawControls[key].deactivate();
            }
        }
	},
    draw: function () {
        var self = this, 
            cName = 'Draw-button nkButton',
            mapped, 
            btn, 
            toolElement, 
            panel,
            toolItem;

	    mapped = 'OpenLayers_Control_Draw' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind(self.toggleWidget, self)
        );
        
		OpenLayers.Util.appendToggleToolClick({'self':self});

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 25 25" class="icon draw" preserveAspectRatio="xMidYMid meet"><path d="M-253.013,368.016c1.32-0.85,2.942-1.275,4.866-1.275c2.528,0,4.629,0.604,6.302,1.812c1.672,1.208,2.509,2.999,2.509,5.37c0,1.455-0.363,2.679-1.088,3.675c-0.424,0.604-1.239,1.376-2.444,2.315l-1.188,0.923c-0.647,0.503-1.077,1.091-1.289,1.762c-0.134,0.425-0.207,1.085-0.218,1.98h-4.548c0.067-1.891,0.245-3.197,0.535-3.918s1.037-1.552,2.242-2.492l1.222-0.957c0.401-0.302,0.725-0.632,0.97-0.99c0.446-0.615,0.669-1.292,0.669-2.03c0-0.85-0.248-1.625-0.745-2.324c-0.497-0.699-1.404-1.049-2.72-1.049c-1.295,0-2.213,0.431-2.754,1.292c-0.541,0.862-0.812,1.756-0.812,2.685h-4.85C-256.218,371.607-255.105,369.348-253.013,368.016z M-250.227,386.878h5.018v4.85h-5.018V386.878z"/><path d="M10.488,14.81l2.375,2.375l7.352-7.352L17.84,7.458L10.488,14.81z M7.946,17.352l-0.825-0.826l2.651-2.651l-1.781-1.75L2.043,18.01l-1.349,6.324l6.543-1.523l5.735-5.735l-2.375-2.375L7.946,17.352z M5.912,20.412l-2.403,1.093l1.083-2.413l1.212-1.212l0.174,1.156L7.124,19.2L5.912,20.412z M19.136,0.823l-2.589,2.589l5.045,5.045l2.59-2.59L19.136,0.823z M15.295,5.007l-7.704,7.488l1.969,1.594l7.454-7.457L15.295,5.007z"/></svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'draw');
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
  
        this.cnt.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Drawing') + '</h1>';
        this.tools = {};
        this.tools.list = document.createElement('ul');
        this.tools.buttons = {};
        this.tools.handlers = {};
        this.tools.handlers.point = function (evt) {
        	this.deactivateDrawControls();
        	this.drawControls.point.activate();
        	this.activeDrawControl = 'point';
        };
		this.tools.handlers.line = function (evt) {
			this.deactivateDrawControls();
			this.drawControls.line.activate();
			this.activeDrawControl = 'line';
		};
		this.tools.handlers.polygon = function (evt) {
			this.deactivateDrawControls();
			this.drawControls.polygon.activate();
			this.activeDrawControl = 'polygon';
		};
		this.tools.handlers.undo = function (evt) {
			var feature,
				control = this.drawControls[this.activeDrawControl];

			// is there an unfinished sketch present?
			if (control.handler.getSketch && control.handler.getSketch()) {
				// sketch exists
				if (control.handler.getCurrentPointIndex) {
					if (control.handler.getCurrentPointIndex() > 1) {
						// sketch contains undoable points: undo last point
						control.undo();
					} else {
						// sketch contains only one point: cancel sketch
						control.cancel();
					}
				}
				return true;
			}
			feature = this.features.pop();
			if (feature) {
				feature.destroy();
				feature = null;
			}

		};
		this.tools.handlers.save = function (evt) {
			var result = (new OpenLayers.Format.GeoJSON()).write(this.features);
			console.log('result : ' + result);
		};

        for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
        		toolItem = document.createElement('li');
        		this.tools.buttons[key] = document.createElement('button');
        		this.tools.buttons[key].innerHTML = OpenLayers.Lang.translate('Draw ' + key);
        		toolItem.appendChild(this.tools.buttons[key]);
        		this.tools.list.appendChild(toolItem);
				OpenLayers.Event.observe(this.tools.buttons[key], 'click', OpenLayers.Function.bind(this.tools.handlers[key], self));

        	}
        }

		toolItem = document.createElement('li');
		this.tools.buttons['undo'] = document.createElement('button');
		this.tools.buttons['undo'].innerHTML = OpenLayers.Lang.translate('Undo');
		toolItem.appendChild(this.tools.buttons['undo']);
		this.tools.list.appendChild(toolItem);
		OpenLayers.Event.observe(this.tools.buttons['undo'], 'click', OpenLayers.Function.bind(this.tools.handlers['undo'], self));

		toolItem = document.createElement('li');
		this.tools.buttons['save'] = document.createElement('button');
		this.tools.buttons['save'].innerHTML = OpenLayers.Lang.translate('Save');
		toolItem.appendChild(this.tools.buttons['save']);
		this.tools.list.appendChild(toolItem);
		OpenLayers.Event.observe(this.tools.buttons['save'], 'click', OpenLayers.Function.bind(this.tools.handlers['save'], self));

        
        this.cnt.appendChild(this.tools.list);

        return self.div;
    }, // draw

    toggleWidget: function () {
    	OpenLayers.Element.hasClass(this.div, 'active') ? this.hideControls() : this.showControls();
    },

    showControls: function () {
        var html = '',
            inputForm,
            selected,
            button,
            self = this,
            key;

		OpenLayers.Util.renderToggleToolClick({'self': self});


    	OpenLayers.Element.addClass(this.div, 'active');
    	this.drawControls.line.activate();
    }, // showControls

    hideControls: function () { 
    	var key;
		if (!OpenLayers.Element.hasClass(this.div, 'active')) {
			return;
		}
		for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
            	this.drawControls[key].deactivate();
        	}
        }
    	OpenLayers.Element.removeClass( this.div, 'active' );
    }, //hideControls


	CLASS_NAME: "OpenLayers.Control.Draw"
});