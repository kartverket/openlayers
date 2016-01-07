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
    }, //initialize

    setMap: function (map, tracking) {
      this.map = map;
      this.tracking = tracking;

      if (this.handler) {
        this.handler.setMap(map);
      }
      this.map.events.on();
    }, //setMap

    draw: function () {
      var self = this, cName = 'btn nkButton';
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
      self.nextButton.setAttribute('class', 'btn next');
      self.nextButton.innerHTML = OpenLayers.Lang.translate('Next');
      buttonsPanel.appendChild(self.nextButton);

      OpenLayers.Event.observe(self.nextButton, 'click', function (evt) {
        self.sendPrint(map.getLayersByName('Print')[0].features[0].geometry.getBounds());
        self.hideControls();
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
          this.nextButton.innerHTML = OpenLayers.Lang.translate('Print');
          //this.printFrame();
          
          var panel = this.stepSpecificPanel;
          var elements = this.stepSpecificElements;
          
          var content = ''
          + '<p>Hold down left mouse button and drag the desired area on the map.</p>'
          + '<div class="form-group form-group-sm">'
          + '  <label for="ol-print-title">Tittel</label>'
          + '  <input type="text" class="form-control" id="ol-print-title" placeholder="Turkart">'
          + '</div>'
          + '<div class="form-group form-group-sm">'
          + '  <label for="ol-print-scale">Målestokk</label>'
          + '  <select class="form-control" id="ol-print-scale">'
          + '    <option value="25000">1:25.000</option>'
          + '    <option value="50000" selected>1:50.000</option>'
          + '  </select>'
          + '</div>'
          + '<div class="checkbox">'
          + '  <label>'
          + '    <input type="checkbox" id="ol-print-legend" value="1"> Legg til tegnforklaring'
          + '  </label>'
          + '</div>'
          + '<div id="testLink">-</div>';
          panel.innerHTML = content;
          
          OpenLayers.Element.addClass(panel, 'format');
          
          var olPrintScale = document.getElementById('ol-print-scale');
          if (olPrintScale !== null) {
            OpenLayers.Event.observe(olPrintScale, 'change', OpenLayers.Function.bind(this.printFrame, this));
          }
          
          this.printFrame();
          
          var pts = map.getLayersByName('Print')[0].features[0].geometry;
          elements.areaSelectedBounds = new OpenLayers.Geometry.LinearRing(pts);
          elements.areaSelectedBounds.bounds = map.getLayersByName('Print')[0].features[0].geometry.getBounds();
          
          //this.updateSelectedArea();
          this.updateLink();
          
          if (!this.div || !OpenLayers.Element.hasClass(this.div, 'active')) {
            this.adjustWidgetPosition();
          }
        },
        validate: function () {
          return true;
        },
        remove  : function () {
          var panel = this.stepSpecificPanel,
            elements = this.stepSpecificElements;

          OpenLayers.Element.removeClass(panel, 'format');
          if (this.maskLayer) {
            map.removeLayer(this.maskLayer);
            delete this.maskLayer;
          }
          delete elements.layer;
          delete elements.format;
          this.removeStepSpecificElements();
        }
      } //format
    }, //steps

    updateLink: function () {
      var bbox = map.getLayersByName('Print')[0].features[0].geometry.getBounds().toBBOX();
      var format = encodeURIComponent(this.stepSpecificElements.format || "image/png");
      var layerName = NK.functions.addedLayers() || 'toporaster';
      var layer = map.getLayersBy('shortid', layerName)[0];
      var linkCode, WMS_URL;
      var a4scale, size, width, height;

      size = map.getLayersByName('Print')[0].features[0].geometry.getBounds().getSize();
      a4scale = Math.min(2640 / Math.max(size.w, size.h), 2480 / Math.min(size.w, size.h));
      width = size.w * a4scale;
      height = size.h * a4scale;

      if (layer.version == '1.1.1') {
        WMS_URL = layer.url + "service=WMS&request=GetMap&SRS=" + map.projection.projCode + "&FORMAT=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS=" + layerName + "&VERSION=1.1.1&WIDTH=" + width + "&HEIGHT=" + height + "&BBOX=" + bbox;
      } else {
        WMS_URL = layer.url + "service=WMS&request=GetMap&CRS=" + map.projection.projCode + "&FORMAT=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS=" + layerName + "&VERSION=1.3.0&WIDTH=" + width + "&HEIGHT=" + height + "&BBOX=" + bbox;
      }
      linkCode = "<td colspan=2><a target='_blank' style='color:#fff' href='" + WMS_URL + "'><br/>" + OpenLayers.Lang.translate("(Test) wms dataset") + "</a></td>";
      $('#testLink').html(linkCode);
    }, // updateLink

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

    printFrame: function () {
      // General
      var cols = 4;
      var rows = 3;
      var pageMargin = 1.7; // cm
      var pageWidth = 21 - (pageMargin * 2); // 21cm = A4 width
      
      // Get scale from form and create aspect
      var olPrintScale = document.getElementById('ol-print-scale');
      var scale = 50000; //olPrintScale === null ? 50000 : parseInt(olPrintScale.value);
      var boxWidth = (scale * pageWidth * cols) / 100; // ([50000|25000] * pageWidth * cols) / 100
      var boxHeight = boxWidth * 1.064; // For 9 pages: 1.4142
      
      // Create a centered box
      var box2 = map.getExtent();
      var mapCenter = box2.getCenterLonLat();
      box2.left = mapCenter.lon - (boxWidth / 2);
      box2.right = box2.left + boxWidth;
      box2.bottom = mapCenter.lat - (boxHeight / 2);
      box2.top = box2.bottom + boxHeight;
      
      if (this.maskLayer) {
        map.removeLayer(this.maskLayer);
        delete this.maskLayer;
      }
      this.maskLayer = new OpenLayers.Layer.Vector("Print", {isFixed: true});

      var coordinates = [];
      var c = 1;
      var minlon_1 = box2.left;
      while (c <= cols) {
        var r = 1;
        var minlon_2 = minlon_1 + ((box2.right - box2.left) / cols);
        var minlat_1 = box2.bottom;
        while (r <= rows) {
          var minlat_2 = minlat_1 + ((box2.top - box2.bottom) / rows);
          var temp_bbox = ([minlon_1, minlat_1, minlon_2, minlat_2]);
          coordinates.push(new OpenLayers.Bounds(temp_bbox).toGeometry());
          minlat_1 = minlat_2;
          r += 1;
        }
        minlon_1 = minlon_2;
        c += 1;
      }

      var multuPolygonGeometry = new OpenLayers.Geometry.MultiPolygon(coordinates);
      var testLonLat = box2.getCenterLonLat();
      var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat).localProj;
      var l1 = new OpenLayers.Geometry.Point(box2.left, box2.bottom);
      var l2 = new OpenLayers.Geometry.Point(box2.right, box2.bottom);
      var l_1 = new OpenLayers.Geometry.Point(box2.left, box2.bottom);
      var l_2 = new OpenLayers.Geometry.Point(box2.right, box2.bottom);
      l1.transform(new OpenLayers.Projection("EPSG:32633"), new OpenLayers.Projection(epsg));
      l2.transform(new OpenLayers.Projection("EPSG:32633"), new OpenLayers.Projection(epsg));
      var tilt = Math.atan2((l2.y - l1.y), (l2.x - l1.x));
      tilt = tilt * 180 / Math.PI;

      var feature = new OpenLayers.Feature.Vector(multuPolygonGeometry);
      var origin = new OpenLayers.Geometry.Point(box2.left, box2.bottom);
      this.maskLayer.addFeatures(feature);
      var last_epsg;

      map.events.register("move", map, function () {
        var testLonLat = box2.getCenterLonLat();
        var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat);
        var zone = epsg.localProj;
        epsg = +epsg.sone.substring(0, 2);
        var sones = epsg - 33;

        if (last_epsg != epsg) {
          feature.geometry.rotate(sones * -tilt, origin);
          feature.layer.drawFeature(feature);
        }
        last_epsg = epsg;
        var bbox = feature.geometry.getBounds().toBBOX();
        var format = encodeURIComponent("image/png");
        var layerName = NK.functions.addedLayers() || 'toporaster';
        var layer = map.getLayersBy('shortid', layerName)[0];
        var linkCode, WMS_URL;
        var a4scale, size, width, height;

        size = feature.geometry.getBounds().getSize();
        a4scale = Math.min(2640 / Math.max(size.w, size.h), 2480 / Math.min(size.w, size.h));
        width = size.w * a4scale;
        height = size.h * a4scale;

        if (layer.version == '1.1.1') {
          WMS_URL = layer.url + "service=WMS&request=GetMap&SRS=" + zone + "&FORMAT=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS=" + layerName + "&VERSION=1.1.1&WIDTH=" + width + "&HEIGHT=" + height + "&BBOX=" + bbox;
        } else {
          WMS_URL = layer.url + "service=WMS&request=GetMap&CRS=" + zone + "&FORMAT=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS=" + layerName + "&VERSION=1.3.0&WIDTH=" + width + "&HEIGHT=" + height + "&BBOX=" + bbox;
        }
        linkCode = "<td colspan=2><a target='_blank' style='color:#fff' href='" + WMS_URL + "'><br/>" + OpenLayers.Lang.translate("(Test) wms dataset") + "</a></td>";
        $('#testLink').html(linkCode);
      });
      map.addLayers([this.maskLayer]);
      this.maskLayer.setZIndex(2000);
    }, // printFrame

    sendPrint: function (geometry) {
        var host = 'http://nnriap551/';
        
        var popupSize = new OpenLayers.Size(200, 100);
        var popup = new OpenLayers.Popup.FramedSideAnchored('nk-selected-coverage-map', map.getCenter(), popupSize, 'Genererer kart, vennligst vent.', null, true, null, null, 'print-message-popup');
        popup.autoSize = false;
        map.addPopup(popup);
        
        //var layerName = NK.functions.addedLayers() || 'toporaster';
        //var printConfig = [];
        //printConfig['toporaster'] = 'toporaster';
        //printConfig['sjo'] = 'all';
        //var layer = map.getLayersBy('shortid', layerName)[0];
        
        var startTime = new Date().getTime();
        console.log(startTime);
        
        var testLonLat = geometry.getCenterLonLat();
        var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat).localProj;
        var newGeometry = geometry.transform(self.map.getProjectionObject(), epsg);
        
        var params = {
          map: {
            bbox: newGeometry.toArray()
            ,dpi: '300'
            ,layers: [{
              baseURL: 'http://openwms.statkart.no/skwms1/wms.toporaster3' // + layer.layer
              ,customParams: {
                'TRANSPARENT': 'true'
              }
              ,imageFormat: 'image/jpeg' //layer.format //"image/png; mode:24bit"
              ,layers: ['toporaster'] //[printConfig[layerName]]
              ,opacity: 1
              ,type: 'WMS'
            }]
            ,projection: epsg
          }
          ,paging: 12
          ,layout: 'A4 landscape'
          ,scale: 35000 //document.getElementById('ol-print-scale').value || 50000
          ,titel: document.getElementById('ol-print-title').value || 'Turkart'
          ,legend: document.getElementById('ol-print-legend').checked || false
          ,link: location.href
          //,scaling: document.querySelector('input[name="scaling"]:checked').value
        };
        console.log(params, JSON.stringify(params));
        $.ajax({
          crossDomain: true
          ,data: JSON.stringify(params)
          ,dataType: 'json'
          ,type: 'POST'
          ,url: host + 'getprint.py'
        }).fail(function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(errorThrown);
          document.getElementById('nk-selected-coverage-map_contentDiv').innerHTML = textStatus;
        }).done(function (response) {
          "use strict";
          document.getElementById('nk-selected-coverage-map_contentDiv').innerHTML = '<p>Kartet er ferdig!</p><p><a class="btn btn-success btn-block" href="' + host + response.linkPdf + '" target="_blank">Last ned</a></p>';
        });
    }, // sendPrint
    CLASS_NAME: 'OpenLayers.Control.Print'
}); // OpenLayers.Control.Print
