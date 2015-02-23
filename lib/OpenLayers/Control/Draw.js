/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/Point.js
 * @requires OpenLayers/Handler/Path.js
 * @requires OpenLayers/Handler/Polygon.js
 * @requires OpenLayers/Util/preciseRound.js
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
    styleMap: null,
	drawControls: {},
	features: [],
    wgs84: null,
    measuresPrecisionDegrees: 5,
    JSONDataStorageUrl: null,
    savedState: {
        url: null,
        features: []
    },
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
    showLabelEditorPopup: function (evt) {
        var popup;
        var feature = evt.feature;
        var that = this;
        if (!feature.popup) {
          popup = new OpenLayers.Popup.FramedSideAnchored(
            "nk-feature-label", 
            feature.geometry.getBounds().getCenterLonLat(),
            null,
            '<span class="label-text">' + feature.data.label + '</span>', //generatePopupMarkup(feature),
            null, 
            false, 
            null, //onPopupClose
            {x: 0, y: -25},
            'user-marker'
          );

          popup.autoSize = true;
          popup.panMapIfOutOfView = false;
          feature.popup = popup;
          popup.feature = feature;
          map.addPopup(popup);
          popup.show();

          popup.setContentHTML('');

          label = document.createElement('label'); 
          label.setAttribute('for', 'feature-label');
          label.innerHTML = OpenLayers.Lang.translate('Add text');
          popup.contentDiv.appendChild(label);

          popup.input = document.createElement('input');
          popup.input.setAttribute('type', 'text');
          popup.input.setAttribute('id', 'feature-label');
          if (feature.attributes && feature.attributes.label) {
            popup.input.setAttribute('value', feature.attributes.label);
          }
          popup.contentDiv.appendChild(popup.input);

          popup.okButton = document.createElement('button');
          popup.okButton.setAttribute('class', 'update-feature-label');
          popup.okButton.innerHTML = OpenLayers.Lang.translate('Update');

          popup.addLabel = function () {
            var undoBuffer;

            that.drawControls['label'].undoBuffer = that.drawControls['label'].undoBuffer || [];
            undoBuffer = that.drawControls['label'].undoBuffer;
            undoBuffer.push({'previousLabel': popup.feature.attributes.label || '', 'feature': popup.feature})

            popup.feature.attributes.label = this.input.value || '';
            popup.feature.layer.drawFeature(popup.feature);

            that.removeLabelEditorPopup(popup);
          };

          popup.removePopup = function () {
            that.removeLabelEditorPopup(popup);
          };

          OpenLayers.Event.observe(popup.okButton, 'click', function (evt) {
            popup.addLabel(); 
            return false;
          });
          popup.contentDiv.appendChild(popup.okButton);

          popup.cancelButton = document.createElement('button');
          popup.cancelButton.setAttribute('class', 'cancel-feature-label');
          popup.cancelButton.innerHTML = OpenLayers.Lang.translate('Cancel');
          OpenLayers.Event.observe(popup.cancelButton, 'click', popup.removePopup);
          popup.contentDiv.appendChild(popup.cancelButton);

          OpenLayers.Element.addClass(popup.contentDiv, 'edit-popup-content');
          popup.updateSize();

          popup.input.focus();
        }
    },
    removeLabelEditorPopup: function (evt) {
        var popup, 
            feature;

        feature = evt.feature || evt;
        if (feature.popup) {
            popup = feature.popup;
            if (popup.cancelButton) {
                OpenLayers.Event.stopObservingElement(popup.cancelButton);
                popup.cancelButton.parentNode.removeChild(popup.cancelButton);
                popup.cancelButton = null;
                delete popup.cancelButton;
            }
            if (popup.okButton) {
                OpenLayers.Event.stopObservingElement(popup.okButton);
                popup.okButton.parentNode.removeChild(popup.okButton);
                popup.okButton = null;
                delete popup.okButton;
            }
            if (popup.input) {
                popup.input.parentNode.removeChild(popup.input);
                popup.input = null;
                delete popup.input;
            }
            popup.setContentHTML('');
            if (popup.feature) {
                popup.feature = null;
                delete popup.feature;
            }

            popup.destroy();

            popup = null;
            feature.popup = null;
            delete feature.popup;
        } else {
        //    console.log('no feature');
        }

    },
    tools: {
        icons: {
            point: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon point"><circle cx="32" cy="32" r="16" /></svg>',
            line: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon line"><path class="stroked" fill="none" d="M 45.454545,9.8181818 17.272727,23.090909 53.090909,42.727273 5.2727273,58" /></svg>',
            polygon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="64" height="64" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon area"><path class="stroked semitransparent" d="M 27.090909,6.9090906 49.818186,5.9999997 31.000004,31.636365 56.545458,57.636366 7.454545,58.909093 l 0,-26.363637 z"/></svg>',
            label: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" class="icon text" preserveAspectRatio="xMidYMid meet"><path d="M13.16,0l0.176,3.727H12.89c-0.086-0.656-0.203-1.125-0.352-1.406c-0.242-0.453-0.564-0.787-0.967-1.002S10.64,0.996,9.984,0.996H7.746v12.141c0,0.977,0.105,1.586,0.316,1.828c0.297,0.328,0.754,0.492,1.371,0.492h0.551v0.434H3.246v-0.434h0.562c0.672,0,1.148-0.203,1.43-0.609c0.172-0.25,0.258-0.82,0.258-1.711V0.996h-1.91c-0.742,0-1.27,0.055-1.582,0.164C1.598,1.309,1.25,1.594,0.961,2.016S0.5,3.008,0.445,3.727H0L0.188,0H13.16z"/></svg>'
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
            label: function (evt) {
                this.deactivateDrawControls();
                this.drawControls.label.activate();
                OpenLayers.Element.addClass(this.tools.buttons.label, 'active');
                this.activeDrawControl = 'label';
                this.layer.events.register('featureselected', this, this.showLabelEditorPopup);
                this.layer.events.register('featureunselected', this, this.removeLabelEditorPopup);

            },
            upload: function (evt) {
                
            },
            undo: function (evt) {
                var feature,
                    control,
                    sketch,
                    pointIndex,
                    lastLabelChange;

                control = this.drawControls[this.activeDrawControl];
                this.resetMeasures();

                if (this.activeDrawControl === 'label' && control.undoBuffer && control.undoBuffer.length > 0) {
                    lastLabelChange = control.undoBuffer.pop();
                    lastLabelChange.feature.attributes.label = lastLabelChange.previousLabel;
                    lastLabelChange.feature.layer.drawFeature(lastLabelChange.feature);
                } else {
                    // is there an unfinished sketch present?
                    if (control.handler && control.handler.getSketch) {
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
                }
            },
            save: function (evt) {
                var geoJSONData,
                    request;

                geoJSONData = (new OpenLayers.Format.GeoJSON()).write(this.features);

                $.support.cors = true;
                request = $.ajax({
                    url: this.JSONDataStorageUrl,
                    type: 'POST',
                    data: geoJSONData,
                    crossDomain: true,
                    context: this,
                    success: function (response, statusText, jqXHR) {
                        var url,
                            features;

                        if (response.indexOf('http') === 0) {
                            url = response.replace(/\r\n/g, '');
                            this.savedState.url = url;

                            while (this.features.length > 0) {
                                this.features.pop().destroy();
                            }
                            this.features = [];
                            this.hideControls();
                        }
                    },
                    error: function () {
                    },
                    complete: function (response, status) {
                    }
                });
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
        this.fileAPISupported = (window.File && window.FileReader && window.FileList && window.Blob);
        this.gpxFormat = new OpenLayers.Format.GPX();

        this.wgs84 = new OpenLayers.Projection("EPSG:4326");
        this.title = OpenLayers.Lang.translate('Drawing tool'); 
	},

	addFeature: function (feature) {
		this.features.push(feature);
        this.measuresUpdatingAllowed = false;
	},

	setMap: function (map) {
		var key,
			self = this,
			drawControlOptions,
            layerOptions;

		OpenLayers.Control.prototype.setMap.apply(this, [map]);

        layerOptions = {'visibility': false};
        if (this.styleMap) {
            layerOptions.styleMap = this.styleMap;
        }
		this.layer = new OpenLayers.Layer.Vector(OpenLayers.Lang.translate('Drawing'), layerOptions);
		this.map.addLayer(this.layer);

		drawControlOptions = {featureAdded: OpenLayers.Function.bind(self.addFeature, self)};
        this.drawControls.point = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Point, drawControlOptions);
        this.drawControls.line = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Path, drawControlOptions);
        this.drawControls.polygon = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Polygon, drawControlOptions);
        this.drawControls.label = new OpenLayers.Control.SelectFeature(this.layer);

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
            east,
            west,
            north,
            south;

        lonLat = new OpenLayers.LonLat([evt.vertex.x, evt.vertex.y]);
        lonLat.transform(this.map.getProjection(), this.wgs84);
        north = OpenLayers.Lang.translate('N');
        south = OpenLayers.Lang.translate('S');
        east = OpenLayers.Lang.translate('E');
        west = OpenLayers.Lang.translate('V');
        this.measures.lon.data.innerHTML = Math.abs(OpenLayers.Util.preciseRound(lonLat.lon, this.measuresPrecisionDegrees)) + '° ' + ((lonLat.lon > 0) ? east : west);
        this.measures.lon.data.setAttribute('title', lonLat.lon + '° ' + ((lonLat.lon > 0) ? east : west));
        this.measures.lat.data.innerHTML = Math.abs(OpenLayers.Util.preciseRound(lonLat.lat, this.measuresPrecisionDegrees)) + '° ' + ((lonLat.lat > 0) ? north : south);
        this.measures.lat.data.setAttribute('title', lonLat.lat + '° ' + ((lonLat.lat > 0) ? north : south));

        if (this.measuresUpdatingAllowed) {
            length = evt.feature.geometry.getLength();
            this.measures['length'].data.innerHTML = ((length > 1000) ? OpenLayers.Util.preciseRound(length / 1000, 2) + ' km' : OpenLayers.Util.preciseRound(length, 2) + ' m');
            if (!!self.map){
              var seaLayers =  self.map.getLayersBy("layerGroup","sjo");
              for (var l in seaLayers) {
                if (seaLayers[l].getVisibility()) {
                  this.measures['length'].data.innerHTML += '<br/>' + OpenLayers.Util.preciseRound(length / 1852, 2) + ' nm';
                  break;
                }
              }
            }
            this.measures['length'].data.setAttribute('title', length + ' m');

            area = evt.feature.geometry.getArea();
            this.measures.area.data.innerHTML = (area > 1000000) ? OpenLayers.Util.preciseRound(area / 1000000, 2) + ' km²' : OpenLayers.Util.preciseRound(area, 2) + ' m²';
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
        this.drawControls['label'].undoBuffer = [];
        this.layer.events.unregister('featureselected', this, this.showLabelEditorPopup);
        this.layer.events.unregister('featureunselected', this, this.removeLabelEditorPopup);
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

        btn.setAttribute('title', self.title);
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
                button.setAttribute('class', key);
                
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

        if (this.fileAPISupported) {
          // add import button
          toolItem = document.createElement('li');
          buttonText = OpenLayers.Lang.translate('Upload');
          var button = this.tools.buttons['upload'] = document.createElement('button');
          button.setAttribute('title', OpenLayers.Lang.translate('Upload files in GPX format. More to come.'));
          OpenLayers.Element.addClass(button, 'fileUpload popular-route');
          if (!this.tools.icons['upload']) {
            OpenLayers.Element.addClass(toolItem, 'text-only');
          }
          buttonContent = '<span>'+buttonText+'</span>';
          button.innerHTML = buttonContent;

          this.fileInput = document.createElement('input');
          this.fileInput.setAttribute('type', 'file');
          this.fileInput.setAttribute('name', 'gpx-file');
          this.fileInput.setAttribute('id', 'gpx-file-upload');
          this.fileInput.setAttribute('class', 'upload');

          button.appendChild(this.fileInput);

          toolItem.appendChild(button);
          this.tools.list.appendChild(toolItem);

          this.fileReader = new FileReader();
          OpenLayers.Event.observe(this.fileReader, 'load', OpenLayers.Function.bind(this.drawTrackFromFile, this));
          OpenLayers.Event.observe(this.fileInput, 'change', OpenLayers.Function.bind(this.fileInputChangeHandler, this));
        }

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

    fileInputChangeHandler: function (evt) {
      var files,
        i,
        f;

      evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
      evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;

      //this.removeError();
      files = evt.target.files;
      // files is a FileList of File objects.
      for (i = 0; f = files[i]; i += 1) {
        this.fileReader.readAsText(f);
      }
    },

    drawTrackFromFile: function (evt) {
      var features;

      features = this.gpxFormat.read(evt.target.result);
      if (features.length > 0) {
        this.drawTrack(features);
      } else {
        NK.functions.log(OpenLayers.Lang.translate('Unable to read track from file.'));
        //this.clearFeature();
      }
    },

    drawTrack: function (features) {
      var i, j, feature;
      for (i = 0, j = features.length; i < j; i += 1) {
        feature = features[i];
        feature.geometry.transform(this.wgs84, this.map.getProjection());
        this.features.push(features[i]);
        this.layer.addFeatures([features[i]], {silent: true}); // silent: true to avoid submitting the track automatically
        this.layer.drawFeature(features[i]);

      }
      //this.zoomToBoundsOffset(this.mapContainsTrack(features[0]), -1); // TODO: 
    },

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
            key,
            i, j,
            drawingLayer,
            layer,
            feature,
            k, l;

        for (i = 0, j = this.map.layers.length; i < j; i += 1) {
            l = this.map.layers[i];
            if (l.isDrawing) {
                this.layer.addFeatures(l.features);
                this.savedState.url = l.url;
                l.removeAllFeatures();
                this.map.removeLayer(l);
                l.destroy();
                for (k = 0, l = this.layer.features.length; k < l; k += 1) {
                    this.layer.features[k].layer = this.layer;
                    this.features.push(this.layer.features[k]);
                    this.layer.drawFeature(this.layer.features[k]);
                }
                this.layer.refresh();
                NK.functions.updateHistory();
            }
        }
        this.layer.setVisibility(true);

		OpenLayers.Util.renderToggleToolClick({'self': self}, true);

    	OpenLayers.Element.addClass(this.div, 'active');

        
        if (this.activeDrawControl) {
    	   this.tools.handlers[this.activeDrawControl].apply(this, []);
        }
    }, // showControls

    hideControls: function (skipToggle) { 
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
        this.layer.removeAllFeatures();
        this.features = [];
        if (this.savedState.url) {
            NK.functions.addGeoJsonLayer(this.savedState.url, null, {'isDrawing': true});
            NK.functions.updateHistory();
        }

        if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': this}, false);
    }, //hideControls

  toGeoJSON: function() {
    'use strict';

    var removeSpace = (/\s*/g),
        trimSpace = (/^\s*|\s*$/g),
        splitSpace = (/\s+/);
    // generate a short, numeric hash of a string
    function okhash(x) {
        if (!x || !x.length) return 0;
        for (var i = 0, h = 0; i < x.length; i++) {
            h = ((h << 5) - h) + x.charCodeAt(i) | 0;
        } return h;
    }
    // all Y children of X
    function get(x, y) { return x.getElementsByTagName(y); }
    function attr(x, y) { return x.getAttribute(y); }
    function attrf(x, y) { return parseFloat(attr(x, y)); }
    // one Y child of X, if any, otherwise null
    function get1(x, y) { var n = get(x, y); return n.length ? n[0] : null; }
    // https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
    function norm(el) { if (el.normalize) { el.normalize(); } return el; }
    // cast array x into numbers
    function numarray(x) {
        for (var j = 0, o = []; j < x.length; j++) { o[j] = parseFloat(x[j]); }
        return o;
    }
    function clean(x) {
        var o = {};
        for (var i in x) { if (x[i]) { o[i] = x[i]; } }
        return o;
    }
    // get the content of a text node, if any
    function nodeVal(x) {
        if (x) { norm(x); }
        return (x && x.firstChild && x.firstChild.nodeValue) || '';
    }
    // get one coordinate from a coordinate array, if any
    function coord1(v) { return numarray(v.replace(removeSpace, '').split(',')); }
    // get all coordinates from a coordinate array as [[],[]]
    function coord(v) {
        var coords = v.replace(trimSpace, '').split(splitSpace),
            o = [];
        for (var i = 0; i < coords.length; i++) {
            o.push(coord1(coords[i]));
        }
        return o;
    }
    function coordPair(x) {
        var ll = [attrf(x, 'lon'), attrf(x, 'lat')],
            ele = get1(x, 'ele'),
            // handle namespaced attribute in browser
            heartRate = get1(x, 'gpxtpx:hr') || get1(x, 'hr'),
            time = get1(x, 'time');
        if (ele) { ll.push(parseFloat(nodeVal(ele))); }
        return {
            coordinates: ll,
            time: time ? nodeVal(time) : null,
            heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null
        };
    }

    // create a new feature collection parent object
    function fc() {
        return {
            type: 'FeatureCollection',
            features: []
        };
    }

    var serializer;
    if (typeof XMLSerializer !== 'undefined') {
        serializer = new XMLSerializer();
    // only require xmldom in a node environment
    } else if (typeof exports === 'object' && typeof process === 'object' && !process.browser) {
        serializer = new (require('xmldom').XMLSerializer)();
    }
    function xml2str(str) {
        // IE9 will create a new XMLSerializer but it'll crash immediately.
        if (str.xml !== undefined) return str.xml;
        return serializer.serializeToString(str);
    }

    var t = {
        kml: function(doc) {

            var gj = fc(),
                // styleindex keeps track of hashed styles in order to match features
                styleIndex = {},
                // atomic geospatial types supported by KML - MultiGeometry is
                // handled separately
                geotypes = ['Polygon', 'LineString', 'Point', 'Track', 'gx:Track'],
                // all root placemarks in the file
                placemarks = get(doc, 'Placemark'),
                styles = get(doc, 'Style');

            for (var k = 0; k < styles.length; k++) {
                styleIndex['#' + attr(styles[k], 'id')] = okhash(xml2str(styles[k])).toString(16);
            }
            for (var j = 0; j < placemarks.length; j++) {
                gj.features = gj.features.concat(getPlacemark(placemarks[j]));
            }
            function kmlColor(v) {
                var color, opacity;
                v = v || "";
                if (v.substr(0, 1) === "#") { v = v.substr(1); }
                if (v.length === 6 || v.length === 3) { color = v; }
                if (v.length === 8) {
                    opacity = parseInt(v.substr(0, 2), 16) / 255;
                    color = v.substr(2);
                }
                return [color, isNaN(opacity) ? undefined : opacity];
            }
            function gxCoord(v) { return numarray(v.split(' ')); }
            function gxCoords(root) {
                var elems = get(root, 'coord', 'gx'), coords = [], times = [];
                if (elems.length === 0) elems = get(root, 'gx:coord');
                for (var i = 0; i < elems.length; i++) coords.push(gxCoord(nodeVal(elems[i])));
                var timeElems = get(root, 'when');
                for (var i = 0; i < timeElems.length; i++) times.push(nodeVal(timeElems[i]));
                return {
                    coords: coords,
                    times: times
                };
            }
            function getGeometry(root) {
                var geomNode, geomNodes, i, j, k, geoms = [], coordTimes = [];
                if (get1(root, 'MultiGeometry')) { return getGeometry(get1(root, 'MultiGeometry')); }
                if (get1(root, 'MultiTrack')) { return getGeometry(get1(root, 'MultiTrack')); }
                if (get1(root, 'gx:MultiTrack')) { return getGeometry(get1(root, 'gx:MultiTrack')); }
                for (i = 0; i < geotypes.length; i++) {
                    geomNodes = get(root, geotypes[i]);
                    if (geomNodes) {
                        for (j = 0; j < geomNodes.length; j++) {
                            geomNode = geomNodes[j];
                            if (geotypes[i] === 'Point') {
                                geoms.push({
                                    type: 'Point',
                                    coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] === 'LineString') {
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                                });
                            } else if (geotypes[i] === 'Polygon') {
                                var rings = get(geomNode, 'LinearRing'),
                                    coords = [];
                                for (k = 0; k < rings.length; k++) {
                                    coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                                }
                                geoms.push({
                                    type: 'Polygon',
                                    coordinates: coords
                                });
                            } else if (geotypes[i] === 'Track' ||
                                geotypes[i] === 'gx:Track') {
                                var track = gxCoords(geomNode);
                                geoms.push({
                                    type: 'LineString',
                                    coordinates: track.coords
                                });
                                if (track.times.length) coordTimes.push(track.times);
                            }
                        }
                    }
                }
                return {
                    geoms: geoms,
                    coordTimes: coordTimes
                };
            }
            function getPlacemark(root) {
                var geomsAndTimes = getGeometry(root), i, properties = {},
                    name = nodeVal(get1(root, 'name')),
                    styleUrl = nodeVal(get1(root, 'styleUrl')),
                    description = nodeVal(get1(root, 'description')),
                    timeSpan = get1(root, 'TimeSpan'),
                    extendedData = get1(root, 'ExtendedData'),
                    lineStyle = get1(root, 'LineStyle'),
                    polyStyle = get1(root, 'PolyStyle');

                if (!geomsAndTimes.geoms.length) return [];
                if (name) properties.name = name;
                if (styleUrl && styleIndex[styleUrl]) {
                    properties.styleUrl = styleUrl;
                    properties.styleHash = styleIndex[styleUrl];
                }
                if (description) properties.description = description;
                if (timeSpan) {
                    var begin = nodeVal(get1(timeSpan, 'begin'));
                    var end = nodeVal(get1(timeSpan, 'end'));
                    properties.timespan = { begin: begin, end: end };
                }
                if (lineStyle) {
                    var linestyles = kmlColor(nodeVal(get1(lineStyle, 'color'))),
                        color = linestyles[0],
                        opacity = linestyles[1],
                        width = parseFloat(nodeVal(get1(lineStyle, 'width')));
                    if (color) properties.stroke = color;
                    if (!isNaN(opacity)) properties['stroke-opacity'] = opacity;
                    if (!isNaN(width)) properties['stroke-width'] = width;
                }
                if (polyStyle) {
                    var polystyles = kmlColor(nodeVal(get1(polyStyle, 'color'))),
                        pcolor = polystyles[0],
                        popacity = polystyles[1],
                        fill = nodeVal(get1(polyStyle, 'fill')),
                        outline = nodeVal(get1(polyStyle, 'outline'));
                    if (pcolor) properties.fill = pcolor;
                    if (!isNaN(popacity)) properties['fill-opacity'] = popacity;
                    if (fill) properties['fill-opacity'] = fill === "1" ? 1 : 0;
                    if (outline) properties['stroke-opacity'] = outline === "1" ? 1 : 0;
                }
                if (extendedData) {
                    var datas = get(extendedData, 'Data'),
                        simpleDatas = get(extendedData, 'SimpleData');

                    for (i = 0; i < datas.length; i++) {
                        properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                    }
                    for (i = 0; i < simpleDatas.length; i++) {
                        properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
                    }
                }
                if (geomsAndTimes.coordTimes.length) {
                    properties.coordTimes = (geomsAndTimes.coordTimes.length === 1) ?
                        geomsAndTimes.coordTimes[0] : geomsAndTimes.coordTimes;
                }
                var feature = {
                    type: 'Feature',
                    geometry: (geomsAndTimes.geoms.length === 1) ? geomsAndTimes.geoms[0] : {
                        type: 'GeometryCollection',
                        geometries: geomsAndTimes.geoms
                    },
                    properties: properties
                };
                if (attr(root, 'id')) feature.id = attr(root, 'id');
                return [feature];
            }
            return gj;
        },
        gpx: function(doc) {
            var i,
                tracks = get(doc, 'trk'),
                routes = get(doc, 'rte'),
                waypoints = get(doc, 'wpt'),
                // a feature collection
                gj = fc(),
                feature;
            for (i = 0; i < tracks.length; i++) {
                feature = getTrack(tracks[i]);
                if (feature) gj.features.push(feature);
            }
            for (i = 0; i < routes.length; i++) {
                feature = getRoute(routes[i]);
                if (feature) gj.features.push(feature);
            }
            for (i = 0; i < waypoints.length; i++) {
                gj.features.push(getPoint(waypoints[i]));
            }
            function getPoints(node, pointname) {
                var pts = get(node, pointname),
                    line = [],
                    times = [],
                    heartRates = [],
                    l = pts.length;
                if (l < 2) return {};  // Invalid line in GeoJSON
                for (var i = 0; i < l; i++) {
                    var c = coordPair(pts[i]);
                    line.push(c.coordinates);
                    if (c.time) times.push(c.time);
                    if (c.heartRate) heartRates.push(c.heartRate);
                }
                return {
                    line: line,
                    times: times,
                    heartRates: heartRates
                };
            }
            function getTrack(node) {
                var segments = get(node, 'trkseg'),
                    track = [],
                    times = [],
                    heartRates = [],
                    line;
                for (var i = 0; i < segments.length; i++) {
                    line = getPoints(segments[i], 'trkpt');
                    if (line.line) track.push(line.line);
                    if (line.times && line.times.length) times.push(line.times);
                    if (line.heartRates && line.heartRates.length) heartRates.push(line.heartRates);
                }
                if (track.length === 0) return;
                var properties = getProperties(node);
                if (times.length) properties.coordTimes = track.length === 1 ? times[0] : times;
                if (heartRates.length) properties.heartRates = track.length === 1 ? heartRates[0] : heartRates;
                return {
                    type: 'Feature',
                    properties: properties,
                    geometry: {
                        type: track.length === 1 ? 'LineString' : 'MultiLineString',
                        coordinates: track.length === 1 ? track[0] : track
                    }
                };
            }
            function getRoute(node) {
                var line = getPoints(node, 'rtept');
                if (!line) return;
                var routeObj = {
                    type: 'Feature',
                    properties: getProperties(node),
                    geometry: {
                        type: 'LineString',
                        coordinates: line
                    }
                };
                if (line.times.length) routeObj.geometry.times = line.times;
                return routeObj;
            }
            function getPoint(node) {
                var prop = getProperties(node);
                prop.sym = nodeVal(get1(node, 'sym'));
                return {
                    type: 'Feature',
                    properties: prop,
                    geometry: {
                        type: 'Point',
                        coordinates: coordPair(node).coordinates
                    }
                };
            }
            function getProperties(node) {
                var meta = ['name', 'desc', 'author', 'copyright', 'link',
                            'time', 'keywords'],
                    prop = {},
                    k;
                for (k = 0; k < meta.length; k++) {
                    prop[meta[k]] = nodeVal(get1(node, meta[k]));
                }
                return clean(prop);
            }
            return gj;
        }
    };
    return t;
  },

  CLASS_NAME: "OpenLayers.Control.Draw"
});
