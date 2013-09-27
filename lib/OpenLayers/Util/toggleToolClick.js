/**
 * @requires OpenLayers/Util.js
 */

/** 
 * Function: appendToggleToolClick 
 * 
 * Parameters:
 * {Boolean} 
 */
OpenLayers.Util.appendToggleToolClick = function (data) {
    var self,
        type,
        note,
        list,
        index;

    if (!data || !data['self']) {
        return false;
    }
    self = data['self'];

    if (typeof self.hideControls !== 'function') {
        return false;
    }

    type = data['type'] || 'alfa';
    note = self.map.toggleEventClick || {};
    list = note[type] || [];
    index = list.length;

    self._TTCid = type + '_' + index;

    list.push(data);
    note[type] = list;
    self.map.toggleEventClick = note;

    return true;
};

/** 
 * Function: renderToggleToolClick 
 * 
 * Parameters:
 */
OpenLayers.Util.renderToggleToolClick = function (data, onOff) {

    var self,
        pin,
        type,
        note,
        list,
        i,
        s,
        p,
        displayClass;

    if (!data || !data['self']) {
        return;
    }

    self = data['self'];
    pin = self._TTCid || '';

    if (!pin) {
        return;
    }
    
    type = data['type'] || 'alfa';
    note = self.map.toggleEventClick || {};
    list = note[type] || [];
    
    for (i = 0; i < list.length; i++) {
        s = list[i]['self'];
        p = s._TTid;
        if (p !== pin) s.hideControls(true);
        if (!onOff && s.displayClass === 'olControlPointMenu') s.showControls(true);
    }
};



