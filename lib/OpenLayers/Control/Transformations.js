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

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.type = OpenLayers.Control.TYPE_BUTTON;
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Transformations': 'Transformasjoner',
            'Transform coordinates': 'Transformer koordinater',
            'Select input coordinate system': 'Velg input-koordinatsystem',
            'Select output coordinate system': 'Velg output-koordinatsystem',
            'Fill out the coordinate fields or select in the map': 'Skriv inn koordinater eller velg i kart',
            'Help': 'Hjelp',
            'East coordinate': 'Øst-koordinat (lengdegrad)',
            'North coordinate': 'Nord-koordinat (breddegrad)',
            'Show coordinates': 'Vis koordinater'
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
            {'ESRI': null, 'EPSG': null, 'SOSI': 84, 'name': 'EU89, Geografisk, enhet:sekunder'},
            {'ESRI': 4230, 'EPSG': 4230, 'SOSI': 4230, 'name': 'ED50 Geografisk, enhet:grader'},
            {'ESRI': 4231, 'EPSG': null, 'SOSI': 4231, 'name': 'ED87 Geografisk, enhet:grader'},
            {'ESRI': 4273, 'EPSG': 4273, 'SOSI': 4273, 'name': 'NGO1948 Geografisk, enhet:grader'},
            {'ESRI': null, 'EPSG': 4322, 'SOSI': 4322, 'name': 'WGS72 Geografisk, enhet:grader'},
            {'ESRI': 4326, 'EPSG': 4326, 'SOSI': 4326, 'name': 'EU89/WGS84 Geografisk, enhet:grader'}
        ];
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

        self.widget = OpenLayers.Util.createWidget( self.cnt, 1 );
        self.div.appendChild( self.widget );
  
        return self.div;
    }, // draw
     
    hideControls: function () {        
    	OpenLayers.Element.removeClass( this.div, 'active' );
    }, //hideControls

    showControls: function () {
        var html, 
            i, 
            j, 
            sosiCode, 
            selected;

        html = '<h1 class="h">' + OpenLayers.Lang.translate('Transform coordinates') + '</h1>';
        html += '<label for="transformations-input-coordinate-system">' + OpenLayers.Lang.translate('Select input coordinate system') + '</label>';
        html += '<select id="transformations-input-coordinate-system">';
        for (i = 0, j = this.sosiCodes.length; i < j; i += 1) {
            sosiCode = this.sosiCodes[i];
            selected = (sosiCode.SOSI === 23) ? ' selected="selected"' : '';
            html += '<option value="' + sosiCode.SOSI + '"' + selected + '>' + sosiCode.name + '</option>';
        }
        html += '</select>';
    	this.cnt.innerHTML = html;
    	OpenLayers.Element.addClass( this.div, 'active' );
    }, // showControls

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
