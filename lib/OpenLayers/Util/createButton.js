/**
 * @requires OpenLayers/Util.js
 */

/** 
 * Function: createButton
 * Creates a new button and optionally set some standard attributes.
 * Null may be passed to each parameter if you do not wish to
 * set a particular attribute.
 * Note - zIndex is NOT set on the resulting button.
 * 
 * Parameters:
 * id - {String} An identifier for this element.  If no id is
 *               passed an identifier will be created 
 *               automatically.  Note that dots (".") will be replaced with
 *               underscore ("_") when generating ids.
 * px - {<OpenLayers.Pixel>|Object} The element left and top position,
 *                                  OpenLayers.Pixel or an object with
 *                                  a 'x' and 'y' properties.
 * sz - {<OpenLayers.Size>|Object} The element width and height,
 *                                 OpenLayers.Size or an object with a
 *                                 'w' and 'h' properties.
 * imgURL - {String} A url pointing to an image to use as a 
 *                   background image.
 * position - {String} The style.position value. eg: absolute,
 *                     relative etc.
 * border - {String} The the style.border value. 
 *                   eg: 2px solid black
 * overflow - {String} The style.overflow value. Eg. hidden
 * opacity - {Float} Fractional value (0.0 - 1.0)
 * 
 * Returns: 
 * {DOMElement} A DOM Button created with the specified attributes.
 */
OpenLayers.Util.createButton = function(id, px, sz, imgURL, position, 
                                     border, overflow, opacity) {

    var dom = document.createElement('button');

    if (imgURL) {
        dom.style.backgroundImage = 'url(' + imgURL + ')';
    }

    //set generic properties
    if (!id) {
        id = OpenLayers.Util.createUniqueID("OpenLayersButton");
    }
    if (!position) {
        position = "absolute";
    }
    OpenLayers.Util.modifyDOMElement(dom, id, px, sz, position, 
                                     border, overflow, opacity);

    return dom;
};