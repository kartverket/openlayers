/**
 * @requires OpenLayers/Util.js
 */

/** 
 * Function: createAjaxRequest
 * 
 * Parameters:
 * {} 
 */
OpenLayers.Util.createAjaxRequest = function( callback, webservice, query, method, isCors ) {
    if ( ! webservice ) return;

    var ajax = null;// The variable that makes Ajax possible!
    try {                        
        if (isCors && typeof XDomainRequest !== "undefined") {
            // IE 8 & 9
            ajax = new XDomainRequest();
        } else {
            // Opera 8.0+, Firefox, Safari
            ajax = new XMLHttpRequest();
        }
    } catch ( e ){                // Internet Explorer Browsers
        try {
            ajax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                ajax = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {             // Something went wrong
                alert("Your browser broke!");
                return null;
            }
        }
    }

        // Create a function that will receive data sent from the server
    if (typeof XDomainRequest !== "undefined") {
        ajax.onload = function () {
            callback(ajax.responseText || '');
        };
    } else {
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4) {
                callback( ajax.responseText || '' );
            }
        };
    }
    var url  = webservice + (query ? '?' + query : '');
    var type = method ? method.toUpperCase() : 'GET';
    ajax.open(type, url, true);
    ajax.send(null);
    return ajax;
};