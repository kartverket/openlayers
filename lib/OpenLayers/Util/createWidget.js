/**
 * @requires OpenLayers/Util.js
 */

/** 
 * Function: createWidget
 * 
 * Parameters:
 *   - content {DOM} shall be append to the widget. Otherwise empty
 *     content wrapper will be added in the widget
 *   - wCount {Integer} refers to the wrapper count within the widget
 *     shall be created.
 *   - arrow {Boolean}, the true refers to append arrow element in
 *     the widget and next to conent. Otherwise no arrow will be appended.
 * Returns: 
 * {DOMElement} A DOM Button created with the specified attributes.
 */
OpenLayers.Util.createWidget = function( content, wCount, arrow ) {
    var widget = document.createElement('div'); 
    OpenLayers.Element.addClass(widget, 'widget');
    
    var wrapper = widget, count = ! wCount || isNaN(wCount) ? 0 : wCount;
    while( count-- > 0 ) {
	var w = document.createElement('div');    
	OpenLayers.Element.addClass( w, 'wrapper' );
	wrapper.appendChild( w );
	wrapper = w;
    }
    
    var cnt = content || document.createElement('div');    
    if ( ! content ) OpenLayers.Element.addClass( cnt, 'widgetCnt' );    
    wrapper.appendChild( cnt );    

    if ( arrow ) {
	var arrow1 = document.createElement('div');
	OpenLayers.Element.addClass(arrow1, 'arrow');

	var arrow2 = document.createElement('div');
	OpenLayers.Element.addClass(arrow2, 'arrow');
	arrow1.appendChild( arrow2 ); 
	
	wrapper.appendChild( arrow1 );
    }
    return widget;
};