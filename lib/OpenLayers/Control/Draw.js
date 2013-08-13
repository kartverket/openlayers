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
    wgs84: null,
    measuresPrecisionDegrees: 5, 
    measures: {
        wrapper: null,
        lon: {
            label: null,
            data: null
        },
        lat: {
            label: null,
            data: null
        },
        length: {
            label: null,
            data: null
        },
        area: {
            label: null,
            data: null
        }
    },
    measuresUpdatingAllowed: true,
    allowMeasuresUpdating: function () {
        this.measuresUpdatingAllowed = true;
    },
    denyMeasuresUpdating: function () {
        this.measuresUpdatingAllowed = false;
    },
    tools: {
        icons: {
            point: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon point"><circle cx="32" cy="32" r="16" /></svg>',
            line: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon line"><path class="stroked" fill="none" d="M 45.454545,9.8181818 17.272727,23.090909 53.090909,42.727273 5.2727273,58" /></svg>',
            polygon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon area"><path class="stroked semitransparent" d="M 27.090909,6.9090906 49.818186,5.9999997 31.000004,31.636365 56.545458,57.636366 7.454545,58.909093 l 0,-26.363637 z"/></svg>'
        },
        handlers: {
            point: function (evt) {
                this.deactivateDrawControls();
                this.drawControls.point.activate();
                OpenLayers.Element.addClass(this.tools.buttons.point, 'active');
                this.activeDrawControl = 'point';
                this.resetMeasures();
                this.showPointMeasures();
            },
            line: function (evt) {
                this.deactivateDrawControls();
                this.drawControls.line.activate();

                this.drawControls.line.handler.layer.events.register('featureadded', this, this.allowMeasuresUpdating);
                OpenLayers.Element.addClass(this.tools.buttons.line, 'active');
                this.activeDrawControl = 'line';
                this.resetMeasures();
                this.showLineMeasures();
            },
            polygon: function (evt) {
                this.deactivateDrawControls();
                this.drawControls.polygon.activate();
                this.drawControls.polygon.handler.layer.events.register('featureadded', this, this.allowMeasuresUpdating);
                OpenLayers.Element.addClass(this.tools.buttons.polygon, 'active');
                this.activeDrawControl = 'polygon';
                this.resetMeasures();
                this.showAreaMeasures();
            },
            undo: function (evt) {
                var feature,
                    control = this.drawControls[this.activeDrawControl],
                    sketch,
                    pointIndex;

                this.resetMeasures();

                // is there an unfinished sketch present?
                if (control.handler.getSketch) {
                    sketch = control.handler.getSketch();
                    if (sketch && !!sketch.geometry) {
                        // sketch exists
                        if (control.handler.getCurrentPointIndex) {
                            pointIndex = control.handler.getCurrentPointIndex();
                            if (pointIndex > 1) {
                                // sketch contains undoable points: undo last point
                                control.undo();
                                return true;
                            } else {
                                // sketch contains only one point: cancel sketch
                                control.cancel();
                            }
                        }
                    }
                }
                feature = this.features.pop();
                if (feature) {
                    feature.destroy();
                    feature = null;
                }

            },
            save: function (evt) {
                var result = (new OpenLayers.Format.GeoJSON()).write(this.features);
                console.log('result : ' + result);
            }
        }     
    },
    resetMeasures: function () {
        this.measures.lon.data.innerHTML = '-';
        this.measures.lat.data.innerHTML = '-';
        this.measures['length'].data.innerHTML = '-';
        this.measures.area.data.innerHTML = '-';
    },
    showPointMeasures: function () {
        OpenLayers.Element.addClass(this.measures.wrapper, 'point');
        OpenLayers.Element.removeClass(this.measures.wrapper, 'line');
        OpenLayers.Element.removeClass(this.measures.wrapper, 'area');
    },
    showLineMeasures: function () {
        OpenLayers.Element.removeClass(this.measures.wrapper, 'point');
        OpenLayers.Element.addClass(this.measures.wrapper, 'line');
        OpenLayers.Element.removeClass(this.measures.wrapper, 'area');
        this.measures.length.label.innerHTML = OpenLayers.Lang.translate('Length');
    },
    showAreaMeasures: function () {
        OpenLayers.Element.removeClass(this.measures.wrapper, 'point');
        OpenLayers.Element.removeClass(this.measures.wrapper, 'line');
        OpenLayers.Element.addClass(this.measures.wrapper, 'area');
        this.measures.length.label.innerHTML = OpenLayers.Lang.translate('Circumference');
    },
	initialize: function (options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.wgs84 = new OpenLayers.Projection("EPSG:4326");
	},

	addFeature: function (feature) {
		this.features.push(feature);
        this.measuresUpdatingAllowed = false;
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

        this.layer.events.register('sketchmodified', this, this.updateMeasures);


        for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
            	this.map.addControl(this.drawControls[key]);
        	}
        }
	},
    updateMeasures: function (evt) {
        var lonLat,
            length,
            area,
            preciseRound,
            east,
            west,
            north,
            south;

        preciseRound = function (num, decimals) {
            var sign = num >= 0 ? 1 : -1;
            return (Math.round((num * Math.pow(10,decimals)) + (sign * 0.001)) / Math.pow(10, decimals)).toFixed(decimals);
        };

        lonLat = new OpenLayers.LonLat([evt.vertex.x, evt.vertex.y]);
        lonLat.transform(this.map.getProjection(), this.wgs84);
        north = OpenLayers.Lang.translate('N');
        south = OpenLayers.Lang.translate('S');
        east = OpenLayers.Lang.translate('E');
        west = OpenLayers.Lang.translate('V');
        this.measures.lon.data.innerHTML = Math.abs(preciseRound(lonLat.lon, this.measuresPrecisionDegrees)) + '° ' + ((lonLat.lon > 0) ? east : west);
        this.measures.lon.data.setAttribute('title', lonLat.lon + '° ' + ((lonLat.lon > 0) ? east : west));
        this.measures.lat.data.innerHTML = Math.abs(preciseRound(lonLat.lat, this.measuresPrecisionDegrees)) + '° ' + ((lonLat.lat > 0) ? north : south);
        this.measures.lat.data.setAttribute('title', lonLat.lat + '° ' + ((lonLat.lat > 0) ? north : south));

        if (this.measuresUpdatingAllowed) {
            length = evt.feature.geometry.getLength();
            this.measures['length'].data.innerHTML = (length > 1000) ? preciseRound(length / 1000, 2) + ' km' : preciseRound(length, 2) + ' m';
            this.measures['length'].data.setAttribute('title', length + ' m');

            area = evt.feature.geometry.getArea();
            this.measures.area.data.innerHTML = (area > 1000000) ? preciseRound(area / 1000000, 2) + ' km²' : preciseRound(area, 2) + ' m²';
            this.measures.area.data.setAttribute('title', area + ' m²');
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

                // unregister event listener added to the control's handler's layer:
                this.drawControls[key].handler && 
                this.drawControls[key].handler.layer &&
                this.drawControls[key].handler.layer.events &&
                this.drawControls[key].handler.layer.events.unregister('featureadded', this, this.allowMeasuresUpdating);

            	this.drawControls[key].deactivate();
                OpenLayers.Element.removeClass(this.tools.buttons[key], 'active');
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
            toolItem,
            button,
            buttonText,
            buttonContent;

	    mapped = 'OpenLayers_Control_Draw' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind(self.toggleWidget, self)
        );
        
		OpenLayers.Util.appendToggleToolClick({'self':self});

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 25 25" class="icon draw" preserveAspectRatio="xMidYMid meet"><path d="M10.487,14.811l2.376,2.375l7.352-7.353L17.84,7.458L10.487,14.811z M7.945,17.352L7.12,16.526l2.651-2.651l-1.781-1.75L2.043,18.01l-1.349,6.324l6.543-1.523l5.735-5.734l-2.375-2.375L7.945,17.352z M5.911,20.412l-2.402,1.094l1.083-2.414l1.212-1.212l0.175,1.156L7.123,19.2L5.911,20.412z M19.136,0.823l-2.59,2.589l5.046,5.045l2.589-2.59L19.136,0.823z M15.295,5.007l-7.704,7.488L9.56,14.09l7.454-7.458L15.295,5.007z"/></svg>');

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
        this.tools.list = document.createElement('ul');
        this.tools.buttons = {};

        // add draw control selector buttons
        for (key in this.drawControls) {
        	if (this.drawControls.hasOwnProperty(key)) {
                buttonText = OpenLayers.Lang.translate('Draw ' + key);

        		toolItem = document.createElement('li');
        		button = this.tools.buttons[key] = document.createElement('button');
                button.setAttribute('title', buttonText);

                if (this.tools.icons[key]) {
                    buttonContent = OpenLayers.Util.hideFromOldIE(this.tools.icons[key]);
                } else {
                    buttonContent = '';
                    OpenLayers.Element.addClass(toolItem, 'text-only');

                }
                buttonContent += '<span>' + buttonText + '</span>';

                button.innerHTML = buttonContent;
        		toolItem.appendChild(this.tools.buttons[key]);
        		this.tools.list.appendChild(toolItem);
				OpenLayers.Event.observe(button, 'click', OpenLayers.Function.bind(this.tools.handlers[key], self));

        	}
        }

        // add undo button
		toolItem = document.createElement('li');
        buttonText = OpenLayers.Lang.translate('Undo');
		this.tools.buttons['undo'] = document.createElement('button');
        this.tools.buttons['undo'].setAttribute('title', buttonText);        
        if (this.tools.icons['undo']) {
            buttonContent = OpenLayers.Util.hideFromOldIE(this.tools.icons['undo']);
        } else {
            buttonContent = '';
            OpenLayers.Element.addClass(toolItem, 'text-only');
        }
        buttonContent += '<span>' + buttonText + '</span>';
		this.tools.buttons['undo'].innerHTML = buttonContent;
		toolItem.appendChild(this.tools.buttons['undo']);
		this.tools.list.appendChild(toolItem);
		OpenLayers.Event.observe(this.tools.buttons['undo'], 'click', OpenLayers.Function.bind(this.tools.handlers['undo'], self));

        // add save button
		toolItem = document.createElement('li');
        buttonText = OpenLayers.Lang.translate('Save');
		this.tools.buttons['save'] = document.createElement('button');
        this.tools.buttons['save'].setAttribute('title', buttonText);
        if (this.tools.icons['save']) {
            buttonContent = OpenLayers.Util.hideFromOldIE(this.tools.icons['save']);
        } else {
            buttonContent = '';
            OpenLayers.Element.addClass(toolItem, 'text-only');
        }
        buttonContent += '<span>' + buttonText + '</span>';
		this.tools.buttons['save'].innerHTML = buttonContent;
		toolItem.appendChild(this.tools.buttons['save']);
		this.tools.list.appendChild(toolItem);
		OpenLayers.Event.observe(this.tools.buttons['save'], 'click', OpenLayers.Function.bind(this.tools.handlers['save'], self));

        this.cnt.appendChild(this.tools.list);

        this.drawMeasuresSection();

        return self.div;
    }, // draw

    drawMeasuresSection: function () {
        var dl,
            wrapper,
            addDtDd;

        wrapper = this.measures.wrapper = document.createElement('div');
        OpenLayers.Element.addClass(wrapper, 'measures');
        wrapper.innerHTML = '<h2 class="h">' + OpenLayers.Lang.translate('Measures') + '</h2>'
        dl = document.createElement('dl');

        addDtDd = function (key, labelText) {
            var label,
                data;

            label = this.measures[key].label = document.createElement('dt');
            data = this.measures[key].data = document.createElement('dd');
            OpenLayers.Element.addClass(label, key);
            OpenLayers.Element.addClass(data, key);
            label.innerHTML = labelText;
            data.innerHTML = '-';
            dl.appendChild(label);
            dl.appendChild(data);
        };

        addDtDd.apply(this, ['lat', OpenLayers.Lang.translate('Latitude')]);
        addDtDd.apply(this, ['lon', OpenLayers.Lang.translate('Longitude')]);
        addDtDd.apply(this, ['length', OpenLayers.Lang.translate('Length')]);
        addDtDd.apply(this, ['area', OpenLayers.Lang.translate('Area')]);
        
        wrapper.appendChild(dl);
        this.cnt.appendChild(wrapper);

        buttonText = OpenLayers.Lang.translate('Undo');
        this.tools.buttons['undo'] = document.createElement('button');
        this.tools.buttons['undo'].setAttribute('title', buttonText);

    },

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

        
        if (this.activeDrawControl) {
    	   this.tools.handlers[this.activeDrawControl].apply(this, []);
        }
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