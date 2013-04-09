/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.GetURL = 
    OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonGetURL',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    
    elemsToHideSelector: '',
    
    title: null,

    widget: null,
    
    cnt: null,

    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);

        //self.elemsToHideSelector = self.classElemToHide.join(',');
        self.type = OpenLayers.Control.TYPE_BUTTON;
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Get URL': 'Vis URL'
        });
        
        this.title = OpenLayers.Lang.translate('Get URL');        
    }, // initialize
    
    draw: function () {
        var self   = this, cName = 'getURL-button nkButton';
	    var mapped = 'OpenLayers_Control_GetURL' + self.map.id;
        var btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind( self.toggleGetURL, self )
        );
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="icon share"><path d="M14.843,15.493c-0.497,0-0.967,0.118-1.385,0.329l-2.421-2.495c0.178-0.407,0.277-0.858,0.277-1.335c0-0.476-0.1-0.927-0.277-1.334l2.411-2.485c0.42,0.214,0.894,0.334,1.395,0.334C16.587,8.507,18,7.051,18,5.253C18,3.457,16.587,2,14.843,2s-3.157,1.457-3.157,3.253c0,0.436,0.083,0.851,0.233,1.23L9.453,9.025C9.058,8.842,8.619,8.739,8.157,8.739C6.414,8.739,5,10.196,5,11.992c0,1.797,1.414,3.254,3.157,3.254c0.462,0,0.9-0.104,1.296-0.286l2.471,2.546c-0.153,0.383-0.238,0.802-0.238,1.241c0,1.797,1.413,3.254,3.157,3.254S18,20.544,18,18.747S16.587,15.493,14.843,15.493z" /></svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
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
        var html = '<h1>' + OpenLayers.Lang.translate('Share map') + '</h1>';
        html += '<span>' + OpenLayers.Lang.translate('Copy the following address to share this page', 'nb') +  '</span>';
        html += '<div class="page-url">' + window.location.href + '</div>';
        html += '<span>' + OpenLayers.Lang.translate('Share by:') + '</span>';
        html += '<a href="mailto:?subject=norgeskart.no&body=' + encodeURIComponent(window.location.href) + '">' + OpenLayers.Lang.translate('e-mail') + '</a>';
        html += '<a href="http://twitter.com/share?url=' + encodeURIComponent(window.location.href) + '">' + OpenLayers.Lang.translate('twitter') + '</a>';
//        html += '<iframe src="//www.facebook.com/plugins/like.php?href=' + encodeURIComponent(window.location.href) + '&amp;send=false&amp;layout=button_count&amp;width=45&amp;show_faces=false&amp;font=arial&amp;colorscheme=light&amp;action=like&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:45px; height:21px;" allowTransparency="true"></iframe>';
        html += '<a href="http://www.facebook.com/sharer.php?u=' + encodeURIComponent(window.location.href) + '">' + OpenLayers.Lang.translate('Facebook') + '</a>';
    	this.cnt.innerHTML = html;
    	OpenLayers.Element.addClass( this.div, 'active' );
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleGetURL: function () {
	OpenLayers.Element.hasClass( this.div, 'active' ) ? 
	    this.hideControls() : this.showControls();
    }, // toggleGetURL
    
    toggleControls: function () {      
	var self = this;
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.GetURL"
}); // OpenLayers.Control.GetURL

OpenLayers.Util.extend(OpenLayers.Lang.nb, {
    'Copy the following address to share this page': 'Klipp og lim følgende tekst for å dele denne siden'
});