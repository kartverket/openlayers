 /**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Button.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.EmergencyPoster = OpenLayers.Class(OpenLayers.Control.Panel, {

  serviceURL: 'http://openwps.statkart.no/skwms1/wps.elevation',
  ssrwsURL: 'https://ws.geonorge.no/SKWS3Index/ssr/sok?',
  pdfServiceUrl: 'http://ws.geonorge.no/ngnk2/ngnk?',
  matrikkelInfoURL: 'http://www.norgeskart.no/ws/emergencyPoster.py',
  pointMenu: null,
  title: null,
  pointSelector: null,
  pointData: null,
  altPoints: [],
  matrikkelInfo: null,
  altPointList: null,
  button: null,
  coordinates: null,
  termsAccepted: false,
  toggeledOn: false,
  markerLayer: null,
  popupWidget: null,
  termsAcceptButton: null,
  locationWidth: null,
  locationName: '',
  locationNameInput: null,
  locationRedoButton: null,
  locationAcceptButton: null,
  streetNameAccept: null,
  previewLightbox: null,
  previewWidget: null,
  previewOverlay: null,
  previewCloseBtn: null,
  pointSelectInstructionWidget: null,
  main: null,
  bounds: null,
  posterContent: null,

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
            'Location is: ': 'Stedet er: ',
            'Choose a different location nearby': 'Velg et annet stedsnavn i nærheten',
            'The Emergency poster is developed in cooperation with the Joint Rescue Coordination Centres and the emergency services. The Norwegian Mapping Authority is responsible for the data layer; meaning names of locations and mapping - as well as the underlying technology.' : 'Nødplakaten er utviklet i samarbeid med Hovedredningsentralene og nødetatene. Kartverket er ansvarlig for datagrunnlaget, dvs. stedsnavn og kart - samt teknologien bak.',
            'It\'s the user\'s responsibility to ensure that the location displayed on the poster is correct.' : 'Det er brukerens ansvar å kontrollere at det er korrekt hytte eller sted som vises på plakaten.',
            'The Norwegian Mapping Authority is not responsible for possible errors caused by the user, data layer or technology.': 'Kartverket tar ikke ansvar for mulige feil som skyldes brukeren, datagrunnlaget eller teknologien.',
            'New location': 'Velg nytt sted',
            'Accept and prepare print' : 'Godkjenn og klargjør utskrift',
            'Accept and proceed' : 'Jeg godtar og går videre',
            'Download PDF' : 'Lagre PDF',
            'Open PDF' : 'Åpne PDF',
            'Doctor' : 'Lege',
            'Police' : 'Politi',
            'Fire' : 'Brann',
            'While speaking to the emergency services, say the following:' : 'Fortell hva det gjelder og si følgende:',
            'My location is' : 'Mitt sted er:',
            'My position is' : 'Min posisjon er:',
            'My street is' : 'Min vegadresse er:',
            'My matrikel is' : 'Min matrikkeladresse er:',
            'My UTM location' : 'Min UTM-posisjon:',
            'in' : 'i',
            'degrees' : 'grader',
            'minutes' : 'minutter',
            'seconds' : 'sekunder',
            'decimal degrees' : 'desimalgrader',
            'decimal minutes' : 'desimalminutter',
            'north' : 'nord',
            'south' : 'sør',
            'east' : 'øst',
            'west' : 'vest',
            'N' : 'N',
            'S' : 'S',
            'E' : 'Ø',
            'W' : 'V',
            'Unknown' : 'Ukjent',
            'municipality' : 'kommune',
            'No alternative places found nearby (2 km)' : 'Ingen andre stedsnavn ble funnet i nærheten (2 km)'
        });
        this.title = OpenLayers.Lang.translate('Emergency poster');
    },

    setMap: function(map) {
        var ps;
        this.map = map;
        ps = new OpenLayers.Control.EmergencyPointSelector();
        this.map.addControls([ps]);
        this.pointSelector = ps;

        if (this.handler) {
            this.handler.setMap(map);
        }
        this.map.events.on();
    },

    draw: function() {
        var btn,
            that = this,
            panel,
            toolElement;

        OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);

        btn = OpenLayers.Util.createButton(
                    'OpenLayers_Control_EmergencyPoster_' + this.map.id,
                    null,
                    null,
                    null, 'static');

        btn.title = this.title;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="emergency-poster icon"><circle cx="32" cy="32" r="30" fill="#ec0303" /><path fill-rule="evenodd" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z M 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg>');
        OpenLayers.Element.addClass(btn, 'emergency-poster-button');

        if (this.div === null) {
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
        this.main.setAttribute('id', 'emergencyMainMenu');
        this.main.innerHTML = '<div class="arrow"></div>';
        document.body.appendChild(this.main);

        OpenLayers.Event.observe(btn, 'click',
            //OpenLayers.Function.bind(this.toggleSelectZoom, this)
            function() {
                if (that.toggeledOn) {
                    that.toggeledOn = false;
                    that.hideControls();
                } else {
                    that.toggeledOn = true;
                    that.showControls();
                }
            }
        );
        OpenLayers.Util.appendToggleToolClick({'self': this});
        this.button = btn;
        this.map.events.register('move', this, this.moveEmergencyMainMenu);

        return btn;
    },

    /*
    toggleWidget: function () {
        OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleGetURL
    */

    showControls: function() {
        OpenLayers.Util.renderToggleToolClick({'self':this}, true);
        this.setup();
        this.selectPointActivate();
        this.step1start();
    },

    hideControls: function(skipToggle) {
        if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': this}, false);
        //if ( OpenLayers.Element.hasClass( this.div, 'active' ) ) {
        this.reset();
        this.selectPointDeactivate();
        //}
    }, //hideControls

    addMarkerLayer: function() {
        var emergencyMarkerStyles = new OpenLayers.StyleMap({
            'default': new OpenLayers.Style({
                pointRadius: 11.5, // sized according to type attribute
                fillColor: '#ffcc66',
                strokeColor: '#ff9933',
                strokeWidth: 2,
                graphicZIndex: 1,
                externalGraphic: 'theme/norgeskart/img/emergency-marker.png',
                graphicWidth: 47,
                graphicHeight: 54,
                graphicYOffset: -44, // 50
                graphicXOffset: -9 // 18

            }),
            'select': new OpenLayers.Style({
                fillColor: '#66ccff',
                strokeColor: '#3399ff',
                graphicZIndex: 2
            })
        });
        var layers = this.map.getLayersByName('emergencyPositionLayer');
        if (layers && layers.length > 0) {
            this.markerLayer = layers[0];
        } else {
            this.markerLayer = new OpenLayers.Layer.Vector('emergencyPositionLayer', {
                shortid: 'emergencyPositionLayer',
                styleMap: emergencyMarkerStyles
            });
            this.map.addLayer(this.markerLayer);
  	    }
    },
    removeMarkerLayer: function() {
    	if (this.markerLayer) {
    		this.markerLayer.removeAllFeatures();
	    	this.markerLayer.destroy();
	    	this.markerLayer = null;
    	}
    },
    addPositionMarker: function() {
    	var feature;
      var point;
      this.markerLayer.removeAllFeatures();
      point = new OpenLayers.Geometry.Point(this.coordinates.lon, this.coordinates.lat);
      feature = new OpenLayers.Feature.Vector(point, {}, null);
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
      var buttonPanel;
      var tmpText;
      var title;
      var lonLat;
      var dms;
      var dd;
      var self = this;/*, main = container || self.main;*/
            self.previewLightbox = document.createElement('div');
            self.previewWidget   = document.createElement('div');
            self.previewCloseBtn = document.createElement('a');
            self.previewCloseBtn.setAttribute('id', 'emergencyPointPreviewCloseBtn');
            self.previewCloseBtn.setAttribute('href', '#');
            self.previewCloseBtn.innerHTML = OpenLayers.Lang.translate('Close');

      dms = self.getDMSfromCoord();
      dd  = self.getDDfromDMS(dms);

      lonLat = new OpenLayers.LonLat(self.coordinates.lon, self.coordinates.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));

      OpenLayers.Element.addClass(self.previewLightbox, 'emergency-poster-preview-popup splashscreen show');
      OpenLayers.Element.addClass(self.previewWidget, 'widget');
      OpenLayers.Element.addClass(self.previewCloseBtn, 'close');

      title = (!self.pointData.stedsnavn || self.pointData.stedsnavn.length <= 1) ? OpenLayers.Lang.translate('Unknown') : self.pointData.stedsnavn;

      posterContent = {"locationName": "", "position1": "", "position2": "", "street": "", "place":"", "matrikkel":"", "utm":"","posDez":"", "map":"" };

      tmpText = '<div class="header">'+
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
                self.previewCloseBtn.outerHTML+
            '</div>'+
            '<div class="preview-container">'+
                '<div class="preview emergencyKV" id="emergencyPrint">'+
                    '<div class="header"><img src="theme/norgeskart/img/KV_nodplakat_header.png" alt="Nodplakat"><h3>kartverket.no</h3>';
                        if(!!self.locationName){
                          tmpText += '<h1> for '+self.locationName+'</h1>';
                          posterContent.locationName = self.locationName;
                        } else {
                          tmpText += '<h1></h1>';
                        }
                        tmpText += '</div>'+
                    '<img src="theme/norgeskart/img/KV_nodplakat_numbers.png" alt="Brannvesen: 110   Politi: 112   Ambulanse: 113"><p class="semi-header">'+
                        OpenLayers.Lang.translate('While speaking to the emergency services, say the following:')+
                    '</p>'+
                    '<div class="location-details-wrapper">'+
                        '<div class="location-details-header">'+
                            '<img src="theme/norgeskart/img/KV_nodplakat_1.png" alt="1."><p>' + OpenLayers.Lang.translate('My position is')+
                                '</br>'+
                                dms.lat.bits.deg+' '+OpenLayers.Lang.translate('degrees')+' '+dms.lat.bits.min+' '+OpenLayers.Lang.translate('minutes')+' '+dms.lat.bits.sec+' '+OpenLayers.Lang.translate('seconds')+' '+OpenLayers.Lang.translate('north') + ','+
                                '</br>'+
                                dms.lon.bits.deg+' '+OpenLayers.Lang.translate('degrees')+' '+dms.lon.bits.min+' '+OpenLayers.Lang.translate('minutes')+' '+dms.lon.bits.sec+' '+OpenLayers.Lang.translate('seconds')+' '+OpenLayers.Lang.translate('east')+
                            '</p>'+
                            '<img src="theme/norgeskart/img/KV_nodplakat_2.png" alt="2."><p>'+OpenLayers.Lang.translate('My street is');
                                posterContent.position1 = dms.lat.bits.deg+' '+OpenLayers.Lang.translate('degrees')+' '+dms.lat.bits.min+' '+OpenLayers.Lang.translate('minutes')+' '+dms.lat.bits.sec+' '+OpenLayers.Lang.translate('seconds')+' '+OpenLayers.Lang.translate('north') + ',';
                                posterContent.position2 = dms.lon.bits.deg+' '+OpenLayers.Lang.translate('degrees')+' '+dms.lon.bits.min+' '+OpenLayers.Lang.translate('minutes')+' '+dms.lon.bits.sec+' '+OpenLayers.Lang.translate('seconds')+' '+OpenLayers.Lang.translate('east');
                                if(!!self.matrikkelInfo && this.streetNameAccept === 1){
                                  if(!!self.matrikkelInfo.veg){
                                    tmpText += '</br>' + self.matrikkelInfo.veg + ' ' + OpenLayers.Lang.translate('in') + ' '  +  self.matrikkelInfo.kommune +  ' ' + OpenLayers.Lang.translate('municipality') + '</p>';
                                    posterContent.street = self.matrikkelInfo.veg + ' ' + OpenLayers.Lang.translate('in') + ' '  +  self.matrikkelInfo.kommune +  ' ' + OpenLayers.Lang.translate('municipality');
                                  } else {
                                    tmpText += '</br></p>';
                                  }
                                } else {
                                  tmpText += '</br></p>';
                                }
                                tmpText += '<img src="theme/norgeskart/img/KV_nodplakat_3.png" alt="3."><p>' +OpenLayers.Lang.translate('My location is') +
                                '</br>' + title +'</p>' +
                            '<img src="theme/norgeskart/img/KV_nodplakat_4.png" alt="4."><p>' + OpenLayers.Lang.translate('My matrikel is');
                                posterContent.place = title;
                                if(!!self.matrikkelInfo){
                                  tmpText += '</br>' + self.matrikkelInfo.matrikkelnr + ' i ' + self.matrikkelInfo.kommune;
                                  posterContent.matrikkel = self.matrikkelInfo.matrikkelnr + ' i ' + self.matrikkelInfo.kommune;
                                } else {
                                  tmpText += '</br>' + '</br>';
                                }
                                tmpText += '</p>';
                        var sone = "32V", localProj = "EPSG:32632";
                        var lat = lonLat.lat, lon = lonLat.lon;
                        if (lat > 72) {
                          if (lon < 21) {
                            sone = "33X"; localProj = "EPSG:32633";
                          } else {
                            sone = "35X"; localProj = "EPSG:32635";
                          }
                        } else if (lat > 64) {
                          if (lon < 6) {
                            sone = "31W"; localProj = "EPSG:32631";
                          } else if (lon < 12) {
                            sone = "32W"; localProj = "EPSG:32632";
                          } else if (lon < 18) {
                            sone = "33W"; localProj = "EPSG:32633";
                          } else if (lon < 24) {
                            sone = "34W"; localProj = "EPSG:32634";
                          } else if (lon < 30) {
                            sone = "35W"; localProj = "EPSG:32635";
                          } else {
                            sone = "36W"; localProj = "EPSG:32636";
                          }
                        } else {
                          if (lon < 3) {
                            sone = "31V"; localProj = "EPSG:32631";
                          } else if (lon >= 12) {
                            sone = "33V"; localProj = "EPSG:32633";
                          } 
                        }
                        var localCoo = new OpenLayers.LonLat(self.coordinates.lon, self.coordinates.lat).transform(self.map.getProjectionObject(), new OpenLayers.Projection(localProj));

                        tmpText += '</div>'+
                        '<div class="location-details-iframe-container" id="emergency_location">' +
                        '</div>'+
                          '<p>' + OpenLayers.Lang.translate('My UTM location') + ' Sone ' + sone + ' Ø ' + Math.round(localCoo.lon)+'&nbsp;N '+Math.round(localCoo.lat) +
                            '</br>' + 'Min posisjon i desimalgrader: N' + dd.lat +  ' - E' + dd.lon +
                          '</p>'+
                    '</div><img src="theme/norgeskart/img/KV_nodplakat_footer.png" alt="Kartverket">'+
                '</div>'+
            '</div>';
      posterContent.utm = sone + ' Ø ' + Math.round(localCoo.lon) + ' N ' + Math.round(localCoo.lat);
      posterContent.posDez = 'N' + dd.lat +  ' - Ø' + dd.lon ;

      self.previewWidget.innerHTML = tmpText;
      self.previewOverlay = document.createElement('div');
      OpenLayers.Element.addClass(self.previewOverlay, 'overlay');
      self.previewLightbox.appendChild(self.previewOverlay);

      OpenLayers.Event.observe( self.previewOverlay, 'click',
          OpenLayers.Function.bind( self.previewOverlayObserver, self )
      );

      buttonPanel = document.createElement('div');
      OpenLayers.Element.addClass(buttonPanel, "button-panel");

      self.previewPrintButton = document.createElement('button');
      OpenLayers.Element.addClass(self.previewPrintButton, 'print');
      self.previewPrintButton.innerHTML = OpenLayers.Lang.translate('Print');

      OpenLayers.Event.observe( self.previewPrintButton, 'click',
          OpenLayers.Function.bind( self.previewPrintButtonObserver, self )
      );

      buttonPanel.appendChild(self.previewPrintButton);

      self.previewWidget.appendChild(buttonPanel);
      self.previewLightbox.appendChild(self.previewWidget);

      document.body.appendChild(self.previewLightbox);
      document.getElementById('emergency_location').appendChild(this.getMapImage('573px','330px'));

      posterContent.map = document.getElementById('epimage').getAttribute('src');

      OpenLayers.Event.observe(document.getElementById('emergencyPointPreviewCloseBtn'), 'click',
          OpenLayers.Function.bind( self.previewCloseBtnObserver, self )
      );
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
        if (this.previewCloseBtn) {
            OpenLayers.Event.stopObservingElement(this.previewCloseBtn);
            this.previewCloseBtn = null;
        }
    },
    goToAdress: function() {
      var request,
        markers = [],
        feature,
        features = [],
        that = this,
        requestParams = encodeURIComponent(this.matrikkelInfo.veg + ',' + this.matrikkelInfo.kommune);

      var coor_from = new OpenLayers.Projection("EPSG:4326");
      var coor_to   = new OpenLayers.Projection(this.map.getProjection());
      $.support.cors = true;

      request = $.ajax({
        url: 'http://norgeskart.no/ws/adr.py',
        data: requestParams,
        dataType: 'JSON',
        crossDomain: true
      });

      request.done(function(data){
        $.each(data, function(){
          var coords = new OpenLayers.LonLat(parseFloat(this['LONGITUDE']), parseFloat(this['LATITUDE']));
          coords.transform(new OpenLayers.Projection("EPSG:32632"), new OpenLayers.Projection("EPSG:4326"));
          var place = {
            name: this['NAVN'],
            ssrid: this['ID'],
            type: this['OBJEKTTYPE'],
            municipality: this['KOMMUNENAVN'].charAt(0) + this['KOMMUNENAVN'].slice(1).toLowerCase(),
            county: this['FYLKESNAVN'].charAt(0) + this['FYLKESNAVN'].slice(1).toLowerCase(),
            north: coords.lat,
            east: coords.lon,
            lonlat: coords
          };
          if (place.name === that.matrikkelInfo.veg) {
            markers.push(place);
          }
        });
        for(i = 0, j = markers.length; i < j; i += 1) {
          point = new OpenLayers.Geometry.Point(markers[i].east, markers[i].north);
          point.transform(coor_from, coor_to);
          feature = new OpenLayers.Feature.Vector(point, markers[i], null);
          features.push(feature);
        }
        that.addMarkerLayer();
        if(!!features) {
          if (features.length > 0) {
            that.markerLayer.addFeatures(features);
            features[0].data.lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(that.map.getProjection()));
            that.map.setCenter(features[0].data.lonlat, 15);
            that.setCoordinates(features[0].data.lonlat);
            $('.iframe-container').html(that.getMapImage('352px','187px'));
          }
        }
      });

      request.fail(function(xhr, status, exc){
        //console.log('Request failed: ' + status + ', ' + exc);
      });
    },

    altPointListObserver: function(evt){
        var self = this;
        var altPointList = document.getElementById('emergencyPointAltLocationMenu');
        var newValue = altPointList.options[altPointList.selectedIndex].value;

        if (!newValue) return;
        var input = document.getElementById('emergencyPointNameInput');
        this.locationName = input.value || '';
        self.setPointData(newValue);
        self.removeLocationContent();
        self.getLocationContent(self.popupWidget);
    },

    streetsListObserver: function(evt){
      var streets = document.getElementById('streets');
      var newValue = streets.selectedIndex - 1;

      this.matrikkelInfo.veg = this.matrikkelInfo[newValue].veg;
      this.matrikkelInfo.kommune = this.matrikkelInfo[newValue].kommune;
      this.matrikkelInfo.matrikkelnr = this.matrikkelInfo[newValue].matrikkelnr;
      this.goToAdress();
    },

    getLocationContent: function (holder) {
        if (!holder) return;

        var self = this,
            container = document.createElement('div');

        var altPointListContainer = document.createElement('div');
            altPointListContainer.setAttribute('class', 'altPointListContainer');

        if (self.altPoints.length) {
            self.altPointList = document.createElement('select');
            self.altPointList.setAttribute('id', 'emergencyPointAltLocationMenu');
            self.altPointList.innerHTML = self.buildAltPointsList();
            altPointListContainer.appendChild(self.altPointList);
        } else {
            var label = document.createElement('span');
                label.innerHTML = OpenLayers.Lang.translate('No alternative places found nearby (2 km)');
            altPointListContainer.appendChild(label);
        }
        var streetAcceptContainer = document.createElement('div');
        streetAcceptContainer.setAttribute('class', 'altPointListContainer');

        var tmpNode = document.createTextNode(" * ");

        var streetAccept = document.createElement('select');
        streetAccept.setAttribute('id', 'emergencyPointStreetMenu');
        streetAccept.innerHTML = '<option selected disabled>Er dette riktig veg?</option><option value="yes">Ja</option><option value="no">Nei</option>';
        streetAcceptContainer.appendChild(streetAccept);
        streetAcceptContainer.appendChild(tmpNode);

        var tmpText;
        if(!!self.matrikkelInfo ){
          if (self.matrikkelInfo.length == 1){
            streetAcceptContainer.appendChild(streetAccept);
            streetAcceptContainer.appendChild(tmpNode);
            tmpText = '<h2>Funnet veg er: </h2>';
            tmpText += '<h3>' + self.matrikkelInfo[0].veg;
            if (self.matrikkelInfo[0].kommune) {
              tmpText += ' ' + OpenLayers.Lang.translate('in') + ' '  +  self.matrikkelInfo[0].kommune +  ' ' + OpenLayers.Lang.translate('municipality');
            }
            tmpText += '</h3>' + streetAcceptContainer.outerHTML;
          } else {
            tmpText = '<h2>Vegen er: </h2>';
            var streets = document.createElement('select');
            streets.setAttribute('id', 'streets');
            var html, i;
            html = '<option selected disabled">Velg riktig veg: </option>';
            for (i = 0; i < self.matrikkelInfo.length; i++) {
              if (self.matrikkelInfo[i].veg.length > 0) {
                html += '<option value="' + i + '">' + self.matrikkelInfo[i].veg + '</option>';
              } else {
                html += '<option value="' + i + '">' + self.matrikkelInfo[i].navn + '</option>';
              }
            }
            streets.innerHTML = html;
            streetAcceptContainer.appendChild(streets);
            streetAcceptContainer.appendChild(tmpNode);
            tmpText += '</h3>' + streetAcceptContainer.outerHTML;
          }
        } else {
          tmpText = '<h2>Ingen veg funnet.</h2>';
        }
        var title = (!self.pointData.stedsnavn || self.pointData.stedsnavn.length <= 1) ? OpenLayers.Lang.translate('Unknown') : self.pointData.stedsnavn;

        OpenLayers.Element.addClass(container, "contentContainer location");
        container.innerHTML =
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
                    '<input type="text" id="emergencyPointNameInput" value="' + self.locationName + '" aria-required="true"/>* ' +
                    '<span>('+OpenLayers.Lang.translate('E.g. the name of your cabin')+')</span>' +
                '</div>' +
                '<div class="emergency-point-location-wrapper">' +
                    '<h2>'+OpenLayers.Lang.translate('Location is')+'</h2>' +
                    '<h3>'+title+'</h3>' +
                    altPointListContainer.outerHTML+
                    tmpText +
              '<span> </span><span>( Felter markert med * er obligatoriske ! )</span></div>' +
            '</div>';

        var iframeContainer = document.createElement('div');
            iframeContainer.appendChild(self.getMapImage('352px','187px'));
        OpenLayers.Element.addClass(iframeContainer, 'iframe-container');

        container.appendChild(iframeContainer);

        var buttonPanel = document.createElement('div');
        OpenLayers.Element.addClass(buttonPanel, "button-panel");

        self.locationRedoButton = document.createElement('button');
        OpenLayers.Element.addClass(self.locationRedoButton, 'redo');
        self.locationRedoButton.innerHTML = OpenLayers.Lang.translate('New location');

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

        container.appendChild(buttonPanel);
        holder.appendChild(container);

        OpenLayers.Event.observe(document.getElementById('emergencyPointAltLocationMenu'), 'change',
          OpenLayers.Function.bind(self.altPointListObserver, self)
        );
        OpenLayers.Event.observe(document.getElementById('streets'), 'change',
          OpenLayers.Function.bind(self.streetsListObserver, self)
        );
    },

    removeLocationContent: function(){
        if (this.altPointList) {
            OpenLayers.Event.stopObservingElement(this.altPointList);
            this.altPointList = null;
        }
        if (this.locationRedoButton) {
            OpenLayers.Event.stopObservingElement(this.locationRedoButton);
            this.locationRedoButton = null;
        }
        if (this.locationAcceptButton) {
            OpenLayers.Event.stopObservingElement(this.locationAcceptButton);
            this.locationAcceptButton = null;
        }
        if (this.popupWidget) {
            this.popupWidget.innerHTML = '';
        }
    },

    getTermsContent: function (holder) {

        if (!holder) return;

        var self = this,
            container = document.createElement('div');

        OpenLayers.Element.addClass(container, "contentContainer terms");

        container.innerHTML =
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
        container.appendChild(buttonPanel);
        holder.appendChild(container);

        self.adjustWidgetPosition();
    },

    removeTermsContent: function(){
        if (this.termsAcceptButton) {
            OpenLayers.Event.stopObservingElement(this.termsAcceptButton);
            this.termsAcceptButton.parentNode.removeChild(this.termsAcceptButton);
            this.termsAcceptButton = null;
        }
        if (this.popupWidget) {
            this.popupWidget.innerHTML = '';
        }
    },

    drawPopup: function (container) {
        var self = this;
        if (container) {
            self.main = container;
        }
        self.popupWidget = document.createElement('div');
        OpenLayers.Element.addClass(self.popupWidget, "emergency-poster-popup loading");
        self.getTermsContent(self.popupWidget);
        self.main ? self.main.appendChild(self.popupWidget) :
          document.body.appendChild(self.popupWidget);
    },

    removePopup: function () {
        if (this.popupWidget) {
            this.popupWidget.parentNode.removeChild(this.popupWidget);
            this.popupWidget = null;
        }
    },

    setup: function () {
        this.addMarkerLayer();
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
        this.removeLocationContent();
        this.getLocationContent(this.popupWidget);
    },
    step3end: function(){
        this.removeLocationContent();
        this.removePopup();
    },
    step4start: function(){
        this.removePreviewPopup();
        this.drawPreviewPopup();
    },

    redraw: function () {

    },
    reset: function () {
        this.pointMenu = null;
        this.coordinates = null;
        this.termsAccepted = false;
        this.locationName = '';
        this.altPoints.length = 0;

        if (this.pointSelectInstructionWidget) {
        	this.removePointSelectInstruction();
        }
        if (this.pointSelector.active) {
        	this.selectPointDeactivate();
        }

        this.removeTermsContent();
        this.removeLocationContent();
        this.removePopup();
        this.removePreviewPopup();

        this.removeMarkerLayer();

        if (this.div) OpenLayers.Element.removeClass(this.div, 'active');
        if (this.main) OpenLayers.Element.removeClass(this.main, 'active');
    },

    previewPrintButtonObserver: function (evt) {
        this.previewPrintHandler();
    },

    previewSaveButtonObserver: function (evt) {
        this.previewSaveHandler();
    },

    previewOverlayObserver: function(evt){
        if (this.pointMenu) {
            this.pointMenu.toggleMenu(true);
            this.pointMenu.deleteModuleData();
        }
        this.reset();
    },

    previewCloseBtnObserver: function(evt){
        if (this.pointMenu) {
            this.pointMenu.toggleMenu(true);
            this.pointMenu.deleteModuleData();
        }
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
        this.pointData = null;
        this.altPoints.length = 0;
        this.getPointData();
        this.addPositionMarker();
        this.step1end();
    	this.step2start();
    },

    setCoordinates: function (lonLat) {
    	this.coordinates = lonLat;
    },

    /*
        Called from PointMenu
    */
    setCoordinatesFromPointMenu : function( center ) {
        if ( center ) this.coordinates = center;
        this.getPointData();
    },

    setLocationName: function(){
        var input = document.getElementById('emergencyPointNameInput');
        this.locationName = input.value || '';
        return this.locationName.length > 0;
    },
    setStreetName: function(){
      var input = document.getElementById('emergencyPointStreetMenu');
      var streetsSelect = document.getElementById('streets');
      if (!!input){
        this.streetNameAccept = input.options[input.selectedIndex].index;
        this.matrikkelInfo.veg = this.matrikkelInfo[0].veg;
        this.matrikkelInfo.kommune = this.matrikkelInfo[0].kommune;
        this.matrikkelInfo.matrikkelnr = this.matrikkelInfo[0].matrikkelnr;
      } else if(!!streetsSelect) {
        var streets = document.getElementById('streets');
        if (streets.selectedIndex > 0) {
          this.streetNameAccept = 1;
          var newValue = streets.selectedIndex - 1;
          this.matrikkelInfo.veg = this.matrikkelInfo[newValue].veg;
          this.matrikkelInfo.kommune = this.matrikkelInfo[newValue].kommune;
          this.matrikkelInfo.matrikkelnr = this.matrikkelInfo[newValue].matrikkelnr;
        }
      } else {
        this.streetNameAccept = 1;
        this.streetsListObserver();
      }
      return this.streetNameAccept > 0;
    },
    getMGRSfromCoords: function(){
          var lonLat = new OpenLayers.LonLat(this.coordinates.lon, this.coordinates.lat).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var source = new Proj4js.Proj('EPSG:4326');
        var dest = new Proj4js.Proj('MGRS');
        var p = new Proj4js.Point(lonLat.lat, lonLat.lon);
        Proj4js.transform(source, dest, p);
    },

    getMDfromDMS: function(dms){
        if (!dms) return;

        var latmd, lonmd;

        function makeMD(min, sec) {
            return Math.round((min + (sec / 60))*1000000) / 1000000;
        }

        latmd = makeMD(dms.lat.bits.min, dms.lat.bits.sec);
        lonmd = makeMD(dms.lon.bits.min, dms.lon.bits.sec);

        return {
            lat : dms.lat.bits.deg + '° ' + latmd + '\'',
            lon : dms.lon.bits.deg + '° ' + lonmd + '\''
        };
    },

    getDDfromDMS: function(dms){
        if (!dms || !this.coordinates) return;

        var latdd, londd,
            lonLat = new OpenLayers.LonLat(this.coordinates.lon, this.coordinates.lat).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));

        function makeDD(deg, min, sec) {
            return Math.round((deg + (min / 60) + (sec / 3600))*10000) / 10000;
        }

        latdd = makeDD(dms.lat.bits.deg, dms.lat.bits.min, dms.lat.bits.sec);
        if (lonLat.lat < 0) {
            latdd = -Math.abs(latdd);
        }

        londd = makeDD(dms.lon.bits.deg, dms.lon.bits.min, dms.lon.bits.sec);
        if (lonLat.lon < 0) {
            londd = -Math.abs(londd);
        }

        return {
            lat : latdd + '°',
            lon : londd + '°'
        };
    },

    getUTMzoneFromCoords: function() {
        if (!this.coordinates) return;
        var lonLat = new OpenLayers.LonLat(this.coordinates.lon, this.coordinates.lat).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));
        var zoneDir = (lonLat.lat > 0) ? OpenLayers.Lang.translate('N') : OpenLayers.Lang.translate('S');
    },

    getDMSfromCoord: function() {

        if (!this.coordinates) return;

        var lonLat = new OpenLayers.LonLat(this.coordinates.lon, this.coordinates.lat).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));

        var north = OpenLayers.Lang.translate('N');
        var south = OpenLayers.Lang.translate('S');
        var east  = OpenLayers.Lang.translate('E');
        var west  = OpenLayers.Lang.translate('W');

        function makeBits(coord){

            var degrees, minutes, seconds, mod;

            // Get degrees
            mod = coord % 1;
            degrees = ~~coord;

            // Get minutes
            coord = mod * 60;
            mod = coord % 1;
            minutes = ~~coord;

            // Get seconds
            coord = mod * 60;
            seconds = ~~coord;

            return {
                deg : degrees,
                min : minutes,
                sec : seconds
            };
        }

        return {
            lon : {
                bits : makeBits(Math.abs(lonLat.lon)),
                dir  : ((lonLat.lon > 0) ? east : west)
            },
            lat : {
                bits : makeBits(Math.abs(lonLat.lat)),
                dir : (lonLat.lat > 0) ? north : south
            }
        };
    },

    getPointData: function () {
        var self = this,
            serviceURL = self.serviceURL,
            ssrwsURL = self.ssrwsURL,
            rect,
            bounds,
            bb,
            lonLat,
            testLayer,
            epsgKode,
            pointRequest,
            boxRequest,
            pointDone = false,
            boxDone = false;

    /*
     Helper function to build a regular polygon with a given
     radius centered on a single point on the map.
     */
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
        lonLat = new OpenLayers.LonLat(this.coordinates.lon, this.coordinates.lat).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:4326'));

        // Make regular polygon with radius 1 mile
        rect   = makeSquare(lonLat.lon, lonLat.lat, 1.24);
        rect.style = {'display' : 'none'};

        // Add invisible polygon to map
        testLayer = new OpenLayers.Layer.Vector("testLayer");
        testLayer.addFeatures([rect]);
        self.map.addLayer(testLayer);

        // Retrieve polygon boundaries
        bounds = rect.geometry.bounds;
        bb = {
            lowerLeft  : new OpenLayers.LonLat(bounds.left, bounds.bottom).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:25833')),
            upperRight : new OpenLayers.LonLat(bounds.right, bounds.top).transform(this.map.getProjectionObject(), new OpenLayers.Projection('EPSG:25833'))
        };

        // Remove invisible polygon from map
        testLayer.removeAllFeatures();
        self.map.removeLayer(testLayer);

        // Get current projection code
        epsgKode = this.map.getProjectionObject().proj.srsProjNumber;

        // Build point request string
        pointRequest = 'request=Execute&service=WPS&version=1.0.0&identifier=elevation&datainputs=['
                        + 'lat='+lonLat.lat+';lon='+lonLat.lon + ';epsg=4326;]';

        // Build bounding box request string
        boxRequest = 'nordLL='+(~~bb.lowerLeft.lat)+'&ostLL='+(~~bb.lowerLeft.lon)+'&nordUR='+(~~bb.upperRight.lat)+'&ostUR='+(~~bb.upperRight.lon)+'&epsgKode='+epsgKode;   // EPSG:25833

        // First retrieve exact point data
        OpenLayers.Util.createAjaxRequest(function (result) {
          self.pointData = self.parsePointData(result);
          pointDone = true;
          if (boxDone) {
            self.setPointData(self.pointData['ssrid']['value']);
            OpenLayers.Element.removeClass(self.popupWidget, 'loading');
          }
        }, serviceURL, pointRequest, null, true);

        self.getMatrikkelInfo(lonLat.toString());

        $.support.cors = true;
        // Then retrieve locations from within bounding box
        $.ajax({
            url: ssrwsURL,
            type: 'GET',
            data: boxRequest,
            crossDomain: true,
            context: this,
            success: function(response, statusText){
                self.parseBoxData(response);
                boxDone = true;
                if (pointDone) {
                    self.setPointData(self.pointData['ssrid']['value']);
                    OpenLayers.Element.removeClass(self.popupWidget, 'loading');
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log('error: ' + textStatus + ' : ' + errorThrown);
            }
        });
    },

    buildAltPointsList: function(){
        var self = this, html, i;
        for (i = 0; i < self.altPoints.length; i++) {
            if (html) {
                html = html + '<option value="'+self.altPoints[i].ssrID+'">' + self.altPoints[i].stedsnavn + '</option>';
            } else {
                html = '<option selected disabled>'+OpenLayers.Lang.translate('Choose a different location nearby')+'</option>';
            }
        }
        return html;
    },

    parseBoxData: function(xml){
        var self = this, i, point, place;
        var places = xml.childNodes[0].childNodes;

        for (i = 2; i < places.length; i++) {
            place = places[i];
            point = {
                ssrID             : place.childNodes[0].childNodes[0].nodeValue,
                kommune           : place.childNodes[2].childNodes[0].nodeValue,
                fylke             : place.childNodes[3].childNodes[0].nodeValue,
                stedsnavn         : place.childNodes[4].childNodes[0].nodeValue,
                lon               : place.childNodes[5].childNodes[0].nodeValue,
                lat               : place.childNodes[6].childNodes[0].nodeValue,
                skriveMaateNavn   : place.childNodes[9].childNodes[0].nodeValue,
                epsgKode          : place.childNodes[10].childNodes[0].nodeValue
            };
            self.altPoints.push(point);
        }
    },

    setPointData: function (ssrid) {
        var self = this, i, loop;
        if (!ssrid && ssrid != -1) {
            // invalid ssrid
            return;
        }
        if (self.altPoints.length) {
            loop = self.altPoints.length;
            for (i = 0; i < loop; i++) {
                if (parseInt(ssrid) == parseInt(self.altPoints[i].ssrID)) {
                    //match = true;
                    self.pointData = self.altPoints[i];
                    loop = i;
                }
            }
        }
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
      if (this.pointMenu) {
          this.pointMenu.toggleMenu(true);
          this.pointMenu.deleteModuleData();
          this.reset();
      } else {
          this.reset();
          this.setup();
          this.selectPointActivate();
          this.step1start();
      }
    },

    locationAcceptHandler: function(evt){
        if (!this.setLocationName()){
            alert("Du må først angi et navn!");
            return false;
        }
        if(!!this.matrikkelInfo){
          if (!this.setStreetName()){
            alert("Du må først velge om det er riktig veg!");
            return false;
          }
        }
        this.step3end();
        this.step4start();
    },

    previewPrintHandler: function(){
      var epURL = "http://ws.geonorge.no/fop/fop?";
      epURL += 'locationName=' + escape(posterContent.locationName);
      epURL += '&position1=' + escape(posterContent.position1);
      epURL += '&position2=' + escape(posterContent.position2);
      epURL += '&street=' + escape(posterContent.street);
      epURL += '&place=' + escape(posterContent.place);
      epURL += '&matrikkel=' + escape(posterContent.matrikkel);
      epURL += '&utm=' + escape(posterContent.utm);
      epURL += '&posDez=' + escape(posterContent.posDez);
      epURL += '&map=' + encodeURIComponent(posterContent.map);

      var strWindowFeatures = ""; //"menubar=no,location=no,resizable=no,scrollbars=no,status=yes";
      var epWindow = window.open(epURL, 'Print', strWindowFeatures);

      //epWindow.document.close();
      epWindow.focus();
      setTimeout(function() {
        epWindow.print();
      }, 100);
    },

    previewSaveHandler: function(){
        var self = this,
            paramString,
            params = {
                SOSIKSYS : 23,
                Nord : null,
                Ost : null
            };

        if (self.pdfServiceUrl && self.coordinates) {
            params.Nord = Math.round(self.coordinates.lat);
            params.Ost = Math.round(self.coordinates.lon);
            paramString = $.param(params) + '&harlest=ja';
            window.open(self.pdfServiceUrl + paramString);
        }
    },

    getMatrikkelInfo : function (bbox) {
      $.support.cors = true;
      this.matrikkelInfo = null;
      // Then retrieve locations from within bounding box
      $.ajax({
        url: this.matrikkelInfoURL,
        type: 'GET',
        data: bbox,
        crossDomain: true,
        context: this,
        success: function(response, statusText){
            this.matrikkelInfo = response;
        },
        error: function(jqXHR, textStatus, errorThrown){
          console.log('error: ' + textStatus + ' : ' + errorThrown);
        }
      });
    },

    getServicURL : function () {
	   var self = this, url = self.serviceURL, c = self.coordinates;
	   return ! url || ! c ? '' :
	       [url,'Ost='+c.lon,'Nord='+c.lat,'harlest=ja'].join('&');
    },

    getMapImage : function (w, h) {
      var mult = (this.map.resolution * 100) / 2;

      var minx = (~~this.coordinates.lon) + (-10 * mult);
      var miny = (~~this.coordinates.lat) + (-5 * mult);
      var maxx = (~~this.coordinates.lon) + (10 * mult);
      var maxy = (~~this.coordinates.lat) + (5 * mult);
      var bbox = minx + "," + miny + "," + maxx + "," + maxy;

      var image = document.createElement('img');
      image.setAttribute('src', "http://openwms.statkart.no/skwms1/wms.topo2?service=WMS&request=GetMap&CRS=EPSG:32633&FORMAT=image%2Fjpeg&BGCOLOR=0xFFFFFF&TRANSPARENT=false&LAYERS=topo2_WMS&VERSION=1.3.0&WIDTH=1145&HEIGHT=660&BBOX=" + bbox);
      image.setAttribute('width', w);
      image.setAttribute('height', h);
      image.setAttribute('id', 'epimage');

      return image;
    },

    moveEmergencyMainMenu: function(e) {
        var self = this, main = self.main, center = self.coordinates;
        if (!center || !main || !OpenLayers.Element.hasClass(main, 'active')) return;

        var d = self.map.getPixelFromLonLat(center);
        var l = 'left:' + d['x'] + 'px;';
        var t = 'top:' + d['y'] + 'px;';

        main.setAttribute('style', l + t);
    },

    adjustWidgetPosition: function(){
        var self = this, main = self.main, center = self.coordinates;

        if ( center && main) {
            OpenLayers.Element.addClass(main, 'active');
            self.map.setCenter( center );
            var h = 675 /*550*/, s = OpenLayers.Util.getWindowSize(),  w = [
                    parseInt( OpenLayers.Util.getStyle(main,'width')  ) || 0,
                    parseInt( OpenLayers.Util.getStyle(main,'height') ) || 0
                ];

            w[2] = w[0]/2;
            w[3] = w[1] /2;
            s[2] = s[0]/2;
            s[3] = s[1] /2;

            var t = h + w[3], m = s[3] - t, d = 10;
            if ( m <= 0 ) {
                if ( t+w[3]+d > s[1] ) m += (t+w[3] - s[1] - d);
                self.map.moveByPx( 0, m );
            }
        }
    },

    step2start: function () {
        var self = this;//, main = self.main, center = self.coordinates;
        /*
    	if ( center && main) {
    	    OpenLayers.Element.addClass(main, 'active');
    	    self.map.setCenter( center );
    	    var h = 675, s = OpenLayers.Util.getWindowSize(),  w = [
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
    	}*/

        self.adjustWidgetPosition();

        if (self.locationWidget) {
            self.removeLocationPopup();
        }

        self.removePopup();
        self.drawPopup();
    },

    step2end: function(){
        this.removeTermsContent();
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
            this.map.events.registerPriority('touchstart', this, this.redraw);

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
            this.map.events.unregister('touchstart', this, this.redraw);
            return true;
        } else {
            return false;
        }
    },

    CLASS_NAME: "OpenLayers.Control.EmergencyPointSelector"
});
