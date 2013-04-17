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

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.type = OpenLayers.Control.TYPE_BUTTON;
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Transformations': 'Transformasjoner',
            'Transform coordinates': 'Transformer koordinater',
            'Select input coordinate system': 'Velg input-koordinatsystem',
            'Select output coordinate system': 'Velg output-koordinatsystem',
            'Fill out the coordinate fields or click in the map': 'Skriv inn koordinater eller velg i kart',
            'Help': 'Hjelp',
            'East coordinate': 'Øst-koordinat (lengdegrad)',
            'North coordinate': 'Nord-koordinat (breddegrad)',
            'Show coordinates': 'Vis koordinater',
            'Transformed coordinates': 'Transformerte koordinater'
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
            {'ESRI': null, 'EPSG': null, 'SOSI': 84, 'name': 'EU89, Geografisk, sekunder'},
            {'ESRI': 4230, 'EPSG': 4230, 'SOSI': 4230, 'name': 'ED50 Geografisk, grader'},
            {'ESRI': 4231, 'EPSG': null, 'SOSI': 4231, 'name': 'ED87 Geografisk, grader'},
            {'ESRI': 4273, 'EPSG': 4273, 'SOSI': 4273, 'name': 'NGO1948 Geografisk, grader'},
            {'ESRI': null, 'EPSG': 4322, 'SOSI': 4322, 'name': 'WGS72 Geografisk, grader'},
            {'ESRI': 4326, 'EPSG': 4326, 'SOSI': 4326, 'name': 'EU89/WGS84 Geografisk, grader'}
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
     
    hideControls: function () { 
        OpenLayers.Event.stopObservingElement(this.transformButton);
    	OpenLayers.Element.removeClass( this.div, 'active' );
        this.transformButton = null;
        this.inputForm = null;
    }, //hideControls

    showControls: function () {
        var html = '',
            inputForm,
            selected,
            button,
            coordinates,
            that = this;

        var generateCoordinateSystemsList = function (id, label, selectedValue) {
            var sosiCode,
                i, 
                j, 
                html = '';

            html += '<label for="' + id + '">' + label + '</label>';
            html += '<select id="' + id + '">';
            for (i = 0, j = that.sosiCodes.length; i < j; i += 1) {
                sosiCode = that.sosiCodes[i];
                selected = (!!selectedValue && sosiCode.SOSI === selectedValue) ? ' selected="selected"' : '';
                html += '<option value="' + sosiCode.SOSI + '"' + selected + '>' + sosiCode.name + '</option>';
            }
            html += '</select>';
            return html;
        };

        center = this.map.getCenter();
        this.cnt.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Transform coordinates') + '</h1>';

        this.inputForm = document.createElement('form');
        html += generateCoordinateSystemsList('transformations-input-coordinate-system', OpenLayers.Lang.translate('Select input coordinate system'), 23);
        html += '<fieldset><legend>' + OpenLayers.Lang.translate('Fill out the coordinate fields or click in the map') + '</legend>';
        html += '<label for="transformations-east-coordinate">' + OpenLayers.Lang.translate('East coordinate') + '</label>';
        if (center) {
            html += '<input id="transformations-east-coordinate" type="text" value="' + center.lon +'" required="required" pattern="^[ \t]*[0-9]+[.,]?[0-9]*[ \t]*$" />';
        } else {
            html += '<input id="transformations-east-coordinate" type="text" required="required" pattern="^[ \t]*[0-9]+[.,]?[0-9]*[ \t]*$" />';
        }
        html += '<label for="transformations-north-coordinate">' + OpenLayers.Lang.translate('North coordinate') + '</label>';
        if (center) {
            html += '<input id="transformations-north-coordinate" type="text" value="' + center.lat +'" required="required" pattern="^[ \t]*[0-9]+[.,]?[0-9]*[ \t]*$" />';
        } else {
            html += '<input id="transformations-north-coordinate" type="text" required="required" pattern="^[ \t]*[0-9]+[.,]?[0-9]*[ \t]*$" />';
        }
        html += '</fieldset>';
        html += generateCoordinateSystemsList('transformations-output-coordinate-system', OpenLayers.Lang.translate('Select output coordinate system'), 23);

        this.inputForm.innerHTML = html;

        button = document.createElement('button');
        button.setAttribute('type', 'submit');
        button.innerHTML = OpenLayers.Lang.translate('Show coordinates');
        this.inputForm.appendChild(button);

        this.transformButton = button;

        this.cnt.appendChild(this.inputForm);

        OpenLayers.Event.observe(this.inputForm, 'submit', 
            OpenLayers.Function.bind(that.transform, that)
        );

    	OpenLayers.Element.addClass(this.div, 'active');

        this.map.events.register('click', this, this.setCoordinatesFromClick);
    }, // showControls

    setCoordinatesFromClick: function (event) {
        var lonLat = this.map.getLonLatFromPixel(event.xy);
        $('#transformations-input-coordinate-system').find('option').prop('selected', false);
        $('#transformations-input-coordinate-system').find('option[value="23"]').prop('selected', true);
        $('#transformations-east-coordinate').val(lonLat.lon);
        $('#transformations-north-coordinate').val(lonLat.lat);
    },

    transform: function (event) {
        var east,
            north,
            inCoordinateSystem,
            outCoordinateSystem,
            request,
            requestParams = {},
            that = this;

        event.stopPropagation();
        east = document.getElementById('transformations-east-coordinate').value;
        north = document.getElementById('transformations-north-coordinate').value;
        inCoordinateSystem = document.getElementById('transformations-input-coordinate-system').value;
        outCoordinateSystem = document.getElementById('transformations-output-coordinate-system').value;

        
        requestParams.ost = parseFloat(east.replace(/^\s+|\s+$/g, '').replace(/,/g, '.'));
        requestParams.nord = parseFloat(north.replace(/^\s+|\s+$/g, '').replace(/,/g, '.'));
        requestParams.sosiKoordSys = inCoordinateSystem;
        requestParams.resSosiKoordSys = outCoordinateSystem;



        request = $.ajax({
            url: this.serviceURL,
            data: requestParams,
            dataType: 'json',
            crossDomain: true
        });

        request.done(function (result, status, request) {
            var html = '', 
                output;
            output = document.createElement('div');
            html += '<h2 class="h">' + OpenLayers.Lang.translate('Transformed coordinates') + '</h2>';
            html += '<span class="output-label">' + OpenLayers.Lang.translate('East coordinate') + '</span>';
            html += '<span class="output-value">' + result.ost + '</span>';
            html += '<span class="output-label">' + OpenLayers.Lang.translate('North coordinate') + '</span>';
            html += '<span class="output-value">' + result.nord + '</span>';            
            output.innerHTML = html;
            that.cnt.appendChild(output);
            OpenLayers.Element.addClass(that.inputForm, 'disabled');
            $(that.inputForm).find('input, select').prop('disabled', true);
            that.map.events.unregister('click', that, that.setCoordinatesFromClick);
        });// done

        request.fail(function(xhr, status, exc) {
            console.log( "Request failed: " + status + ', ' + exc);
        });// fail

    },
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
