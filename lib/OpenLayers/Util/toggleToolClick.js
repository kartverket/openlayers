/**
 * @requires OpenLayers/Util.js
 */

/** 
 * Function: appendToggleToolClick 
 * 
 * Parameters:
 * {Boolean} 
 */
OpenLayers.Util.appendToggleToolClick = function( data ) {
    if ( ! data || ! data['self'] ) return false;
    var self = data['self'];
    if ( typeof(self.hideControls) != 'function' ) return false;

    var type = data['type'] || 'alfa';
    var note = self.map.toggleEventClick || {};
    var list = note[type] || [], index = list.length;

    self._TTCid = type+'_'+index;

    list.push( data );
    note[type] = list, self.map.toggleEventClick = note;

    return true;
};

/** 
 * Function: renderToggleToolClick 
 * 
 * Parameters:
 */
OpenLayers.Util.renderToggleToolClick = function( data ) {
    if ( ! data || ! data['self'] ) return;
    var self = data['self'], pin = self._TTCid || ''; 
    if ( ! pin ) return;

    var type = data['type'] || 'alfa';
    var note = self.map.toggleEventClick || {};
    var list = note[type] || [];
    
    for ( var i=0; i<list.length; i++ ) {
	var s = list[i]['self'], p = s._TTid;
	if ( p != pin  ) {
	    s.hideControls();
	}
    }
};