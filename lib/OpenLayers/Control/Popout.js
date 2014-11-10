/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.Popout = OpenLayers.Class( OpenLayers.Control, {
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
    },
    
    draw: function () {
        var imgLocation, wrapper, img;

        OpenLayers.Control.prototype.draw.apply(this, arguments);

        img = document.createElement('div');
        img.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" class="icon fullscreen"><path d="M14.949,3.661l1.429,1.428l1.539-1.54l1.612,1.612V0.485h-4.676l1.636,1.636L14.949,3.661z M17.894,16.6l-1.54-1.539l-1.428,1.428l1.539,1.54l-1.611,1.612h4.676v-4.676L17.894,16.6z M4.895,16.465l-1.428-1.428l-1.54,1.539l-1.612-1.611v4.676h4.675l-1.636-1.637L4.895,16.465z M3.491,5.064l1.428-1.428l-1.54-1.539l1.612-1.612H0.315v4.675l1.636-1.635L3.491,5.064zM15.769,12.033V8.199c0-1.587-1.288-2.875-2.875-2.875H6.907c-1.588,0-2.875,1.287-2.875,2.875v3.834c0,1.588,1.287,2.875,2.875,2.875h5.987C14.48,14.908,15.769,13.621,15.769,12.033z" /></svg>');

        img.style["position"]="fixed";
        img.style["padding"]="5px";
        img["className"]="panel toolbar";
        img.style["right"]="0";
        img.style["bottom"]="0";
        wrapper = document.createElement('div');

        var link = document.createElement('a');
        var testHash = window.location.href.split("#")[0].split('/');
        if (testHash.length > 4) {
            link.href = "http://www.norgeskart.no/" + testHash[3] + "/#" + window.location.href.split("#")[1];
        } else {
            link.href = "http://www.norgeskart.no/#" + window.location.href.split("#")[1];
        }
        link.target = "_blank";
        self.link = link;

        link.appendChild(img);
        wrapper.appendChild(link);

        OpenLayers.Element.addClass(wrapper, 'logoDiv');

        if (this.div === null) {
            this.div = wrapper;
        } else {
            this.div.appendChild(wrapper);
        }
        
        return this.div;
    }, // draw

    updateLink: function (url) {
      self.link.href = url; 
    },
        
    CLASS_NAME: "OpenLayers.Control.Popout"
}); // OpenLayers.Control.Popout
