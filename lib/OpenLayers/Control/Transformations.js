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
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Transformations': 'Transformasjoner',
            'Transform coordinates': 'Transformer koordinater',
            'Select input coordinate system': 'Fra koordinatsystem',
            'Select output coordinate system': 'Til koordinatsystem',
            'Fill out the coordinate fields or click in the map': 'Skriv inn koordinater eller klikk i kartet',
            'Help': 'Hjelp',
            'East coordinate': 'Øst-koordinat (lengdegrad)',
            'North coordinate': 'Nord-koordinat (breddegrad)',
            'Show coordinates': 'Transformer koordinater',
            'Transformed coordinates': 'Transformerte koordinater',
            'An error occured' : 'En feil oppstod',
            'Go to coordinates' : 'Gå til koordinater'
        });

        this.title = OpenLayers.Lang.translate('Transformations');
        this.sosiCodes = [
            {'ESRI': 27391, 'EPSG': 27391, 'SOSI': 1, 'name': 'NGO1948, Gauss-K. Akse 1'},
            {'ESRI': 27392, 'EPSG': 27392, 'SOSI': 2, 'name': 'NGO1948, Gauss-K. Akse 2'},
            {'ESRI': 27393, 'EPSG': 27393, 'SOSI': 3, 'name': 'NGO1948, Gauss-K. Akse 3'},
            {'ESRI': 27394, 'EPSG': 27394, 'SOSI': 4, 'name': 'NGO1948, Gauss-K. Akse 4'},
            {'ESRI': 27395, 'EPSG': 27395, 'SOSI': 5, 'name': 'NGO1948, Gauss-K. Akse 5'},
            {'ESRI': 27396, 'EPSG': 27396, 'SOSI': 6, 'name': 'NGO1948, Gauss-K. Akse 6'},
            {'ESRI': 27397, 'EPSG': 27397, 'SOSI': 7, 'name': 'NGO1948, Gauss-K. Akse 7'},
            {'ESRI': 27398, 'EPSG': 27398, 'SOSI': 8, 'name': 'NGO1948, Gauss-K. Akse 8'},
            {'ESRI': 32631, 'EPSG': 32631, 'SOSI': 21, 'name': 'EU89, UTM-sone 31'},
            {'ESRI': 32632, 'EPSG': 32632, 'SOSI': 22, 'name': 'EU89, UTM-sone 32'},
            {'ESRI': 32633, 'EPSG': 32633, 'SOSI': 23, 'name': 'EU89, UTM-sone 33'},
            {'ESRI': 32634, 'EPSG': 32634, 'SOSI': 24, 'name': 'EU89, UTM-sone 34'},
            {'ESRI': 32635, 'EPSG': 32635, 'SOSI': 25, 'name': 'EU89, UTM-sone 35'},
            {'ESRI': 32636, 'EPSG': 32636, 'SOSI': 26, 'name': 'EU89, UTM-sone 36'},
            {'ESRI': 23031, 'EPSG': 23031, 'SOSI': 31, 'name': 'ED50, UTM-sone 31'},
            {'ESRI': 23032, 'EPSG': 23032, 'SOSI': 32, 'name': 'ED50, UTM-sone 32'},
            {'ESRI': 23033, 'EPSG': 23033, 'SOSI': 33, 'name': 'ED50, UTM-sone 33'},
            {'ESRI': 23034, 'EPSG': 23034, 'SOSI': 34, 'name': 'ED50, UTM-sone 34'},
            {'ESRI': 23035, 'EPSG': 23035, 'SOSI': 35, 'name': 'ED50, UTM-sone 35'},
            {'ESRI': 23036, 'EPSG': 23036, 'SOSI': 36, 'name': 'ED50, UTM-sone 36'},
            {'ESRI': null, 'EPSG': null, 'SOSI': 50, 'name': 'ED50, Geografisk'},
            {'ESRI': null, 'EPSG': null, 'SOSI': 53, 'name': 'Møre-A'},
            {'ESRI': null, 'EPSG': null, 'SOSI': 54, 'name': 'Møre-B'},
            {'ESRI': null, 'EPSG': null, 'SOSI': 84, 'name': 'EU89/WGS84 Geografisk, grader'}
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
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" width="28px" height="26px" viewBox="0 0 28 26" preserveAspectRatio="xMidYMid meet" class="icon transformations"><path d="M19.678,13.156l7.323-6.078l-7.323-6.078v3.965H4.611v4.225h15.066V13.156z M8.323,12.844L1,18.922l7.323,6.077v-3.966h15.032v-4.225H8.323V12.844z"/></svg>');

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

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        self.div.appendChild( self.widget );

        return self.div;
    }, // draw

    hideControls: function (skipToggle) {
        if ( ! OpenLayers.Element.hasClass( this.div, 'active' ) ) return;

        OpenLayers.Event.stopObservingElement(this.transformButton);
    	OpenLayers.Element.removeClass( this.div, 'active' );
        this.transformButton = null;
        this.inputForm = null;

        if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': this}, false);
    }, //hideControls

    showControls: function () {
    	OpenLayers.Util.renderToggleToolClick({'self': this}, true);

    	this.insertContent();

    	OpenLayers.Element.addClass(this.div, 'active');

        this.map.events.register('click', this, this.setCoordinatesFromClick);
    }, // showControls


    setCnt : function (cnt) {
    	this.cnt = cnt;
    },

    generateCoordinateSystemsList: function (id, label, selectedValue) {
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

        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];

            option = document.createElement('option');
            option.setAttribute('value', sosiCode.SOSI);
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

        this.cnt.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Transform coordinates') + '</h1>';
        this.inputForm = document.createElement('form');

        inSystem = this.generateCoordinateSystemsList('transformations-input-coordinate-system', OpenLayers.Lang.translate('Select input coordinate system'), 23);
        this.inputForm.appendChild(inSystem.label);
        this.inputForm.appendChild(inSystem.select);

        fieldset = document.createElement('fieldset');
        fieldset.innerHTML = '<legend>' + OpenLayers.Lang.translate('Fill out the coordinate fields or click in the map') + '</legend>';

        eastLabel = document.createElement('label');
        eastLabel.setAttribute('for', 'transformations-east-coordinate');
        eastLabel.innerHTML = OpenLayers.Lang.translate('East coordinate');
        eastInput = document.createElement('input');
        eastInput.setAttribute('type', 'text');
        eastInput.setAttribute('id', 'transformations-east-coordinate');
        eastInput.setAttribute('required', 'required');
        eastInput.setAttribute('pattern', '^[ \t]*[0-9]+[.,]?[0-9]*[ \t]*$');

        northLabel = document.createElement('label');
        northLabel.setAttribute('for', 'transformations-north-coordinate');
        northLabel.innerHTML = OpenLayers.Lang.translate('North coordinate');
        northInput = document.createElement('input');
        northInput.setAttribute('type', 'text');
        northInput.setAttribute('id', 'transformations-north-coordinate');
        northInput.setAttribute('required', 'required');
        northInput.setAttribute('pattern', '^[ \t]*[0-9]+[.,]?[0-9]*[ \t]*$');

        center = coordinate ||  this.map.getCenter();
        if (center) {
            eastInput.setAttribute('value', center.lon);
            northInput.setAttribute('value', center.lat);
        }

        fieldset.appendChild(eastLabel);
        fieldset.appendChild(eastInput);
        fieldset.appendChild(northLabel);
        fieldset.appendChild(northInput);

        this.inputForm.appendChild(fieldset);

        outSystem = this.generateCoordinateSystemsList('transformations-output-coordinate-system', OpenLayers.Lang.translate('Select output coordinate system'), 23);
        this.inputForm.appendChild(outSystem.label);
        this.inputForm.appendChild(outSystem.select);

        this.buttonWrapper = document.createElement('div');
        this.buttonWrapper.setAttribute('class', 'buttonWrapper');

        button2 = document.createElement('button');
        button2.setAttribute('type', 'button');
        button2.setAttribute('id', 'transformations-goto-coordinate-system-submit-button');
        button2.innerHTML = OpenLayers.Lang.translate('Go to coordinates');
        this.buttonWrapper.appendChild(button2);
        this.gotoButton = button2;

        button = document.createElement('button');
        button.setAttribute('type', 'submit');
        button.setAttribute('id', 'transformations-output-coordinate-system-submit-button');
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
        $('#transformations-east-coordinate').val(lonLat.lon);
        $('#transformations-north-coordinate').val(lonLat.lat);
    },
    transformData: function (params, callback) {
        var request;
        if (params.ost && params.nord && params.sosiKoordSys && params.resSosiKoordSys) {

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
    standardOut: function (result, status, request) {
        var output = document.getElementById('transformations-output');
        if (output) {
            output.parentNode.removeChild(output);
        }
        output = document.createElement('div');
        output.setAttribute('id', 'transformations-output');
        this.cnt.appendChild(output);

        if (result.hasOwnProperty('errKode') && result.errKode !== 0) {
            var errorHeader = document.createElement('h2');
                errorHeader.setAttribute('class', 'h');
                errorHeader.innerHTML = OpenLayers.Lang.translate('An error occured');
            var errorMessage = document.createElement('p');
                errorMessage.setAttribute('class', 'error');
                errorMessage.innerHTML = result.errTekst;
            output.appendChild(errorHeader);
            output.appendChild(errorMessage);
        } else {
            var html = '<h2 class="h">' + OpenLayers.Lang.translate('Transformed coordinates') + '</h2>';
            html += '<span class="output-label">' + OpenLayers.Lang.translate('East coordinate') + '</span>';
            html += '<span class="output-value">' + result.ost + '</span>';
            html += '<span class="output-label">' + OpenLayers.Lang.translate('North coordinate') + '</span>';
            html += '<span class="output-value">' + result.nord + '</span>';
            output.innerHTML = html;
        }


        OpenLayers.Element.addClass(this.inputForm, 'disabled');
        $(this.inputForm).find('input, select').prop('disabled', true);
        this.map.events.unregister('click', this, this.setCoordinatesFromClick);
    },
    specialOut: function (result) {
        if (this.eastCoordinateOutputElement) {
            this.eastCoordinateOutputElement.innerHTML = OpenLayers.Util.preciseRound(result.ost, 5);
            this.eastCoordinateOutputElement.setAttribute('title', result.ost);
        }
        if (this.northCoordinateOutputElement) {
            this.northCoordinateOutputElement.innerHTML = OpenLayers.Util.preciseRound(result.nord, 5);
            this.northCoordinateOutputElement.setAttribute('title', result.nord);
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

        east = document.getElementById('transformations-east-coordinate').value;
        north = document.getElementById('transformations-north-coordinate').value;
        inCoordinateSystem = document.getElementById('transformations-input-coordinate-system').value;
        outCoordinateSystem = document.getElementById('transformations-output-coordinate-system').value;

        requestParams.ost = parseFloat(east.replace(/^\s+|\s+$/g, '').replace(/,/g, '.'));
        requestParams.nord = parseFloat(north.replace(/^\s+|\s+$/g, '').replace(/,/g, '.'));
        requestParams.sosiKoordSys = inCoordinateSystem;
        requestParams.resSosiKoordSys = outCoordinateSystem;

        this.transformData(requestParams, this.standardOut);

        return false;
    },
    gotoCoordinate: function () {
        var cmap = this.map;
        var east = document.getElementById('transformations-east-coordinate').value;
        var north = document.getElementById('transformations-north-coordinate').value;
        var center = new OpenLayers.LonLat(east, north);
        //var coor_from = new OpenLayers.Projection("EPSG:4326");
        //var coor_to   = new OpenLayers.Projection(cmap.getProjection());
        //center.transform(coor_from, coor_to);

        var zoom, dzoom;
        dzoom = $(this).data("zoom");
        if ( dzoom > cmap.getZoom() ) {
            zoom = dzoom;
        } else {
            zoom = cmap.getZoom();
        }
        cmap.setCenter(center, zoom, true, true );
        var self = this, menu = null;
        self.menu = menu = new OpenLayers.Control.PointMenu({
            'parent'   : 'Search', 'url' : self.coordinates, 'map': self.map,
            'tracking' : function(data) {
                if ( ! data ) return;
                var pm   = data['module'], where = data['where'];
                var attr = pm.attr, main = attr['main'], widget = attr['widget'];

                if ( where=='pointMenuEndHandler' ) {
                    if ( OpenLayers.Element.hasClass(main, 'onClose') ) {
                        pm.hideControls();
                        self.menu = null;
                        return true;
                    }
                }
                return false;
            }
        });
        clearTimeout( self.timer || 0 );
        self.timer = setTimeout( function() {
            menu.showControls(), menu.showPointMenu( {}, false, center, true );
            OpenLayers.Element.removeClass( menu['attr']['button'],'active' );
            OpenLayers.Element.addClass( menu['attr']['button'],'simulation' );
        }, 50 );
    }, //goto
    enable: function () {
    }, // enable

    disable: function () {
    }, // disable

    toggleWidget: function () {
    	OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleGetURL

    toggleControls: function () {
	   var self = this;
    },//togglecontrols

    CLASS_NAME: "OpenLayers.Control.Transformations"
}); // OpenLayers.Control.Transformations
