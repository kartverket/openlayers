/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.GeoLogo = OpenLayers.Class( OpenLayers.Control, {

  initialize: function(options) {
    OpenLayers.Control.prototype.initialize.apply(this,[options]);
  },

  draw: function () {
    var imgLocation, wrapper, img;

    OpenLayers.Control.prototype.draw.apply(this, arguments);
    imgLocation = OpenLayers.Util.getImageLocation("ND_logo_mini57pix.gif");

    img = OpenLayers.Util.createImage(
        'OpenLayers_Control_Logo' + this.map.id,
      null,
      null,
      imgLocation,
      null,
      null,
      null,
      null,
      "Geonorge"
    ); // this.div
    wrapper = document.createElement('div');

    var link = document.createElement('a');
    var linkText = document.createTextNode("Geonorge forside");
    link.appendChild(linkText);
    link.id= "logoGeonorge";
    link.title = "Geonorge forside";
    link.href = "http://www.geonorge.no";

    //if (this.svgLogo) {
      //wrapper.innerHTML = OpenLayers.Util.hideFromOldIE(this.svgLogo);
    //}

    //link.appendChild(img);
    wrapper.appendChild(link);

    OpenLayers.Element.addClass(wrapper, 'logoGeoDiv');

    if (this.div === null) {
      this.div = wrapper;
    } else {
      this.div.appendChild(wrapper);
    }

    return this.div;
  }, // draw

  CLASS_NAME: "OpenLayers.Control.GeoLogo"
}); // OpenLayers.Control.Logo
