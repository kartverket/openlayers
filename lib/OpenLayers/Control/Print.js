/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/RegularPolygon.js
 * @requires OpenLayers/Handler/ResizableBox.js
 * @requires OpenLayers/Handler/Keyboard.js
 * @requires OpenLayers/Util/htmlEncode.js
 */

var PX_TO_CM = 1.0 / 300 * 2.54;

OpenLayers.Control.Print =
  OpenLayers.Class(OpenLayers.Control, {

    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass            : 'olControlButtonEmbed',
    title               : null,
    widget              : null,
    cnt                 : null,
    stepSpecificPanel   : null,
    stepSpecificElements: null,
    activeStep          : null,
    nextButton          : null,
    data                : null,
    areaElement         : null,
    selectedAreaBounds  : null,
    boxControl          : null,
    markerAdder         : null,
    tracking            : null,
    attr                : {'type': 'embedLight', 'names': ['base', 'square', 'left', 'top', 'right', 'bottom']},
    maskLayer           : null,
    areaSelectedBounds  : null,
    featureMask         : null,
    backupControls      : null,

    initialize: function (options) {
      OpenLayers.Control.prototype.initialize.apply(this, [options]);

      this.type = OpenLayers.Control.TYPE_BUTTON;
      this.navButtons = {};
      this.navButtons.next = null;
      this.title = OpenLayers.Lang.translate('Print');
      this.stepSpecificElements = {};
      this.data = {};
      this.autoActivate = true;
    }, //initialize
    
    activate: function () {
      var self = this;
      var timer = setInterval(function () {
        if (map.center !== null) {
          self.showControls();
          clearInterval(timer);
        }
      }, 100);
    },

    setMap: function (map, tracking) {
      this.map = map;
      this.tracking = tracking;

      if (this.handler) {
        this.handler.setMap(map);
      }
      this.map.events.on();
    }, //setMap

    draw: function () {
      var self = this, cName = 'btn nkButton hidden';
      var mapped = 'OpenLayers_Control_Print' + self.map.id;
      var btn = OpenLayers.Util.createButton(mapped, null, null, null, 'static');

      OpenLayers.Event.observe(btn, 'click',
        OpenLayers.Function.bind(self.toggleWidget, self)
      );

      OpenLayers.Util.appendToggleToolClick({'self': self});

      btn.title = self.title;
      btn.className = btn.className === "" ? cName : btn.className + " " + cName;
      btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" preserveAspectRatio="xMinYMid meet" class="icon print"><path d="M17.617,2H6.383v3.299h11.234V2z M21.026,6.487H2.974C2.437,6.487,2,6.934,2,7.483v7.327h2.934v-4.448h14.133v4.448H22V7.483C22,6.934,21.564,6.487,21.026,6.487z M19.885,8.929c-0.43,0-0.779-0.356-0.779-0.796s0.35-0.797,0.779-0.797s0.778,0.357,0.778,0.797S20.314,8.929,19.885,8.929z M16.787,20.828h-4.701c-1.703,0-0.883-4.129-0.883-4.129s-3.937,0.979-3.987-0.867v-3.79H6.069v5.339l0.336,0.344L10.586,22h7.347v-9.958h-1.146V20.828z" /></svg>');

      if (self.div === null) {
        self.div = btn;
      } else {
        self.div.appendChild(btn);
      }

      self.cnt = document.createElement("div");
      OpenLayers.Element.addClass(self.cnt, "cnt");

      self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
      self.div.appendChild(self.widget);
      self.insertContent(self.cnt);

      return self.div;
    }, // draw

    insertContent: function (holder) {
      if (!holder) return;
      var self = this;

      holder.innerHTML = '';

      OpenLayers.Element.addClass(holder, "embedContent");

      self.stepSpecificPanel = document.createElement('div');
      self.stepSpecificPanel.setAttribute('class', 'step-specific');
      holder.appendChild(self.stepSpecificPanel);

      // add the bottom navigation (next/previous) buttons
      var buttonsPanel = document.createElement('div');
      buttonsPanel.setAttribute('class', 'buttons-panel');

      self.nextButton = document.createElement('button');
      self.nextButton.setAttribute('class', 'btn btn-block');
      self.nextButton.innerHTML = OpenLayers.Lang.translate('Next');
      buttonsPanel.appendChild(self.nextButton);

      OpenLayers.Event.observe(self.nextButton, 'click', function (evt) {
        self.sendPrint(map.getLayersByName('Print')[0].features[0].geometry.getBounds());
        //self.hideControls();
        return false;
      });

      holder.appendChild(buttonsPanel);
    }, //insertContent

    removeMarker: function (id) {
      var markerElement,
        linkElement,
        elements,
        i,
        j,
        e,
        marker,
        markerIsDeleted = false;

      markerElement = document.getElementById('marker-' + id);
      linkElement = document.getElementById('remove-marker-' + id);
      // delete reference to removeElement
      elements = this.stepSpecificElements;
      for (i = 0, j = elements.markerRemoveLinks.length; i < j; i += 1) {
        if (elements.markerRemoveLinks[i] === linkElement) {
          elements.markerRemoveLinks.splice(i, 1);
          break;
        }
      }

      for (e in elements) {
        if (elements.hasOwnProperty(e) && elements[e] === markerElement) {
          OpenLayers.Event.stopObservingElement(elements[e]);
          elements[e].parentNode.removeChild(elements[e]);
          elements[e] = null;
          delete elements[e];
        }
      }
      // delete DOM elements
      OpenLayers.Event.stopObservingElement(linkElement);
      linkElement.parentNode.removeChild(linkElement);
      linkElement = null;
      OpenLayers.Event.stopObservingElement(markerElement);
      markerElement.parentNode.removeChild(markerElement);
      markerElement = null;

      // delete data
      for (i = 0, j = this.data.markers.length; i < j; i += 1) {
        marker = this.data.markers[i];
        if (markerIsDeleted) {
          if (marker.feature) {
            marker.feature.attributes.nr = parseInt(marker.feature.attributes.nr) - 1;
            marker.feature.layer.drawFeature(marker.feature, 'default');
          }
        } else if (parseInt(marker.id) === parseInt(id)) {
          if (marker.feature) {
            this.removeMarkerFeature(marker.feature);
            marker.feature = null;
            delete marker.feature;
          }
          this.data.markers.splice(i, 1);
          i -= 1;
          j -= 1;
          markerIsDeleted = true;
        }
      }

    }, //removeMarker

    steps: {
      format: {
        draw: function () {
          this.nextButton.innerHTML = OpenLayers.Lang.translate('freeprint_create_map') + '!';
          this.nextButton.setAttribute('id', 'ol-print-submit');
          this.nextButton.setAttribute('onclick', 'ga(\'send\', \'event\', \'link\', \'click\', \'lag-turkart\');');
          
          var panel = this.stepSpecificPanel;
          var elements = this.stepSpecificElements;
          
          // Add controls to the Print widget.
          var content = ''
          + '<p>' + OpenLayers.Lang.translate('freeprint_short_desc') + '</p>'
          + '<div class="form-group form-group-sm">'
          + '  <label for="ol-print-scale">' + OpenLayers.Lang.translate('freeprint_scale') + '</label>'
          + '  <select class="form-control" id="ol-print-scale">'
          + '    <option value="25000" selected>1:25 000</option>'
          + '    <option value="50000">1:50 000</option>'
          + '  </select>'
          + '</div>'
          + '<div class="form-group form-group-sm">'
          + '  <label for="ol-print-title">' + OpenLayers.Lang.translate('freeprint_name_your_map') + '</label>'
          + '  <input type="text" class="form-control" id="ol-print-title" placeholder="Turkart">'
          + '  <span id="helpBlock" class="help-block">' + OpenLayers.Lang.translate('freeprint_name_too_long') + '</span>'
          + '</div>'
          + '<div class="checkbox">'
          + '  <label>'
          + '    <input type="checkbox" id="ol-print-trips" value="1"> ' + OpenLayers.Lang.translate('freeprint_include_trips')
          + '  </label>'
          + '</div>'
          + '<div class="checkbox">'
          + '  <label>'
          + '    <input type="checkbox" id="ol-print-legend" value="1"> ' + OpenLayers.Lang.translate('freeprint_include_legends')
          + '  </label>'
          + '</div>';
          panel.innerHTML = content;
          
          OpenLayers.Element.addClass(panel, 'format');
          
          // Redraw grid when scale changes.
          var olPrintScale = document.getElementById('ol-print-scale');
          if (olPrintScale !== null) {
            OpenLayers.Event.observe(olPrintScale, 'change', OpenLayers.Function.bind(this.printFrame, this));
          }
          // Check the width of map title.
          var olPrintTitle = document.getElementById('ol-print-title');
          if (olPrintTitle !== null) {
            OpenLayers.Event.observe(olPrintTitle, 'change', OpenLayers.Function.bind(this.checkTitleWidth, this));
          }
          // Toggle trips layer
          var olPrintTrips = document.getElementById('ol-print-trips');
          if (olPrintTrips !== null) {
            OpenLayers.Event.observe(olPrintTrips, 'change', OpenLayers.Function.bind(this.toggleTripsLayer, this));
          }
          
          // Draw the grid.
          this.printFrame();
          
          var pts = map.getLayersByName('Print')[0].features[0].geometry;
          elements.areaSelectedBounds = new OpenLayers.Geometry.LinearRing(pts);
          elements.areaSelectedBounds.bounds = map.getLayersByName('Print')[0].features[0].geometry.getBounds();
          
          if (!this.div || !OpenLayers.Element.hasClass(this.div, 'active')) {
            this.adjustWidgetPosition();
          }
        },
        validate: function () {
          return true;
        },
        remove: function () {
          var panel = this.stepSpecificPanel;
          var elements = this.stepSpecificElements;
          
          // Remove layer and stuff
          OpenLayers.Element.removeClass(panel, 'format');
          if (this.maskLayer) {
            map.removeLayer(this.maskLayer);
            delete this.maskLayer;
          }
          delete elements.layer;
          delete elements.format;
          this.removeStepSpecificElements();
          
          // Unregister events
          map.events.unregister('zoomend', map, this.onMapZoomEnd);
          map.events.unregister('move', map, this.onMapMove);
        }
      } //format
    }, //steps
    
    adjustWidgetPosition: function () {
      var self = this,
        widget = document.getElementById('PMwidget');

      if (widget && $(widget).offset().top < 0) {

        var h = 675, s = OpenLayers.Util.getWindowSize(), w = [
          parseInt(OpenLayers.Util.getStyle(widget, 'width')) || 0,
          parseInt(OpenLayers.Util.getStyle(widget, 'height')) || 0
        ];

        w[2] = w[0] / 2, w[3] = w[1] / 2;
        s[2] = s[0] / 2, s[3] = s[1] / 2;

        var t = h + w[3], m = s[3] - t, d = 10;
        if (m <= 0) {
          if (t + w[3] + d > s[1]) m += (t + w[3] - s[1] - d);
          self.map.moveByPx(0, m);
        }
      }
    }, //adjustWidgetPosition

    removeStepSpecificElements: function () {
      var elements = this.stepSpecificElements,
        e;

      for (e in elements) {
        if (elements.hasOwnProperty(e)) {
          OpenLayers.Event.stopObservingElement(elements[e]);
          if (elements[e].parentNode) {
            elements[e].parentNode.removeChild(elements[e]);
          }
          elements[e] = null;
          delete elements[e];
        }
      }
    }, //removeStepSpecificElements

    hideControls: function (skipToggle) {
      var self = this, btn = self.div;
      if (!btn || !OpenLayers.Element.hasClass(btn, 'active')) return;

      OpenLayers.Element.removeClass(btn, 'active');
      self.deleteStepData();

      if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': self}, false);

    }, //hideControls

    deleteStepData: function () {
      var self = this, data = self.data || {}, i = 0, j = 0;

      for (var d in data) {
        if (!data.hasOwnProperty(d)) continue;

        if (d === 'markers') {
          for (i = 0, j = data[d].length; i < j; i += 1) {
            if (data[d][i].feature) {
              self.removeMarkerFeature(data[d][i].feature);
              data[d][i].feature = null;
              delete data[d][i].feature;
            }
          }
        }
        data[d] = null;
        delete data[d];
      }

      self.steps[self.activeStep].remove.apply(self);
      self.activeStep = null;
      if (self.areaElement) {
        OpenLayers.Event.stopObservingElement(self.areaElement);
        self.areaElement.parentNode.removeChild(self.areaElement);
        self.areaElement = null;
      }

      /*
       Note: the "pekere" layer is automatically created by
       NK.functions.addLabeledMarker if it doesn't exist.
       */
      var markerLayer = self.map.getLayersBy('shortid', 'pekere');
      if (markerLayer.length) {
        markerLayer[0].destroy();
      }
    }, // deleteStepData

    showControls: function () {
      OpenLayers.Util.renderToggleToolClick({'self': this}, true);

      this.activeStep = 'format';
      this.steps[this.activeStep].draw.apply(this);
      OpenLayers.Element.addClass(this.div, 'active');
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable

    toggleWidget: function () {
      OpenLayers.Element.hasClass(this.div, 'active') ? this.hideControls() : this.showControls();
    }, // toggleWidget

    toggleControls: function () {
    },//togglecontrols
    
    checkTitleWidth: function (e) {
        var em = $(e.target);
        var title = em.val() || '';
        var size = calculateSize(title, {
            font: 'Arial',
            fontSize: '21px'
        });
        if (size.width > 475) {
            em.closest('.form-group').addClass('has-error');
            $('#ol-print-submit').prop('disabled', true);
        } else {
            em.closest('.form-group').removeClass('has-error');
            $('#ol-print-submit').prop('disabled', false);
        }
    },//checkTitleWidth
    
    toggleTripsLayer: function (e) {
        var showTrips = e.target.checked || false;
        
        var sld = '<?xml version="1.0" encoding="UTF-8"?>';
        sld += '<StyledLayerDescriptor version="1.1.0" xmlns="http://www.opengis.net/sld" xmlns:se="http://www.opengis.net/se" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd">';
        sld +=   '<NamedLayer>';
        sld +=     '<se:Name>N50Annenveg</se:Name>';
        sld +=     '<UserStyle>';
        sld +=       '<se:FeatureTypeStyle>';
        sld +=         '<se:Rule>';
        sld +=           '<se:Name>Merket sti</se:Name>';
        sld +=           '<ogc:Filter>';
        sld +=             '<ogc:And>';
        sld +=               '<ogc:PropertyIsEqualTo>';
        sld +=                 '<ogc:PropertyName>rutemerking</ogc:PropertyName>';
        sld +=                 '<ogc:Literal>JA</ogc:Literal>';
        sld +=               '</ogc:PropertyIsEqualTo>';
        sld +=               '<ogc:PropertyIsEqualTo>';
        sld +=                 '<ogc:PropertyName>objtype</ogc:PropertyName>';
        sld +=                 '<ogc:Literal>Sti</ogc:Literal>';
        sld +=               '</ogc:PropertyIsEqualTo>';
        sld +=             '</ogc:And>';
        sld +=           '</ogc:Filter>';
        sld +=           '<se:MaxScaleDenominator>50000.000000</se:MaxScaleDenominator>';
        sld +=           '<se:LineSymbolizer>';
        sld +=             '<se:Stroke>';
        sld +=               '<se:SvgParameter name="stroke">#FF0000</se:SvgParameter>';
        sld +=               '<se:SvgParameter name="stroke-width">3</se:SvgParameter>';
        sld +=             '</se:Stroke>';
        sld +=           '</se:LineSymbolizer>';
        sld +=         '</se:Rule>';
        sld +=       '</se:FeatureTypeStyle>';
        sld +=     '</UserStyle>';
        sld +=   '</NamedLayer>';
        sld += '</StyledLayerDescriptor>';
        
        var name = 'fotruter';
        
        var layers = map.getLayersByName(name);
        if (layers.length == 0) {
            var wms = new OpenLayers.Layer.WMS(name, 'http://wms.geonorge.no/skwms1/wms.kartdata2?', {
                'LAYERS': 'N50Annenveg',
                'TRANSPARENT': 'TRUE',
                'FORMAT': 'image/png',
                'SERVICE': 'WMS',
                'VERSION': '1.3.0',
                'REQUEST': 'GetMap',
                'STYLES': ''
            });
            map.addLayer(wms);
            layers = map.getLayersByName(name);
        }
        
        if (showTrips) {
            layers[0].mergeNewParams({
                'SLD_BODY': sld
            });
            layers[0].setVisibility(true);
        } else {
            layers[0].setVisibility(false);
        }
    },//toggleTripsLayer
    
    printFrame: function () {
      // General
      var cols = 4;
      var rows = 3;
      var pageMargin = 1.7; // cm
      var pageWidth = 21 - (pageMargin * 2); // 21cm = A4 width
      var pageHeight = 29.7 -(pageMargin * 2);
      
      // Get scale from form and create aspect
      var olPrintScale = document.getElementById('ol-print-scale');
      var scale = olPrintScale === null ? 25000 : parseInt(olPrintScale.value);
      var boxWidth = (scale * pageWidth * cols) / 100; // ([50000|25000] * pageWidth * cols) / 100
      var boxHeight = (scale * pageHeight * rows) / 100;
      
      // Create a centered box
      var box2 = map.getExtent();
      var mapCenter = box2.getCenterLonLat();
      box2.left = mapCenter.lon - (boxWidth / 2);
      box2.right = box2.left + boxWidth;
      box2.bottom = mapCenter.lat - (boxHeight / 2);
      box2.top = box2.bottom + boxHeight;
      
      if (this.maskLayer) {
        // Remove layer
        map.removeLayer(this.maskLayer);
        delete this.maskLayer;
        // Unregister events
        map.events.unregister('zoomend', map, this.onMapZoomEnd);
        map.events.unregister('move', map, this.onMapMove);
      }
      this.maskLayer = new OpenLayers.Layer.Vector('Print');
      
      var coordinates = [];
      var minLon1 = box2.left;
      for (var c = 1; c <= cols; c++) {
        var minLon2 = minLon1 + ((box2.right - box2.left) / cols);
        var minLat1 = box2.bottom;
        for (var r = 1; r <= rows; r++) {
          var minLat2 = minLat1 + ((box2.top - box2.bottom) / rows);
          var tempBox = ([minLon1, minLat1, minLon2, minLat2]);
          coordinates.push(new OpenLayers.Bounds(tempBox).toGeometry());
          minLat1 = minLat2;
        }
        minLon1 = minLon2;
      }
      
      var multiPolygonGeometry = new OpenLayers.Geometry.MultiPolygon(coordinates);
      var testLonLat = box2.getCenterLonLat();
      var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat);
      var l1 = new OpenLayers.Geometry.Point(box2.left, box2.bottom);
      var l2 = new OpenLayers.Geometry.Point(box2.right, box2.bottom);
      l1.transform(new OpenLayers.Projection("EPSG:32633"), new OpenLayers.Projection(epsg.localProj));
      l2.transform(new OpenLayers.Projection("EPSG:32633"), new OpenLayers.Projection(epsg.localProj));
      
      // Make vector feature with attributes
      var attributes = {};
      attributes.origin = new OpenLayers.Geometry.Point(mapCenter.lon, mapCenter.lat);
      attributes.tilt = 5.204377268891661; //Math.atan2((l2.y - l1.y), (l2.x - l1.x)) * 180 / Math.PI;
      attributes.sone =  parseInt(epsg.sone);
      var feature = new OpenLayers.Feature.Vector(multiPolygonGeometry, attributes);
      this.maskLayer.addFeatures(feature);
      var sone = parseInt(epsg.sone) - 33;
      feature.geometry.rotate(sone * feature.attributes.tilt, feature.attributes.origin);
      // Register events
      map.events.register('zoomend', map, this.onMapZoomEnd);
      map.events.register('move', map, this.onMapMove);
      
      // Add layer and set index
      map.addLayers([this.maskLayer]);
      this.maskLayer.setZIndex(2000);
    }, // printFrame
    
    onMapMove: function (event) {
      // Rotate grid according to UTM zone.
      var layers = map.getLayersByName('Print');
      if (layers.length) {
        if (layers[0].features.length) {
          var feature = layers[0].features[0];
          var box2 = feature.geometry.getBounds();
          var mapCenter = box2.getCenterLonLat();
          var lonLat = new OpenLayers.LonLat(mapCenter.lon, mapCenter.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
          var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat);
          var sone = parseInt(epsg.sone);
          
          if (feature.attributes.sone != sone) {
            sone = sone - feature.attributes.sone;
            feature.geometry.rotate(sone * feature.attributes.tilt, feature.attributes.origin);
            feature.attributes.sone = parseInt(epsg.sone);
          }
          feature.move(map.getCenter());
        }
      }
    },
    
    onMapZoomEnd: function (event) {
      // Center the grid when zoom is complete.
      var layers = map.getLayersByName('Print');
      if (layers.length) {
        layers[0].features[0].move(event.object.center);
      }
    },

    getBiSone: function(geometry, sone){
      "use strict";
      var lonLatBL = new OpenLayers.LonLat(geometry.left, geometry.bottom).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var soneBL = OpenLayers.Projection.getUTMZone(lonLatBL.lon, lonLatBL.lat).sone;
      if (soneBL !== sone)
        return soneBL;

      var lonLatTL = new OpenLayers.LonLat(geometry.right, geometry.top).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var soneTL = OpenLayers.Projection.getUTMZone(lonLatTL.lon, lonLatTL.lat).sone;
      if (soneTL !== sone)
        return soneTL;

      var lonLatBR = new OpenLayers.LonLat(geometry.right, geometry.bottom).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var soneBR = OpenLayers.Projection.getUTMZone(lonLatBR.lon, lonLatBR.lat).sone;
      if (soneBR !== sone)
        return soneBR;

      var lonLatTR = new OpenLayers.LonLat(geometry.right, geometry.top).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var soneTR = OpenLayers.Projection.getUTMZone(lonLatTR.lon, lonLatTR.lat).sone;
      if (soneTR !== sone)
        return soneTR;

      return sone;
    },
    
    sendPrint: function (geometry) {
        var host = 'http://ws.geonorge.no/freeprint/';
        
        // Check if overlay div exists - if not, create it.
        var overlay = document.getElementById('overlay');
        if (overlay === null) {
            overlay = document.createElement('div');
            overlay.setAttribute('id', 'overlay');
            document.body.appendChild(overlay);
        }
        // Add "please wait" modal to overlay.
        overlay.innerHTML = '<div class="content">'
        + '<p>' + OpenLayers.Lang.translate('freeprint_creating_map') + '</p><p>' + OpenLayers.Lang.translate('freeprint_please_wait') + '</p>'
        + '<p><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="40" height="40" viewBox="0 0 40 40" xml:space="preserve" class="rotating"><circle cx="20" cy="5"  r="4" fill="#fff"></circle><circle cx="35" cy="20" r="4" fill="#fff"></circle><circle cx="20" cy="35" r="4" fill="#fff"></circle><circle cx="5"  cy="20" r="4" fill="#fff"></circle><circle cx="9"  cy="9"  r="4" fill="#fff"></circle><circle cx="31" cy="9"  r="4" fill="#fff"></circle><circle cx="31" cy="31" r="4" fill="#fff"></circle><circle cx="9"  cy="31" r="4" fill="#fff"></circle></svg></p>'
        + '<p><button class="btn btn-block btn-xs btn-danger" onclick="document.getElementById(\'overlay\').style.display = \'none\'">' + OpenLayers.Lang.translate('freeprint_cancel') + '</button></p>'
        + '</div>';
        overlay.style.display = 'block';
        
        // Doing all the calculations for the PDF:
        var testLonLat = geometry.getCenterLonLat();
        var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat).localProj;
        var sone = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat).sone;
        var biSone = this.getBiSone(geometry, sone);

        var newGeometry = geometry.transform(self.map.getProjectionObject(), epsg);
        var refUrl = location.protocol + '//' + location.host + location.pathname + location.hash;
        
        // JSON Parameters for PDF build script.
        var params = {
          map: {
            bbox: newGeometry.toArray()
            ,center: [newGeometry.getCenterLonLat().lon, newGeometry.getCenterLonLat().lat]
            ,dpi: '300'
            ,layers: [{
              baseURL: 'http://wms.geonorge.no/skwms1/wms.toporaster3'
              ,customParams: {
                'TRANSPARENT': 'false'
              }
              ,imageFormat: 'image/jpeg'
              ,layers: ['toporaster']
              ,opacity: 1
              ,type: 'WMS'
            }]
            ,projection: epsg
            ,sone: sone
            ,biSone: biSone
          }
          ,paging: 12
          ,layout: 'A4 landscape'
          ,scale: document.getElementById('ol-print-scale').value || 25000
          ,titel: document.getElementById('ol-print-title').value || 'Turkart'
          ,legend: document.getElementById('ol-print-legend').checked || false
          ,link: refUrl
        };
        
        // Asking the server to generate a PDF.
        $.ajax({
          crossDomain: true
          ,data: JSON.stringify(params)
          ,dataType: 'json'
          ,type: 'POST'
          ,url: host + 'getprint_test.py'
        }).fail(function (jqXHR, textStatus, errorThrown) {
          //console.log(jqXHR);
          //console.log(errorThrown);
          document.getElementById('overlay').innerHTML = '<div class="content"><p title="' + textStatus + '">' + OpenLayers.Lang.translate('freeprint_generate_pdf_failed') + '</p><button aria-label="Close" class="close abs" onclick="document.getElementById(\'overlay\').style.display = \'none\'" style="position: absolute;" type="button"><span aria-hidden="true">×</span></button></div>';
        }).done(function (response) {
          "use strict";
          document.getElementById('overlay').innerHTML = '<div class="content"><p>' + OpenLayers.Lang.translate('freeprint_finished') + '</p><p><a class="btn btn-sm btn-success btn-block" href="' + host + response.linkPdf + '" onclick="ga(\'send\', \'event\', \'link\', \'click\', \'last-ned-turkart\');" target="_blank">' + OpenLayers.Lang.translate('freeprint_download') + '</a></p><button aria-label="Close" class="close" onclick="document.getElementById(\'overlay\').style.display = \'none\'" style="position: absolute;" type="button"><span aria-hidden="true">×</span></button></div>';
        });
        
        // If more than one map is made without changing the position of the grid, its UTM zone will be wrong.
        // Redraw the Grid (print frame) to reset the position!
        this.printFrame();
    }, // sendPrint
    CLASS_NAME: 'OpenLayers.Control.Print'
}); // OpenLayers.Control.Print
