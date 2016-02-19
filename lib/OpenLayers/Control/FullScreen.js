/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.FullScreen = 
    OpenLayers.Class( OpenLayers.Control, {
    
    is_full_screen_on: false,
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonFullScreen',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.selZoom'],
    
    elemsToHideSelector: '',

    btn: null,
    
    title: null,
    
    initialize: function(options) {
        var that = this;
        OpenLayers.Control.prototype.initialize.apply(this,[options]);

        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Fullscreen': 'Fullskjermsvisning',
            'Exit fullscreen': 'Avslutt fullskjermsvisning'
        });
        
        this.title = OpenLayers.Lang.translate('Fullscreen');

        $(document).bind("keydown", function (e) {
            var code = e.keyCode || e.which;
            if (code === 122) { //F11                
                that.is_full_screen_on = ! that.is_full_screen_on;
                that.toggleControls();
            } else if (code === 27) {// Escape
                // escape button can be used for leaving FS enabled by our button
                if (that.is_full_screen_on === true) {
                    that.is_full_screen_on = false;
                    that.toggleControls();
                } // endif
            } // endif    
        }); // bind
;
        //listen to fullscreen change and if exiting fullscreen and property is_full_screen_on is still true
        //e.g. when clicking esc button -> make sure to set correct value and show controls
        $(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function() {
            if(that.fullScreenStatus() === false && that.is_full_screen_on === true) {
                that.is_full_screen_on = false;
                that.showControls();
            }
        });


        this.elemsToHideSelector = this.classElemToHide.join(',');
        this.type = OpenLayers.Control.TYPE_BUTTON;
    }, // initialize
    fullScreenStatus: function() {
        if (document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreenElement) {
            return true;
        } else {
            return false;
        }
    },
    draw: function () {
        var position, 
            size, 
            imgLocation,
            btn,
            className = "button fullscreen-button";
        
        btn = OpenLayers.Util.createButton(
                'OpenLayers_Control_FullScreen' + this.map.id,
                null,
                null,
                null,
                "static");
                    
        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind(this.toggleFullScreen, this)
        );
        
        btn.title = this.title;
        btn.className = btn.className === "" ? className : btn.className + " " + className;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" class="icon fullscreen"><path d="M14.949,3.661l1.429,1.428l1.539-1.54l1.612,1.612V0.485h-4.676l1.636,1.636L14.949,3.661z M17.894,16.6l-1.54-1.539l-1.428,1.428l1.539,1.54l-1.611,1.612h4.676v-4.676L17.894,16.6z M4.895,16.465l-1.428-1.428l-1.54,1.539l-1.612-1.611v4.676h4.675l-1.636-1.637L4.895,16.465z M3.491,5.064l1.428-1.428l-1.54-1.539l1.612-1.612H0.315v4.675l1.636-1.635L3.491,5.064zM15.769,12.033V8.199c0-1.587-1.288-2.875-2.875-2.875H6.907c-1.588,0-2.875,1.287-2.875,2.875v3.834c0,1.588,1.287,2.875,2.875,2.875h5.987C14.48,14.908,15.769,13.621,15.769,12.033z" /></svg><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20" preserveAspectRatio="xMidYMid meet" class="icon windowed"><path d="M19.877,1.61l-1.523-1.533l-1.642,1.653L14.992,0v5.021h4.987l-1.745-1.756L19.877,1.61z M16.737,18.253l1.643,1.653l1.522-1.533l-1.642-1.653l1.719-1.73h-4.987v5.02L16.737,18.253z M0.103,18.399l1.523,1.533l1.642-1.654l1.719,1.731v-5.021H0l1.745,1.756L0.103,18.399z M1.6,0.104L0.077,1.637L1.719,3.29L0,5.021h4.987V0L3.243,1.756L1.6,0.104z M15.759,12.038V8.204c0-1.587-1.288-2.875-2.875-2.875H6.897c-1.588,0-2.875,1.287-2.875,2.875v3.834c0,1.588,1.287,2.875,2.875,2.875h5.987C14.471,14.913,15.759,13.626,15.759,12.038z" /></svg>');

        this.btn = btn;

        if (this.div == null) {
            this.div = btn;
        } else {
            this.div.appendChild(btn);
        }
              
        return this.div;
    }, // draw
     

    hideControls: function () {        
        $(this.elemsToHideSelector).not("." + this.panelClass).hide();
        OpenLayers.Element.addClass(document.body, "fullscreen");
        OpenLayers.Element.addClass(this.btn, "fullscreen-active");
    }, //hideControls


    showControls: function () {
        $(this.elemsToHideSelector).show();
        OpenLayers.Element.removeClass(document.body, "fullscreen");
        OpenLayers.Element.removeClass(this.btn, "fullscreen-active");
    }, // showControls


    enable: function () {
        var el = document.documentElement,
            rfs = // for newer Webkit and Firefox
                   el.requestFullscreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen
                || el.msRequestFullScreen;
        if (rfs !== "undefined" && rfs) {
            rfs.call(el);
        } else if (typeof window.ActiveXObject !== "undefined") {
            // for Internet Explorer
            try {
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            } catch (e) {
                // proceed with minimized control panels. Full screen activation prohibited by browser security settings.
            }
        }
    }, // enable


    disable: function () {
        // cancel method belongs to document directly
        var cfs = // for newer Webkit and Firefox
                   document.cancelFullScreen
                || document.webkitCancelFullScreen
                || document.mozCancelFullScreen
                || document.exitFullscreen
                || document.msCancelFullScreen;
        if (cfs !== "undefined" && cfs) {
            cfs.call(document);
        } else if (typeof window.ActiveXObject !== "undefined") {
            // for Internet Explorer
            try {
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            } catch (e) {
            }
        } // endif
    }, // disable

   
    toggleFullScreen: function () {
        if (this.is_full_screen_on === true ) {
            this.disable();
            this.showControls();
            this.is_full_screen_on = false;
        } else {
            this.enable();
            this.hideControls();
            this.is_full_screen_on = true;            
        } // endif
    }, // toggleFullScreen
    

    toggleControls: function () {       
        if (this.is_full_screen_on === true ) {            
            this.hideControls();            
            //this.hideControls();            
        } else {            
            this.showControls();                        
            //this.showControls();                        
        } // endif
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.FullScreen"
}); // OpenLayers.Control.FullScreen
