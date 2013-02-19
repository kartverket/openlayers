OpenLayers.Util.hideFromOldIE = function(htmlFragment) {
    return '<!--[if !IE]>-->' + htmlFragment + '<!--<![endif]-->';
};