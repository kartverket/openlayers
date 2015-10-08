/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.Print =
  OpenLayers.Class(OpenLayers.Control, {

    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonPrint',
    title   : null,
    widget  : null,
    cnt     : null,

    initialize: function (options) {
      OpenLayers.Control.prototype.initialize.apply(this, [options]);

      this.type = OpenLayers.Control.TYPE_BUTTON;

      this.title = OpenLayers.Lang.translate('Print');
    }, // initialize

    draw: function () {
      var self = this, cName = 'btn nkButton';
      var mapped = 'OpenLayers_Control_Print' + self.map.id;
      var btn = OpenLayers.Util.createButton(mapped, null, null, null, 'static');

      OpenLayers.Event.observe(btn, 'click',
        OpenLayers.Function.bind(self.printPage, self)
      );

      btn.title = self.title;
      btn.className = btn.className === "" ? cName : btn.className + " " + cName;
      btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" preserveAspectRatio="xMinYMid meet" class="icon print"><path d="M17.617,2H6.383v3.299h11.234V2z M21.026,6.487H2.974C2.437,6.487,2,6.934,2,7.483v7.327h2.934v-4.448h14.133v4.448H22V7.483C22,6.934,21.564,6.487,21.026,6.487z M19.885,8.929c-0.43,0-0.779-0.356-0.779-0.796s0.35-0.797,0.779-0.797s0.778,0.357,0.778,0.797S20.314,8.929,19.885,8.929z M16.787,20.828h-4.701c-1.703,0-0.883-4.129-0.883-4.129s-3.937,0.979-3.987-0.867v-3.79H6.069v5.339l0.336,0.344L10.586,22h7.347v-9.958h-1.146V20.828z" /></svg>');

      if (self.div == null) {
        self.div = btn;
      } else {
        self.div.appendChild(btn);
      }

      self.cnt = document.createElement("div");
      OpenLayers.Element.addClass(self.cnt, "cnt");

      self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
      self.div.appendChild(self.widget);

      return self.div;
    }, // draw

    printFrame: function() {
      function makeSquare(center_lon, center_lat, radiusInMiles) {
        var radiusMiles = radiusInMiles;
        var arrConversion = [];
        arrConversion['degrees'] = ( 1 / (60 * 1.1508) );
        arrConversion['dd'] = arrConversion['degrees'];
        arrConversion['m'] = ( 1609.344);
        arrConversion['ft'] = ( 5280  );
        arrConversion['km'] = ( 1.609344 );
        arrConversion['mi'] = ( 1 );
        arrConversion['inches'] = ( 63360 );

        var mapUnits = this.map.getProjectionObject().proj.units;
        var radius = radiusMiles * arrConversion[mapUnits] * 1.41421356 /2;

        var center = new OpenLayers.Geometry.Point( center_lon, center_lat )
          .transform( new OpenLayers.Projection("EPSG:4326"), this.map.getProjectionObject() );

        var feature = new OpenLayers.Feature.Vector();
        feature.geometry = OpenLayers.Geometry.Polygon.createRegularPolygon(center, radius, 4, 0);

        return feature;
      }
      // Get point coordinates
      //var lonLat = new OpenLayers.LonLat(this.coordinates.lon, this.coordinates.lat).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));

      // Make regular polygon with radius 1 mile
      //var rect   = makeSquare(lonLat.lon, lonLat.lat, 1.24);
      "use strict";
      var self = this;
      var polygonLayer = new OpenLayers.Layer.Vector("Print");
      map.addLayers([polygonLayer]);
      var polygonControl = new OpenLayers.Control.DrawFeature(
        polygonLayer,
        OpenLayers.Handler.RegularPolygon,
        {handlerOptions: {sides: 4}}
      );
      polygonControl.events.register('featureadded', polygonControl, function(evt) {
        self.sendPrint(evt.feature.geometry);
      });
      map.addControl(polygonControl);

      function setOptions(options) {
        polygonControl.handler.setOptions(options);
      }
      function setSize(fraction) {
        var radius = fraction * map.getExtent().getHeight();
        polygonControl.handler.setOptions({
          radius: radius,
          angle: 0});
      }
      setSize(parseFloat(0.5))
      polygonControl.activate();
    },
    sendPrint: function(geometry) {
      var textMessage = geometry.bounds.toString();
      var popupSize = new OpenLayers.Size(400,100);
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
      var url = host + '/print/print/test/report.pdf';
      var startTime = new Date().getTime();

      var params = {
        attributes: {
          map: {
            //center      : this.map.getCenter().toShortString().split(",").map(Number),
            bbox        : geometry.bounds.toArray(),
            dpi         : '300',
            layers      : [{
              baseURL       : "http://openwms.statkart.no/skwms1/wms." + layer.layer,
              "customParams": {"TRANSPARENT": "true"},
              "imageFormat" : layer.format, //"image/png; mode:24bit"
              "layers"      : [printConfig[layerName]],
              "opacity"     : 1,
              "serverType"  : "mapserver",
              "type"        : "WMS"
            }],
            "projection": "EPSG:32633",
            "rotation"  : 1,
            "scale"     : 258000
          }
        },
        layout    : 'A4 landscape'
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
    },
    printPage: function () {
      this.printFrame();
      //this.sendPrint();
    },

    hideControls: function () {
      OpenLayers.Element.removeClass(this.div, 'active');
    }, //hideControls

    showControls: function () {
      var html = '<h1 class="h">' + OpenLayers.Lang.translate('Print') + '</h1>';
      this.cnt.innerHTML = html;
      OpenLayers.Element.addClass(this.div, 'active');
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable

    togglePrintPreview: function () {
      OpenLayers.Element.hasClass(this.div, 'active') ? this.hideControls() : this.showControls();
    }, // toggleGetURL

    toggleControls: function () {
    },//togglecontrols

    CLASS_NAME: "OpenLayers.Control.Print"
  }); // OpenLayers.Control.Print
