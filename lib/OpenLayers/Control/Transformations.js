/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.Transformations =
    OpenLayers.Class(OpenLayers.Control, {

    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonTransformations',
    title: null,
    widget: null,
    cnt: null,
    sosiCodes: null,
    inputForm: null,
    transformButton: null,
    serviceURL: null,
    gotoButton: null,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.type = OpenLayers.Control.TYPE_BUTTON;

        this.title = OpenLayers.Lang.translate('Transformations');
        this.sosiCodes = [
            {'ESRI': null, 'EPSG': 4326, 'SOSI': 84, 'name': 'EU89 - Geografisk, grader (Lat/Lon)', 'viewable': false}, //viewable, but not necessary in selectors
            {'ESRI': 25831, 'EPSG': 25831, 'SOSI': 21, 'name': 'EU89, UTM-sone 31', 'viewable': true},
            {'ESRI': 25832, 'EPSG': 25832, 'SOSI': 22, 'name': 'EU89, UTM-sone 32', 'viewable': true},
            {'ESRI': 25833, 'EPSG': 25833, 'SOSI': 23, 'name': 'EU89, UTM-sone 33', 'viewable': true},
            {'ESRI': 25834, 'EPSG': 25834, 'SOSI': 24, 'name': 'EU89, UTM-sone 34', 'viewable': true},
            {'ESRI': 25835, 'EPSG': 25835, 'SOSI': 25, 'name': 'EU89, UTM-sone 35', 'viewable': true},
            {'ESRI': 25836, 'EPSG': 25836, 'SOSI': 26, 'name': 'EU89, UTM-sone 36', 'viewable': true},
            {'ESRI': 27391, 'EPSG': 27391, 'SOSI': 1, 'name': 'NGO1948, Gauss-K. Akse 1', 'viewable': false},
            {'ESRI': 27392, 'EPSG': 27392, 'SOSI': 2, 'name': 'NGO1948, Gauss-K. Akse 2', 'viewable': false},
            {'ESRI': 27393, 'EPSG': 27393, 'SOSI': 3, 'name': 'NGO1948, Gauss-K. Akse 3', 'viewable': false},
            {'ESRI': 27394, 'EPSG': 27394, 'SOSI': 4, 'name': 'NGO1948, Gauss-K. Akse 4', 'viewable': false},
            {'ESRI': 27395, 'EPSG': 27395, 'SOSI': 5, 'name': 'NGO1948, Gauss-K. Akse 5', 'viewable': false},
            {'ESRI': 27396, 'EPSG': 27396, 'SOSI': 6, 'name': 'NGO1948, Gauss-K. Akse 6', 'viewable': false},
            {'ESRI': 27397, 'EPSG': 27397, 'SOSI': 7, 'name': 'NGO1948, Gauss-K. Akse 7', 'viewable': false},
            {'ESRI': 27398, 'EPSG': 27398, 'SOSI': 8, 'name': 'NGO1948, Gauss-K. Akse 8', 'viewable': false},
            {'ESRI': null, 'EPSG': null, 'SOSI': 50, 'name': 'ED50 - Geografisk, grader', 'viewable': false},
            {'ESRI': 23031, 'EPSG': 23031, 'SOSI': 31, 'name': 'ED50, UTM-sone 31', 'viewable': false},
            {'ESRI': 23032, 'EPSG': 23032, 'SOSI': 32, 'name': 'ED50, UTM-sone 32', 'viewable': false},
            {'ESRI': 23033, 'EPSG': 23033, 'SOSI': 33, 'name': 'ED50, UTM-sone 33', 'viewable': false},
            {'ESRI': 23034, 'EPSG': 23034, 'SOSI': 34, 'name': 'ED50, UTM-sone 34', 'viewable': false},
            {'ESRI': 23035, 'EPSG': 23035, 'SOSI': 35, 'name': 'ED50, UTM-sone 35', 'viewable': false},
            {'ESRI': 23036, 'EPSG': 23036, 'SOSI': 36, 'name': 'ED50, UTM-sone 36', 'viewable': false},
            {'ESRI': null, 'EPSG': null, 'SOSI': null, 'name': 'what3words', 'viewable': false, 'forward': true}
            //{'ESRI': null, 'EPSG': null, 'SOSI': null, 'name': 'Geohash', 'viewable': false, 'forward': true}
            //{'ESRI': null, 'EPSG': null, 'SOSI': 53, 'name': 'Møre-A'},
            //{'ESRI': null, 'EPSG': null, 'SOSI': 54, 'name': 'Møre-B'},
            //{'ESRI': null, 'EPSG': null, 'SOSI': 84, 'name': 'EU89, Geografisk, sekunder'}
            //{'ESRI': 4230, 'EPSG': 4230, 'SOSI': 4230, 'name': 'ED50 Geografisk, grader'},
            //{'ESRI': 4231, 'EPSG': null, 'SOSI': 4231, 'name': 'ED87 Geografisk, grader'},
            //{'ESRI': 4273, 'EPSG': 4273, 'SOSI': 4273, 'name': 'NGO1948 Geografisk, grader'},
            //{'ESRI': null, 'EPSG': 4322, 'SOSI': 4322, 'name': 'WGS72 Geografisk, grader'},
            //{'ESRI': 4326, 'EPSG': 4326, 'SOSI': 4326, 'name': 'EU89/WGS84 Geografisk, grader'}
        ];
        this.serviceURL = options.url || '/ws/trans.py';
    }, // initialize

    draw: function () {
        var self = this,
            cName = 'Transformations-button nkButton',
            mapped,
            btn,
            toolElement,
            panel;

	      mapped = 'OpenLayers_Control_Transformations' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click',
            OpenLayers.Function.bind(self.toggleWidget, self)
        );

        OpenLayers.Util.appendToggleToolClick({'self':self});

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve"> <g> <path fill="#FFFFFF" stroke="#5D5E5C" stroke-width="0.75" stroke-miterlimit="10" d="M8.3,17.5l-2.3-5.1l-2.3,5.1H0.4l4.1-7.8 L0.9,2.9h3.2l1.8,3.9l1.8-3.9h3.1L7.4,9.5l4,8H8.3z"/> </g> <g> <path fill="#FFFFFF" stroke="#5D5E5C" stroke-width="0.75" stroke-miterlimit="10" d="M15.5,11.5v6h-2.7v-6l-4-8.6h3.1l1.7,4 c0.3,0.8,0.5,1.3,0.7,1.9c0.2-0.4,0.4-1.1,0.7-1.8l1.7-4h3.1L15.5,11.5z"/> </g> </svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'transformations');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                self.div = toolElement;
            } else {
                self.div.appendChild(btn);
            }
        }

    	  self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1, true);
        self.div.appendChild( self.widget );

        return self.div;
    }, // draw

    hideControls: function (skipToggle) {
        if ( ! OpenLayers.Element.hasClass( this.div, 'active' ) ) return;

        OpenLayers.Event.stopObservingElement(this.transformButton);
    	OpenLayers.Element.removeClass( this.div, 'active' );
        this.transformButton = null;
        this.inputForm = null;
        this.map.events.unregister('click', this, this.setCoordinatesFromClick);
        this.map.events.unregister('touchstart', this, this.setCoordinatesFromClick);

        if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': this}, false);
    }, //hideControls

    showControls: function () {
    	OpenLayers.Util.renderToggleToolClick({'self': this}, true);

    	this.insertContent();

    	OpenLayers.Element.addClass(this.div, 'active');

        this.map.events.register('click', this, this.setCoordinatesFromClick);
        this.map.events.registerPriority('touchstart', this, this.setCoordinatesFromClick);
    }, // showControls

    inputCRSChanged : function (sel, isOutput) {
      this.setCoordinateCookie(sel, isOutput);
      if ((sel.value=="84") || (sel.value=="50")) {
        this.eastLabel.innerHTML = OpenLayers.Lang.translate('Longitude');
        this.northLabel.innerHTML = OpenLayers.Lang.translate('Latitude');
      } else {
        this.eastLabel.innerHTML = OpenLayers.Lang.translate('East coordinate');
        this.northLabel.innerHTML = OpenLayers.Lang.translate('North coordinate');
      }
    },

    setCoordinateCookie : function (sel, isOutput) {
      var proj = sel.value;
      if (!!isOutput) {
        $.localStorage.set('transformCRS',proj);
      } else {
        $.localStorage.set('inputCRS',proj);
      }
    },

    setCnt : function (cnt) {
    	this.cnt = cnt;
    },

    getCRSName: function(epsg) {
        var i,j;
        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];
            if (sosiCode['EPSG'] == epsg) return sosiCode['name'];
        }
        return null;
    },
    isViewable: function(epsg) {
        var i,j;
        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];
            if (sosiCode['EPSG'] == epsg) return sosiCode['viewable'];
        }
        return false;
    },
    getSOSIfromEPSG: function(epsg) {
        var i,j;
        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];
            if (sosiCode['EPSG'] == epsg) return sosiCode['SOSI'];
        }
        return null;
    },
    getEPSGfromSOSI: function(sosi) {
        var i,j;
        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];
            if (sosiCode['SOSI'] == sosi) return sosiCode['EPSG'];
        }
        return null;
    },

    generateCoordinateSystemsList: function (id, label, selectedValue, viewableOnly, fromOnly) {
        var sosiCode,
            select,
            option,
            i,
            j,
            elements = {};

        elements.label = document.createElement('label');
        elements.label.setAttribute('for', id);
        elements.label.innerHTML = label;

        elements.select = document.createElement('select');
        elements.select.setAttribute('id', id);
        elements.select.setAttribute('class', 'form-control');

        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];
            if ((!!viewableOnly) && (!sosiCode['viewable'])) continue;
            if ((!!fromOnly) && (sosiCode['forward'])) continue;

            option = document.createElement('option');
            option.setAttribute('value', sosiCode.SOSI || sosiCode.name);
            option.text = sosiCode.name;

            if (!!selectedValue && sosiCode.SOSI === selectedValue) {
                option.setAttribute('selected', 'selected');
            }
            elements.select.appendChild(option);
        }
        return elements;
    },

    insertContent: function (coordinate) {
        var button, button2,
            coordinates,
            that = this,
            inSystem,
            outSystem,
            fieldset,
            eastLabel, eastInput,
            northLabel, northInput, center;

        this.cnt.innerHTML = '<h3>' + OpenLayers.Lang.translate('Transform coordinates') + '</h3>';
        this.inputForm = document.createElement('form');

        var crsChoice = $.localStorage.get('inputCRS') || 23; // last selected coordinate system is preselected

        inSystem = this.generateCoordinateSystemsList('transformations-input-coordinate-system', OpenLayers.Lang.translate('Select input coordinate system'), crsChoice, null, true);
        inSystem.select.setAttribute('onchange', "map.getControlsByClass('OpenLayers.Control.Transformations')[0].inputCRSChanged(this, false)");

        this.inputForm.appendChild(inSystem.label);
        this.inputForm.appendChild(inSystem.select);

        fieldset = document.createElement('fieldset');
        fieldset.innerHTML = '<legend>' + OpenLayers.Lang.translate('Fill out the coordinate fields or click in the map') + '</legend>';

        eastLabel = document.createElement('label');
        this.eastLabel = eastLabel;
        eastLabel.setAttribute('for', 'transformations-east-coordinate');
        eastLabel.innerHTML = OpenLayers.Lang.translate('East coordinate');
        eastInput = document.createElement('input');
        eastInput.setAttribute('type', 'text');
        eastInput.setAttribute('id', 'transformations-east-coordinate');
        eastInput.setAttribute('class', 'form-control');

        northLabel = document.createElement('label');
        this.northLabel = northLabel;
        northLabel.setAttribute('for', 'transformations-north-coordinate');
        northLabel.innerHTML = OpenLayers.Lang.translate('North coordinate');
        northInput = document.createElement('input');
        northInput.setAttribute('type', 'text');
        northInput.setAttribute('id', 'transformations-north-coordinate');
        northInput.setAttribute('class', 'form-control');
        center = coordinate ||  this.map.getCenter();
        if (center) {
            eastInput.setAttribute('value', OpenLayers.Util.preciseRound(center.lon,3));
            northInput.setAttribute('value', OpenLayers.Util.preciseRound(center.lat,3));
        }

        fieldset.appendChild(eastLabel);
        fieldset.appendChild(eastInput);
        fieldset.appendChild(northLabel);
        fieldset.appendChild(northInput);

        this.inputForm.appendChild(fieldset);

        var crsChoice = $.localStorage.get('transformCRS') || 23; // last selected coordinate system is preselected

        outSystem = this.generateCoordinateSystemsList('transformations-output-coordinate-system', OpenLayers.Lang.translate('Select output coordinate system'), crsChoice);
        outSystem.select.setAttribute('onchange', "map.getControlsByClass('OpenLayers.Control.Transformations')[0].setCoordinateCookie(this, true)");

        this.inputForm.appendChild(outSystem.label);
        this.inputForm.appendChild(outSystem.select);

        this.buttonWrapper = document.createElement('div');
        this.buttonWrapper.setAttribute('class', 'buttonWrapper');

        button2 = document.createElement('button');
        button2.setAttribute('type', 'button');
        button2.setAttribute('id', 'transformations-goto-coordinate-system-submit-button');
        button2.setAttribute('class', 'btn btn-primary');
        button2.innerHTML = OpenLayers.Lang.translate('Go to coordinates');
        this.buttonWrapper.appendChild(button2);
        this.gotoButton = button2;

        button = document.createElement('button');
        button.setAttribute('type', 'submit');
        button.setAttribute('id', 'transformations-output-coordinate-system-submit-button');
        button.setAttribute('class', 'btn btn-primary');
        button.innerHTML = OpenLayers.Lang.translate('Show coordinates');
        this.buttonWrapper.appendChild(button);
        this.transformButton = button;

        this.inputForm.appendChild(this.buttonWrapper);
        this.cnt.appendChild(this.inputForm);

        OpenLayers.Event.observe(this.inputForm, 'submit',
            OpenLayers.Function.bind(that.transform, that)
        );

        OpenLayers.Event.observe(this.gotoButton, 'click',
            OpenLayers.Function.bind(that.gotoCoordinate, that)
        );
    },

    setCoordinatesFromClick: function (event) {
        var lonLat = this.map.getLonLatFromPixel(event.xy);
        $('#transformations-input-coordinate-system').find('option').prop('selected', false);
        $('#transformations-input-coordinate-system').find('option[value="23"]').prop('selected', true);
        $('#transformations-east-coordinate').val(OpenLayers.Util.preciseRound(lonLat.lon, 3));
        $('#transformations-north-coordinate').val(OpenLayers.Util.preciseRound(lonLat.lat, 3));
    },
    transformData: function (params, callback) {
        var request;

        if (params.resSosiKoordSys == 'what3words') {
          var url = '/ws/w3w.py';
          var point = new OpenLayers.LonLat(params.ost, params.nord).transform(new OpenLayers.Projection(map.getProjection()), new OpenLayers.Projection("EPSG:4326"));
          var lon = 
          request = $.ajax({
            url: url,
            data: point.lat+","+point.lon,
            dataType: 'JSON',
            context: this
          });
          request.done(callback);
          
        } else if (params.ost && params.nord && params.sosiKoordSys && params.resSosiKoordSys) {

            $.support.cors = true;

            request = $.ajax({
                url: this.serviceURL,
                data: params,
                dataType: 'json',
                crossDomain: true,
                context: this
            });

            request.done(callback);
        }
    },
    transformDirect: function(x, y, from, to, callback) {
      params = { 
        "ost":  x,
        "nord": y,
        "sosiKoordSys": from,
        "resSosiKoordSys": to
      };
      request = $.ajax({
        async: false, 
        url: this.serviceURL,
        data: params,
        dataType: 'json',
        crossDomain: true
      });
      request.done(callback);
    },
    standardOut: function (result, status, request) {
        var output = document.getElementById('transformations-output');
        if (output) {
            output.parentNode.removeChild(output);
        }
        output = document.createElement('div');
        output.setAttribute('id', 'transformations-output');
        this.cnt.appendChild(output);

        if (result.hasOwnProperty('errKode') && result.errKode !== 0) {
            var errorHeader = document.createElement('h3');
                errorHeader.setAttribute('class', 'h');
                errorHeader.innerHTML = OpenLayers.Lang.translate('An error occured');
            var errorMessage = document.createElement('p');
                errorMessage.setAttribute('class', 'error');
                errorMessage.innerHTML = result.errTekst;
            output.appendChild(errorHeader);
            output.appendChild(errorMessage);
        } else {
            var html = '<h3>' + OpenLayers.Lang.translate('Transformed coordinates') + '</h3>';
            if (!!result.words) {
              html = '<span class="output-label">' + OpenLayers.Lang.translate('what3words') + '</span>';
              html += '<span class="output-value">' + result.words.join(".") + '</span>';
            } else if ((result.sosiKoordSys == 84) || (result.sosiKoordSys == 50)) {
              html += '<span class="output-label">' + OpenLayers.Lang.translate('Longitude') + '</span>';
              html += '<span class="output-value">' + OpenLayers.Util.preciseRound(result.ost, 8) + '</span><br/>';
              var deg = Math.floor(result.ost); 
              var rest = (result.ost - deg) * 60;
              html += '<span class="output-value">' + deg + '&deg; ' + OpenLayers.Util.preciseRound(rest, 7) + '\'</span><br/>';
              var min = Math.floor(rest); 
              var sec = (rest - min) * 60;
              html += '<span class="output-value">' + deg + '&deg; ' + min + '\' ' + OpenLayers.Util.preciseRound(sec, 5) + '"</span><br/>';
            } else {
              html += '<span class="output-label">' + OpenLayers.Lang.translate('East coordinate') + '</span>';
              html += '<span class="output-value">' + OpenLayers.Util.preciseRound(result.ost, 3) + '</span>';
            }
            if (!!result.words) {
            } else if ((result.sosiKoordSys == 84) || (result.sosiKoordSys == 50)) {
              html += '<span class="output-label">' + OpenLayers.Lang.translate('Latitude') + '</span>';
              html += '<span class="output-value">' + OpenLayers.Util.preciseRound(result.nord, 8) + '</span><br/>';
              var deg = Math.floor(result.nord); 
              var rest = (result.nord - deg) * 60;
              html += '<span class="output-value">' + deg + '&deg; ' + OpenLayers.Util.preciseRound(rest, 7) + '\'</span><br/>';
              var min = Math.floor(rest); 
              var sec = (rest - min) * 60;
              html += '<span class="output-value">' + deg + '&deg; ' + min + '\' ' + OpenLayers.Util.preciseRound(sec, 5) + '"</span><br/>';
            } else {
              html += '<span class="output-label">' + OpenLayers.Lang.translate('North coordinate') + '</span>';
              html += '<span class="output-value">' + OpenLayers.Util.preciseRound(result.nord, 3) + '</span>';
            }
            output.innerHTML = html;
        }

        //OpenLayers.Element.addClass(this.inputForm, 'disabled');
        //$(this.inputForm).find('input, select').prop('disabled', true);
        this.map.events.unregister('click', this, this.setCoordinatesFromClick);
    },
    specialOut: function (result) {
        if (this.eastCoordinateOutputElement) {
            var html='';
            if (!!result.words) {
              html = result.words.join(".");
            } else if ((result.sosiKoordSys == 84) || (result.sosiKoordSys == 50)) {
              html += OpenLayers.Util.preciseRound(result.ost, 8);
              var deg = Math.floor(result.ost); 
              var rest = (result.ost - deg) * 60;
              html += '<br/>' + deg + '&deg; ' + OpenLayers.Util.preciseRound(rest, 7);
              var min = Math.floor(rest); 
              var sec = (rest - min) * 60;
              html += '<br/>' + deg + '&deg; ' + min + '\' ' + OpenLayers.Util.preciseRound(sec, 5);
            } else {
              html += OpenLayers.Util.preciseRound(result.ost, 3);
            }
            this.eastCoordinateOutputElement.innerHTML = html;
            var title = result.ost || '';
            this.eastCoordinateOutputElement.setAttribute('title', '');
        }
        if (this.northCoordinateOutputElement) {
            var html='';
            if (!!result.words) {
              html = '';
            } else if ((result.sosiKoordSys == 84) || (result.sosiKoordSys == 50)) {
              html += OpenLayers.Util.preciseRound(result.nord, 8);
              var deg = Math.floor(result.nord); 
              var rest = (result.nord - deg) * 60;
              html += '<br/>' + deg + '&deg; ' + OpenLayers.Util.preciseRound(rest, 7);
              var min = Math.floor(rest); 
              var sec = (rest - min) * 60;
              html += '<br/>' + deg + '&deg; ' + min + '\' ' + OpenLayers.Util.preciseRound(sec, 5);
            } else {
              html += OpenLayers.Util.preciseRound(result.nord, 3);
            }
            this.northCoordinateOutputElement.innerHTML = html;
            var title = result.nord || '';
            this.northCoordinateOutputElement.setAttribute('title', title);
        }
    },
    clearSpecialOut: function () {
        if (this.eastCoordinateOutputElement) {
            this.eastCoordinateOutputElement.innerHTML = '&nbsp;';
        }
        if (this.northCoordinateOutputElement) {
            this.northCoordinateOutputElement.innerHTML = '&nbsp;';
        }
    },
    setSpecialOutputElements: function (params) {
        if (params.east) {
            this.eastCoordinateOutputElement = params.east;
        }
        if (params.north) {
            this.northCoordinateOutputElement = params.north;
        }
    },
    transform: function (event, ignorDisabling ) {
        var east,
            north,
            inCoordinateSystem,
            outCoordinateSystem,
            request,
            requestParams = {},
            that = this;

        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;

        east = document.getElementById('transformations-east-coordinate').value.replace(',', '.');
        north = document.getElementById('transformations-north-coordinate').value.replace(',', '.');
        inCoordinateSystem = document.getElementById('transformations-input-coordinate-system').value;
        outCoordinateSystem = document.getElementById('transformations-output-coordinate-system').value;

        var parseFunction = map.getControlsByClass("OpenLayers.Control.Search")[0].parseInput;
        var parsedInput;
        if ((inCoordinateSystem == "84") || (inCoordinateSystem == "50")) {
          parsedInput   = parseFunction(north+", "+east); //hijacking the advanced parser from search function
        } else {
          parsedInput   = parseFunction(east+", "+north); 
        }

        requestParams.ost  = parsedInput.east  || parsedInput.x;
        requestParams.nord = parsedInput.north || parsedInput.y;

        requestParams.sosiKoordSys = inCoordinateSystem;
        requestParams.resSosiKoordSys = outCoordinateSystem;

        this.transformData(requestParams, this.standardOut);

        return false;
    },
    gotoCoordinate: function () {
        var requestParams = {},
        cmap = this.map, east, north;

        east = document.getElementById('transformations-east-coordinate').value;
        north = document.getElementById('transformations-north-coordinate').value;
        inCoordinateSystem = document.getElementById('transformations-input-coordinate-system').value;
        outCoordinateSystem = document.getElementById('transformations-output-coordinate-system').value;

        var parseFunction = map.getControlsByClass("OpenLayers.Control.Search")[0].parseInput;
        var parsedInput;
        if ((inCoordinateSystem == "84") || (inCoordinateSystem == "50")) {
          parsedInput   = parseFunction(north+", "+east); //hijacking the advanced parser from search function
        } else {
          parsedInput   = parseFunction(east+", "+north);
        }

        requestParams.ost  = parsedInput.east  || parsedInput.x;
        requestParams.nord = parsedInput.north || parsedInput.y;

        requestParams.sosiKoordSys = inCoordinateSystem;
        requestParams.resSosiKoordSys = '23';

        this.transformData(requestParams, function (result, status, request) {
            var output = document.getElementById('transformations-output');
            if (output) {
                output.parentNode.removeChild(output);
            }
            output = document.createElement('div');
            output.setAttribute('id', 'transformations-output');
            this.cnt.appendChild(output);

            if (result.hasOwnProperty('errKode') && result.errKode !== 0) {
                var errorHeader = document.createElement('h3');
                errorHeader.setAttribute('class', 'h');
                errorHeader.innerHTML = OpenLayers.Lang.translate('An error occured');
                var errorMessage = document.createElement('p');
                errorMessage.setAttribute('class', 'error');
                errorMessage.innerHTML = result.errTekst;
                output.appendChild(errorHeader);
                output.appendChild(errorMessage);
            } else {
                east = OpenLayers.Util.preciseRound(result.ost, 3);
                north = OpenLayers.Util.preciseRound(result.nord, 3);
            }

            var center = new OpenLayers.LonLat(east, north);

            var zoom, dzoom;
            dzoom = $(this).data("zoom");
            if (dzoom > cmap.getZoom()) {
                zoom = dzoom;
            } else {
                zoom = cmap.getZoom();
            }
            cmap.setCenter(center, zoom, true, true);
            var self = this, menu = null;
            self.menu = menu = new OpenLayers.Control.PointMenu({
                'parent': 'Search', 'url': self.coordinates, 'map': self.map,
                'tracking': function (data) {
                    if (!data) return;
                    var pm = data['module'], where = data['where'];
                    var attr = pm.attr, main = attr['main'], widget = attr['widget'];

                    if (where == 'pointMenuEndHandler') {
                        if (OpenLayers.Element.hasClass(main, 'onClose')) {
                            pm.hideControls();
                            self.menu = null;
                            return true;
                        }
                    }
                    return false;
                }
            });
            clearTimeout(self.timer || 0);
            self.timer = setTimeout(function () {
                menu.showControls(), menu.showPointMenu({}, false, center, true);
                OpenLayers.Element.removeClass(menu['attr']['button'], 'active');
                OpenLayers.Element.addClass(menu['attr']['button'], 'simulation');
            }, 50);
        });
    }, //goto
    enable: function () {
    }, // enable

    disable: function () {
    }, // disable

    toggleWidget: function () {
    	OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleGetURL

    toggleControls: function () {
    },//togglecontrols

    CLASS_NAME: "OpenLayers.Control.Transformations"
}); // OpenLayers.Control.Transformations
