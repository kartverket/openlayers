/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.Help = OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonHelp',
    elemsToHideSelector: '',
    title: null,
    widget: null,
    cnt: null,
    faqUrl: '',

    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);

        //self.elemsToHideSelector = self.classElemToHide.join(',');
        self.type = OpenLayers.Control.TYPE_BUTTON;
        this.title = OpenLayers.Lang.translate('Keyboard shortcuts');        
    }, // initialize
    
    draw: function () {
        var self = this, 
            cName = 'help-button nkButton',
            mapped,
            btn;

	    mapped = 'OpenLayers_Control_Help' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleWidget, self));

        OpenLayers.Util.appendToggleToolClick({'self':self});
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 280.228821 280.228821" version="1.1"><g id="surface1"><path style="fill:none;stroke-width:9.6;stroke-linecap:butt;stroke-linejoin:round;stroke:rgb(100%,100%,100%);stroke-opacity:1;stroke-miterlimit:4;" d="M 275.429688 140.113281 C 275.429688 214.808594 214.808594 275.429688 140.113281 275.429688 C 65.421875 275.429688 4.800781 214.808594 4.800781 140.113281 C 4.800781 65.421875 65.421875 4.800781 140.113281 4.800781 C 214.808594 4.800781 275.429688 65.421875 275.429688 140.113281 Z M 275.429688 140.113281 "/><path style=" stroke:none;fill-rule:nonzero;fill:rgb(100%,100%,100%);fill-opacity:1;" d="M 113.675781 59.667969 C 113.675781 52.898438 116.25 47.125 121.398438 42.347656 C 126.542969 37.570312 132.710938 35.179688 139.894531 35.179688 C 147.1875 35.179688 153.40625 37.570312 158.554688 42.347656 C 163.699219 47.125 166.273438 52.898438 166.273438 59.667969 C 166.273438 66.339844 163.699219 72.113281 158.554688 76.988281 C 153.40625 81.769531 147.1875 84.15625 139.894531 84.15625 C 132.710938 84.15625 126.542969 81.769531 121.398438 76.988281 C 116.25 72.113281 113.675781 66.339844 113.675781 59.667969 Z M 164.023438 105.511719 L 164.023438 246.464844 L 116.25 246.464844 L 116.25 105.511719 L 164.023438 105.511719 "/></g></svg>');

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

    insertFaq: function (response, status, request) {
      var faq = request.responseText.replace(/[\"\r\n]/g, '');
      $("#faqBox").html(faq);
      $(".faq-panel").accordion({
        heightStyle: "fill",
        collapsible: true,
        heightStyle: "content"
      });
      $(".help-menu").accordion({
        collapsible: true,
        heightStyle: "content",
        active: false
      });
    },

    showControls: function () {
      // user OS sniffing to display correct key name/symbol
      var mac = (navigator.platform && navigator.platform.indexOf('Mac') !== -1) || (navigator.userAgent && navigator.userAgent.indexOf('iPhone') !== -1);
      var ctrlKey = mac ? '⌘ ' : 'Ctrl + ';
      var html = '';
      html += '<div id="shortcuts" class="help-menu">';
      html += '<h1 class="h">' + OpenLayers.Lang.translate('Keyboard shortcuts') + '</h1>';
      html += '<div class="shortcuts-panel">';
      html += '<div class="header">';
      html += '<p>' + OpenLayers.Lang.translate('You can navigate using the following keyboard shortcuts') + ':</p>';
      html += '<p>' + OpenLayers.Lang.translate('Press TAB to change selected control. Press ENTER to activate the selected control.') + '</p>';
      html += '</div>';
      html += '<table><thead><tr><th scope="col">' + OpenLayers.Lang.translate('Keyboard shortcut') + '</th><th scope="col">' + OpenLayers.Lang.translate('Function') + '</th></tr></thead>';
      html += '<tbody><tr><td>F11</td><td>Fullskjerm</td></tr>';
      html += '<tr><td>' + ctrlKey + 'P</td><td>Skriv ut</td></tr>';
      html += '<tr><td>+ og -</td><td>Zoom</td></tr>';
      html += '<tr><td>Piltaster</td><td>Panorere</td></tr>';
      html += '<tr><td>Home, End, PageUp, PageDown</td><td>Panorere raskt</td></tr>';
      html += '</tbody></table>';
      html += '</div>';

      html += '<h1 class="h">Ofte stilte sp\u00f8rsm\u00e5l om norgeskart.no</h1>';
      html += '<div id="faqBox" class="faq-panel">'
      html += '</div>';

      html += '</div>';
      this.cnt.innerHTML = html;

      OpenLayers.Util.renderToggleToolClick({'self':this});
      OpenLayers.Element.addClass( this.div, 'active' );

      $.ajax({
        url: this.faqUrl,
        success: this.insertFaq,
        type: 'GET'
      });
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleWidget: function () {
        OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleWidget
    
    toggleControls: function () {
        var self = this;
    }, //togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.Help"
}); // OpenLayers.Control.GetURL
