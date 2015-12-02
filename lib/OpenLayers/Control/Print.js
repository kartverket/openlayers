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
    stepProgressPanel   : null,
    stepSpecificPanel   : null,
    stepSpecificElements: null,
    activeStep          : null,
    nextButton          : null,
    backButton          : null,
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
      this.navButtons.back = null;
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
      var self = this, stepCount = 0, stepElements = [];

      holder.innerHTML = '';

      OpenLayers.Element.addClass(holder, "embedContent");

      var header = document.createElement('header');
      header.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Print') + '</h1>';

      self.stepProgressPanel = document.createElement('ol');
      self.stepProgressPanel.setAttribute('class', 'progress');

      for (var step in self.steps) {
        if (self.steps.hasOwnProperty(step)) {
          stepCount++;
          var item = document.createElement('li');
          item.setAttribute('class', step);
          item.innerHTML = OpenLayers.Lang.translate(
            'step <span class="step-number">${stepCount}</span> of ', {'stepCount': stepCount}
          );
          stepElements.push(item);
          self.stepProgressPanel.appendChild(item);
        }
      }

      while (stepElements.length > 0) {
        var stepCountElement = document.createElement('span');
        stepCountElement.innerHTML = '' + stepCount;
        stepElements.pop().appendChild(stepCountElement);
      }

      header.appendChild(self.stepProgressPanel);
      holder.appendChild(header);

      self.stepSpecificPanel = document.createElement('div');
      self.stepSpecificPanel.setAttribute('class', 'step-specific');
      holder.appendChild(self.stepSpecificPanel);

      // add the bottom navigation (next/previous) buttons
      var buttonsPanel = document.createElement('div');
      buttonsPanel.setAttribute('class', 'buttons-panel');

      self.backButton = document.createElement('button');
      self.backButton.setAttribute('class', 'btn back');
      self.backButton.innerHTML = OpenLayers.Lang.translate('Previous');
      buttonsPanel.appendChild(self.backButton);

      self.nextButton = document.createElement('button');
      self.nextButton.setAttribute('class', 'btn next');
      self.nextButton.innerHTML = OpenLayers.Lang.translate('Next');
      buttonsPanel.appendChild(self.nextButton);

      OpenLayers.Event.observe(self.backButton, 'click', function (evt) {
        self.previousStep();
        return false;
      });
      OpenLayers.Event.observe(self.nextButton, 'click', function (evt) {
        self.nextStep();
        return false;
      });

      holder.appendChild(buttonsPanel);
    }, //insertContent

    updateStepProgressPanel: function () {
      OpenLayers.Element.removeClass(this.stepProgressPanel, 'earea-active');
      OpenLayers.Element.removeClass(this.stepProgressPanel, 'format-active');
      OpenLayers.Element.addClass(this.stepProgressPanel, this.activeStep + '-active');

      if (typeof(this.tracking) == 'function') {
        this.tracking({
          'step'   : this.activeStep,
          'module' : this,
          'clicked': this.clicked
        });
      }
    }, //updateStepProgressPanel

    nextStep: function () {
      var removeCurrent,
        drawNext,
        validate,
        next;

      switch (this.activeStep) {
        case 'earea':
          next = 'format';
          break;
        case 'format':
          next = null;
          break;
        default:
          break;
      }

      this.clicked = 'next';
      removeCurrent = this.steps[this.activeStep].remove;

      if (next) {
        validate = this.steps[this.activeStep].validate;
        if (!validate || (validate && validate.apply(this))) {
          removeCurrent.apply(this);
          drawNext = this.steps[next].draw;
          drawNext.apply(this);
          this.activeStep = next;
          this.updateStepProgressPanel();
        }
      } else {
        // clicked next at last step
        removeCurrent.apply(this);
        this.hideControls();
        if (typeof(this.tracking) == 'function') {
          this.tracking({
            'step'   : 'end',
            'module' : this,
            'clicked': this.clicked
          });
        }
      }
    }, //nextStep

    previousStep: function () {
      var removeCurrent,
        drawPrevious,
        previous;

      switch (this.activeStep) {
        case 'earea':
          previous = null;
          break;
        case 'format':
          previous = 'earea';
          break;
        default:
          break;
      }

      this.clicked = 'previous';
      removeCurrent = this.steps[this.activeStep].remove;
      removeCurrent.apply(this);

      if (previous) {
        drawPrevious = this.steps[previous].draw;
        drawPrevious.apply(this);
        this.activeStep = previous;
      }
      this.updateStepProgressPanel();
    }, //previousStep

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
      earea : {
        draw    : function () {
          this.backButton.style['visibility'] = 'visible';
          this.nextButton.innerHTML = OpenLayers.Lang.translate('Next');
          if (this.div && OpenLayers.Element.hasClass(this.div, 'active')) {
            this.enableMaskControls();
          }

          var panel = this.stepSpecificPanel,
            elements = this.stepSpecificElements;

          OpenLayers.Element.addClass(panel, 'earea');

          elements.heading = document.createElement('h2');
          elements.heading.setAttribute('class', 'h');
          elements.heading.innerHTML = OpenLayers.Lang.translate('Choose area');
          panel.appendChild(elements.heading);

          elements.modeOptionsContainer = document.createElement('div');
          elements.modeOptionsContainer.setAttribute('class', 'mode-options-container');
          elements.instructions = document.createElement('p');
          elements.instructions.setAttribute('class', 'draw-instructions');
          elements.instructions.innerHTML = OpenLayers.Lang.translate('Hold down left mouse button and drag the desired area on the map.');
          elements.modeOptionsContainer.appendChild(elements.instructions);

          panel.appendChild(elements.modeOptionsContainer);

          this.printFrame();
        },
        validate: function () {
          //var d = this.data;
          //return d.width && d.height && d.centerX && d.centerY;
          return true;
        },
        remove  : function () {
          OpenLayers.Element.removeClass(this.stepSpecificPanel, 'earea');
          this.removeStepSpecificElements();
        }
      }, //earea
      format: {
        draw    : function () {
          this.nextButton.innerHTML = OpenLayers.Lang.translate('Print');
          var panel = this.stepSpecificPanel,
            elements = this.stepSpecificElements;

          var pts = map.getLayersByName('Print')[0].features[0].geometry;
          elements.areaSelectedBounds = new OpenLayers.Geometry.LinearRing(pts);
          elements.areaSelectedBounds.bounds = map.getLayersByName('Print')[0].features[0].geometry.getBounds();

          OpenLayers.Element.addClass(panel, 'format');

          elements.recommendation = document.createElement('p');
          elements.recommendation.setAttribute('class', 'recommendation');
          elements.recommendation.innerHTML = OpenLayers.Lang.translate('Gj&oslash;r noen valg.');
          panel.appendChild(elements.recommendation);

          var table = document.createElement('table');
          panel.appendChild(table);

          elements.legend = document.createElement('tr');
          elements.legend.innerHTML = '<td></td><label for="legendAccept"><input type="checkbox" id="legendAccept" value="legendAccepted">Legg til tegnforklaring</label></td>';
          table.appendChild(elements.legend);

          elements.annet = document.createElement('tr');
          elements.annet.innerHTML = '<td></td><label for="ownheader">Velg titel</label><input type="text" id="ownheader" value="turkart"/></td>';
          table.appendChild(elements.annet);

          elements.link = document.createElement('tr');
          table.appendChild(elements.link);

          function updateLink() {
            var bbox = map.getLayersByName('Print')[0].features[0].geometry.getBounds().toBBOX();
            var format = encodeURIComponent(elements.format || "image/png");
            var layerName = NK.functions.addedLayers() || 'toporaster';
            var layer = map.getLayersBy('shortid', layerName)[0];
            var BASE_URL = "http://openwms.statkart.no/skwms1/wms." + layer.layer;
            var linkCode, WMS_URL;
            var a4scale, size, width, height;

            size = map.getLayersByName('Print')[0].features[0].geometry.getBounds().getSize();
            a4scale = Math.min(2640 / Math.max(size.w, size.h), 2480 / Math.min(size.w, size.h));
            width = size.w * a4scale;
            height = size.h * a4scale;

            if (layer.version == '1.1.1') {
              WMS_URL = BASE_URL + "?service=WMS&request=GetMap&SRS=" + map.projection.projCode + "&FORMAT=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS=" + layerName + "&VERSION=1.1.1&WIDTH=" + width + "&HEIGHT=" + height + "&BBOX=" + bbox;
            } else {
              WMS_URL = BASE_URL + "?service=WMS&request=GetMap&CRS=" + map.projection.projCode + "&FORMAT=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS=" + layerName + "&VERSION=1.3.0&WIDTH=" + width + "&HEIGHT=" + height + "&BBOX=" + bbox;
            }
            linkCode = "<td colspan=2><a target='_blank' style='color:#fff' href='" + WMS_URL + "'><br/>" + OpenLayers.Lang.translate("(Test) wms dataset") + "</a></td>";
            elements.link.innerHTML = linkCode;
          }

          this.updateSelectedArea();
          updateLink();

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

          if (elements.areaSelectedBounds) {
            this.sendPrint(elements.areaSelectedBounds.bounds);
          }

          OpenLayers.Element.removeClass(panel, 'format');

          delete elements.layer;
          delete elements.format;
          this.removeStepSpecificElements();
        }
      } //format
    }, //steps

    enableMaskControls: function () {
      $('.embedLight.adjust').css('visibility', 'visible');
      if (this.maskLayer) {
        this.maskLayer.setVisibility(false);
      }
    }, //enableMaskControls

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

    getURL: function () {
      var hash,
        url,
        i, j, m, x, y, hashLayers, extraPath,
        markers = this.data.markers;

      // Include selected map layer
      hashLayers = window.location.hash.toString().split('/');
      hashLayers.splice(0, 3);
      hashLayers = hashLayers.join('/');

      x = this.data.centerX.toString().split('.')[0];
      y = this.data.centerY.toString().split('.')[0];

      hash = '#' + this.map.zoom + '/' + x + '/' + y + '/' + hashLayers + '+embed.box';

      if (markers && markers.length) {
        for (i = 0, j = markers.length; i < j; i += 1) {
          m = markers[i];
          hash += '/m/' + m.x + '/' + m.y + '/' + encodeURIComponent(m.label);
        }
      }

      switch (this.data.type) {
        case 'STATIC':
          extraPath = 'statisk.html';
          break;
        case 'DYNAMIC':
          if (this.data.includeTools) {
            extraPath = 'dynamisk-med-navigasjon.html';
          } else {
            extraPath = 'dynamisk.html';
          }
          break;
        default:
          extraPath = '';
      }

      url = window.location.protocol + '//' + window.location.host + window.location.pathname + extraPath + hash;

      return url;
    }, //getURL

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

      this.activeStep = 'earea';
      this.steps[this.activeStep].draw.apply(this);
      this.updateStepProgressPanel();
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
    
    updateSelectedArea: function () {
      "use strict";
      var newSize = {};
      newSize.w = map.getExtent().getSize().h / 2;
      newSize.h = newSize.w * 1.064;  // for 9 sider: 1.41;
      var box2 = map.getExtent().scale(0.5);
      box2.top = box2.bottom + newSize.h;
      box2.right = box2.left + newSize.w;

      this.maskLayer.removeAllFeatures();
      var feature = new OpenLayers.Feature.Vector(box2.toGeometry());
      this.maskLayer.addFeatures(feature);
    }, //updateSelectedArea

    printFrame: function () {
      if (this.maskLayer) {
        map.removeLayer(this.maskLayer);
      }
      this.maskLayer = new OpenLayers.Layer.Vector("Print", {isFixed: true});

      var newSize = {};
      newSize.w = map.getExtent().getSize().h / 2;
      newSize.h = newSize.w * 1.064;  // for 9 sider: 1.41;
      var box2 = map.getExtent().scale(0.5);
      box2.top = box2.bottom + newSize.h;
      box2.right = box2.left + newSize.w;

      var rows = 3;
      var cols = 4;
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
      var feature = new OpenLayers.Feature.Vector(multuPolygonGeometry);
      var origin = new OpenLayers.Geometry.Point(box2.left, box2.bottom);
      //feature.geometry.rotate(6, origin);
      this.maskLayer.addFeatures(feature);
      var last_epsg;
      map.events.register("move", map, function() {
        var testLonLat = box2.getCenterLonLat();
        var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat);
        epsg = +epsg.substring(0,2);
        var sones = epsg -33;
        if (last_epsg != epsg){
          feature.geometry.rotate(sones*6, origin);
          feature.layer.drawFeature(feature);
        }
        last_epsg = epsg;
      });
      map.addLayers([this.maskLayer]);
      this.maskLayer.setZIndex(2000);
    }, // printFrame

    sendPrint: function (geometry) {
      var textMessage = "Utskrift blir bygget...";
      var popupSize = new OpenLayers.Size(400, 100);
      var popup = new OpenLayers.Popup.FramedSideAnchored(
        "nk-selected-coverage-map",
        map.getCenter(),
        popupSize,
        textMessage,
        null,
        true,
        null,
        null,
        'print-message-popup'
      );
      popup.autoSize = false;
      map.addPopup(popup);

      var layerName = NK.functions.addedLayers() || 'toporaster';
      var printConfig = [];
      printConfig['toporaster'] = 'toporaster';
      printConfig['sjo'] = 'all';
      var layer = map.getLayersBy('shortid', layerName)[0];
      var host = 'http://dcriap016:8380';
      //var url = host + '/print/print/test/report.pdf';
      var url = 'http://localhost/ws/getPrint.py';
      var startTime = new Date().getTime();
      var legend = document.getElementById("legendAccept").checked;
      var titel = document.getElementById("ownheader").value;

      var testLonLat = geometry.getCenterLonLat();
      var lonLat = new OpenLayers.LonLat(testLonLat.lon, testLonLat.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
      var epsg = OpenLayers.Projection.getUTMZone(lonLat.lon, lonLat.lat);

      var params = {
        attributes: {
          map: {
            bbox        : geometry.toArray(),
            dpi         : '300',
            layers      : [{
              "baseURL"       : "http://openwms.statkart.no/skwms1/wms." + layer.layer,
              "customParams": {"TRANSPARENT": "true"},
              "imageFormat" : layer.format, //"image/png; mode:24bit"
              "layers"      : [printConfig[layerName]],
              "opacity"     : 1,
              "serverType"  : "mapserver",
              "type"        : "WMS"
            }],
            "projection": epsg,
            "rotation"  : 1,
            "scale"     : 258000
          }
        },
        "legend"    : legend,
        "titel"     : titel,
        "layout"    : 'A4 landscape'
      };
      var setMessage = function (message) {
        var textMessage = document.getElementById('nk-selected-coverage-map_contentDiv');
        textMessage.textContent = message;
      };
      var updateWaitingMsg = function (startTime, data) {
        var elapsed = Math.floor((new Date().getTime() - startTime) / 100);
        var time = '';
        if (elapsed > 5) {
          time = (elapsed / 10) + " sec";
        }
        setMessage('Waiting for report ' + time + ": " + data.ref);
      };
      var downloadWhenReady = function (startTime, data) {
        if ((new Date().getTime() - startTime) > 30000) {
          setMessage('Gave up waiting after 30 seconds');
        } else {
          updateWaitingMsg(startTime, data);
          setTimeout(function () {
            var downloadReadyPostRequest = new XMLHttpRequest();
            downloadReadyPostRequest.open("GET", data.statusURL, true);
            downloadReadyPostRequest.overrideMimeType('application/json');
            downloadReadyPostRequest.onreadystatechange = function () {
              if (downloadReadyPostRequest.readyState != 4 || downloadReadyPostRequest.status != 200) {
                setMessage('Error creating report: ' + downloadReadyPostRequest.statusText);
              } else {
                var download = JSON.parse(downloadReadyPostRequest.response);
                if (download.done) {
                  if (download.error) {
                    setMessage(download.error);
                    return download.error;
                  }
                  window.location = host + download.downloadURL;
                  setMessage('Downloading: ' + host + download.downloadURL);
                } else {
                  downloadWhenReady(startTime, data);
                }
              }
            };
            downloadReadyPostRequest.send(JSON.stringify(data));
          }, 500);
        }
      };
      params = JSON.stringify(params);
      /*
      $.ajax({
        type       : 'POST',
        crossDomain: true,
        url        : url,
        data       : params,
        dataType   : 'JSON',
        success    : function (response) {
          "use strict";
          var data = [];
          data['downloadURL'] = host + response['downloadURL'];
          data['statusURL'] = host + response['statusURL'];
          downloadWhenReady(startTime, data);
        },
        error      : function (xhr, status) {
          alert("error");
        }
      });
      */
    }, // sendPrint

    CLASS_NAME: "OpenLayers.Control.Print"
  }); // OpenLayers.Control.Print