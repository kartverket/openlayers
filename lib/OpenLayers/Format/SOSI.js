/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/JSON.js
 * @requires OpenLayers/Format/GeoJSON.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/MultiPoint.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/MultiLineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Geometry/MultiPolygon.js
 * @requires OpenLayers/Console.js
 */

/**
 * Class: OpenLayers.Format.GeoJSON
 * Read and write GeoJSON. Create a new parser with the
 *     <OpenLayers.Format.GeoJSON> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.SOSI = OpenLayers.Class(OpenLayers.Format.GeoJSON, {

    /**
     * APIMethod: read
     * Deserialize a SOSI string into a GeoJSON string into vector.
     *
     * Parameters:
     * sosi - {String} A SOSI string
     * filter - {Function} A function which will be called for every key and
     *     value at every level of the final result. Each value will be
     *     replaced by the result of the filter function. This can be used to
     *     reform generic objects into instances of classes, or to transform
     *     date strings into Date objects.
     *
     * Returns: 
     * {Object} The return depends on the value of the type argument. If type
     *     is "FeatureCollection" (the default), the return will be an array
     *     of <OpenLayers.Feature.Vector>. If type is "Geometry", the input json
     *     must represent a single geometry, and the return will be an
     *     <OpenLayers.Geometry>.  If type is "Feature", the input json must
     *     represent a single feature, and the return will be an
     *     <OpenLayers.Feature.Vector>.
     */

    read: function(sosi, filter) {
        var sosiparser = new SOSI.Parser();
        var sosidata = sosiparser.parse(sosi);
        var json = sosidata.dumps("geojson");
        type = "FeatureCollection";
        obj = OpenLayers.Format.GeoJSON.prototype.read.apply(this, [json, filter]);
        obj.projection = sosidata.hode.srid;
        return obj;
    },
    
    CLASS_NAME: "OpenLayers.Format.SOSI" 

});     
