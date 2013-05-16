/**
 * @requires OpenLayers/Util.js
 */

OpenLayers.Util.htmlEncode = function (str) {
    function replaceTag(tag) {
        var tagsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return tagsToReplace[tag] || tag;
    }
    return str.replace(/[&<>"'\/]/g, replaceTag);
}
