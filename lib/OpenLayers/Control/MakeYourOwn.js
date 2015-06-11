/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.MakeYourOwn = OpenLayers.Class(OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonMakeYourOwn',
    
    elemsToHideSelector: '',
    
    title: null,

    widget: null,
    
    cnt: null,

    svgIcon: null,
    svgOrderIllustration: null,
    svgFreeIllustration: null,
    orderUrl: null,
    freeUrl: null,

    initialize: function (options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);

        //self.elemsToHideSelector = self.classElemToHide.join(',');
        self.type = OpenLayers.Control.TYPE_BUTTON;
        this.title = OpenLayers.Lang.translate('Make your own map');        
    }, // initialize
    
    draw: function () {
        var self = this, 
            cName = 'make-your-own-button nkButton',
            mapped,
            btn;

	    mapped = 'OpenLayers_Control_Make_Your_Own' + self.map.id;
        btn    = OpenLayers.Util.createButton(mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleWidget, self));

        OpenLayers.Util.appendToggleToolClick({'self':self});
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE(this.svgIcon);

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }

        self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

    	self.widget = OpenLayers.Util.createWidget(self.cnt, 1, true);
    	self.div.appendChild(self.widget);
  
        return self.div;
    }, // draw
     

    hideControls: function (flag) {
    	OpenLayers.Element.removeClass( this.div, 'active' );
        if (!flag) OpenLayers.Util.renderToggleToolClick({'self': self});
    }, //hideControls


    showControls: function () {
        var html = '<div class="header">',
            nonFreeButton,
            nonFreeContent = '',
            freeButton,
            freeContent = '';

        html += '<h1 class="h">' + OpenLayers.Lang.translate('Make your own map') + '</h1>';
        html += '</div>';
        this.cnt.innerHTML = html;

        nonFreeLink = document.createElement('a');
        nonFreeLink.setAttribute('href', this.orderUrl);
        nonFreeLink.setAttribute('class', 'external-link nonfree-data');
        nonFreeContent += '<h2 class="h">' + OpenLayers.Lang.translate('Illustrative maps:') + '</h2>';
        if (this.svgOrderIllustration) {
            nonFreeContent += OpenLayers.Util.hideFromOldIE(this.svgOrderIllustration);
        }
        nonFreeContent += '<span>' + OpenLayers.Lang.translate('Simple illustration maps of Norway, in several different formats. These maps can be used as they are, or easily be transformed to suit specific needs.') + '</span>';
        nonFreeLink.innerHTML = nonFreeContent;

        freeLink = document.createElement('a');
        freeLink.setAttribute('href', this.freeUrl);
        freeLink.setAttribute('class', 'external-link free-data');
        freeContent += '<h2 class="h">' + OpenLayers.Lang.translate('Map data:') + '</h2>';
        if (this.svgFreeIllustration) {
            freeContent += OpenLayers.Util.hideFromOldIE(this.svgFreeIllustration);
        }
        freeContent += '<span>' + OpenLayers.Lang.translate('Map data are geographic data in vector format.') + '</span>';
        freeLink.innerHTML = freeContent;

        this.cnt.appendChild(nonFreeLink);
        this.cnt.appendChild(freeLink);

        var openInNewTab = function (evt) { 
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
            window.open(this.href);
        };

        OpenLayers.Event.observe(freeLink, 'click', openInNewTab);
        OpenLayers.Event.observe(nonFreeLink, 'click', openInNewTab);

        OpenLayers.Util.renderToggleToolClick({'self': this});
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
        var self = this;
    }, //togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.MakeYourOwn"
}); // OpenLayers.Control.GetURL
