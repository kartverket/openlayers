/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.Logo = OpenLayers.Class( OpenLayers.Control, {
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
    },
    
    draw: function () {
        var imgLocation, wrapper, img;

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        imgLocation = OpenLayers.Util.getImageLocation("logo.png");

        img = OpenLayers.Util.createImage(
            'OpenLayers_Control_Logo' + this.map.id,
            null,
            null,
            imgLocation, 
            null,
            null,
            null,
            null,
            "Norgeskart.no - Kartverket"
        ); // this.div
        wrapper = document.createElement('div');

        var link = document.createElement('a');
        link.href = "http://kartverket.no";
        link.target = "_blank";

        if (this.svgLogo) {
            link.innerHTML = OpenLayers.Util.hideFromOldIE(this.svgLogo);
        }
        link.appendChild(img);
        wrapper.appendChild(link);

        OpenLayers.Element.addClass(wrapper, 'logoDiv');

        if (this.div === null) {
            this.div = wrapper;
        } else {
            this.div.appendChild(wrapper);
        }
        
        return this.div;
    }, // draw
        
    CLASS_NAME: "OpenLayers.Control.Logo"
}); // OpenLayers.Control.Logo
