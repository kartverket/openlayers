/**
 * @requires OpenLayers/Util.js
 */

/** 
 * Function: 
 */

OpenLayers.Util.getWindowSize = function(){
    var size = [0, 0];
    if( ! window.innerWidth ) { // IE
        if( !(document.documentElement.clientWidth == 0) ){
            size[0] = document.documentElement.clientWidth;
            size[1] = document.documentElement.clientHeight;
        }
        else {
            size[0] = document.body.clientWidth;
            size[1] = document.body.clientHeight;
        }
    }
    else {
        size[0] = window.innerWidth;
        size[1] = window.innerHeight;
    }
    return size;
}; 

/** 
 * Function: 
 */
OpenLayers.Util.preventDefaultEvent = function( e ) {
    if ( e ) {
        if ( typeof(e.preventDefault)=='function' )
            e.preventDefault();
        else
            e.returnValue = false;
    }
};

/** 
 * Function: 
 */
OpenLayers.Util.getStyle = function( dom, property ){
    var value = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
        value = document.defaultView.getComputedStyle(dom, "").getPropertyValue(property);
    }
    else if(dom.currentStyle){
        property = property.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        value = dom.currentStyle[property];
    }
    return value;
};

/** 
 * Function: 
 */
OpenLayers.Util.createRegExp = function( text, g, i, b, f, e, r ) {
    if ( text == '*' ) { return /.*/; }
    text = e ? escapeText( text ) : text.replace( /\*/, '.*' );
    
    var v = text.replace( /\+/g, '\\+' );
    if ( r ) v = v.replace( r[0], r[1] );
    
    var m = (g && i) ? 'gi' : ( (g || i) ? (g ? 'g' : 'i') : '' );
    return new RegExp((b ? '(^|\\s+)' : '') +'('+v+')' + (f ? '($|\\s+)': ''),m);
};

/** 
 * Function: 
 */
OpenLayers.Util.clearSelection = function() {
    if ( window.getSelection )
        window.getSelection().removeAllRanges();
    else if ( document.selection )
        document.selection.empty();
};

/**
 * Function: createCookie
 */    	
OpenLayers.Util.createCookie = function( name, value, days ) {
    if ( ! name ) return;
    var cookie = [ name+'='+(value||'') ];
    var d = new Date(), expires = days || 360;
    d.setTime( d.getTime() + (expires*24*60*60*1000) );
    cookie.push( 'expires='+d.toGMTString() );
    cookie.push( 'path=/' );
    document.cookie = cookie.join('; ');
};

/**
 * Function: readCookie
 */    		
OpenLayers.Util.readCookie = function( name ) {
    var nameEQ = name + '=', ca = document.cookie.split(';');
    for ( var i=0; i<ca.length; i++ ) {
	var c = ca[i];
	while (c.charAt(0)==' ') c = c.substring(1,c.length);
	if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return '';
};

/**
 * Function: eraseCookie
 */    	
OpenLayers.Util.eraseCookie = function( name ) { 
    return helper.createCookie( name, '', -1 ); 
}; 
