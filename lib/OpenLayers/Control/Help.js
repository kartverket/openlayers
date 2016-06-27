/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.Help = 
    OpenLayers.Class(OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonHelp',
    title: null,
    widget: null,
    cnt: null,
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.type = OpenLayers.Control.TYPE_BUTTON;
        this.title = OpenLayers.Lang.translate('Help');
    }, // initialize
    
    draw: function () {
        var self   = this, cName = 'btn nkButton';
	    var mapped = 'OpenLayers_Control_Help' + self.map.id;
        var btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');
        
        OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind( self.toggleWidget, self ));
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 96.999999 97.000002" enable-background="new 0 0 841.9 595.3" xml:space="preserve"  width="24" height="24" > <g id="g3572" transform="translate(-372.3,-249.3)"> <g id="g3574"> <rect x="411.79999" y="287.29999" width="17" height="45" id="rect3576" style="fill:#ffffff" /> <circle cx="420.60001" cy="273.29999" r="8.8999996" id="circle3578" style="fill:#ffffff" /> </g> <g id="g3580"> <path d="m 420.8,346.3 c -26.7,0 -48.5,-21.8 -48.5,-48.5 0,-26.7 21.8,-48.5 48.5,-48.5 26.7,0 48.5,21.8 48.5,48.5 0,26.8 -21.7,48.5 -48.5,48.5 z m 0,-89 c -22.3,0 -40.5,18.2 -40.5,40.5 0,22.3 18.2,40.5 40.5,40.5 22.3,0 40.5,-18.2 40.5,-40.5 0,-22.3 -18.1,-40.5 -40.5,-40.5 z" id="path3582" style="fill:#ffffff" /> </g> </g> </svg>');
        
        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }
        
    	self.cnt = document.createElement('div');
        OpenLayers.Element.addClass(self.cnt, 'cnt');
        
        var faq = [{
            answers: 9
            ,tag: 'ol'
        },{
            answers: 3
            ,tag: 'ul'
        }];
        var html = '';
        for (var i = 0, j = faq.length; i < j; i++) {
            html += '<h4>' + OpenLayers.Lang.translate('freeprint_question_' + i) + '</h4>';
            html += '<' + faq[i].tag + '>';
            for (var k = 0, l = faq[i].answers; k < l; k++) {
                html += '<li>' + OpenLayers.Lang.translate('freeprint_answer_' + i + '_' + k) + '</li>';
            }
            html += '</' + faq[i].tag + '>';
        }
        
        html += '<br><a href="http://www.kartverket.no/">' + OpenLayers.Lang.translate('freeprint_more_at_kartverket') + '</a>'
        
    	self.cnt.innerHTML = html;
        
        self.widget = OpenLayers.Util.createWidget( self.cnt, 1, true );
        self.div.appendChild( self.widget );
        
        return self.div;
    }, // draw
    
    hideControls: function () {        
    	OpenLayers.Element.removeClass( this.div, 'active' );
    }, //hideControls
    
    showControls: function () {
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
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.Help"
}); // OpenLayers.Control.Help
