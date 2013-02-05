/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.Logo = OpenLayers.Class( OpenLayers.Control, {
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
    },
    
    draw: function () {
        var size, position, imgLocation;
        
        position = new OpenLayers.Pixel(80, 1);
        size = new OpenLayers.Size(197,58);
        imgLocation = OpenLayers.Util.getImageLocation("logo.png");
        
        this.div = OpenLayers.Util.createDiv(
            'OpenLayers_Control_Logo' + this.map_id,
            position,
            size,
            imgLocation, "absolute"
        ); // this.div
        
        return this.div;
    } // draw
}); // OpenLayers.Control.Logo
var NK = NK || {};
NK.Controls = NK.Controls || {};
NK.Controls.Logo = NK.Controls.Logo || {};

NK.Controls.Logo = { 

    panelClass: 'logoPanel',

    createControl: function () {
        var panel;
        
        panel = new OpenLayers.Control.Panel({
            displayClass: 'olControlPanel ' + this.panelClass            
        }); // panel
        
        return panel;
    } // createControl
} // Logo


