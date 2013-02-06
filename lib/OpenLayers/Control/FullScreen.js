/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.FullScreen = 
    OpenLayers.Class( OpenLayers.Control, {
    
    is_full_screen_on: false,
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonFullScreen',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    
    elemsToHideSelector: '',
    
    title: "FullScreen",
    
    initialize: function(options) {
        var that = this;
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
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
        
        this.elemsToHideSelector = this.classElemToHide.join(',');
        this.type = OpenLayers.Control.TYPE_BUTTON;
    }, // initialize
    
    draw: function () {
        var position, 
        size, 
        imgLocation;
        
        position = new OpenLayers.Pixel(1,1);
        size = new OpenLayers.Size(68,56);
        imgLocation = OpenLayers.Util.getImageLocation("norges_fs.png");

        this.div = OpenLayers.Util.createDiv(
                    'OpenLayers_Control_FullScreen' + this.map.id,
                    position,
                    size,
                    imgLocation, "absolute");
                    
        OpenLayers.Event.observe(this.div, 'click', 
            OpenLayers.Function.bind(this.toggleFullScreen, this)
        );
        
        this.div.title = this.title;
        this.div.style.cursor = "pointer";
              
        return this.div;
    }, // draw
     

    hideControls: function () {        
        $(this.elemsToHideSelector).not("." + this.panelClass).hide();
    }, //hideControls


    showControls: function () {
        $(this.elemsToHideSelector).show();
    }, // showControls


    enable: function () {
        var el = document.documentElement,
            rfs = // for newer Webkit and Firefox
                   el.requestFullScreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen
                || el.msRequestFullScreen;
        if (rfs !== "undefined" && rfs) {
            rfs.call(el);
        } else if (window.ActiveXObject !== "undefined") {
            // for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        } // endif
    }, // enable


    disable: function () {
        // cancel method belongs to document directly
        var cfs = // for newer Webkit and Firefox
                   document.cancelFullScreen
                || document.webkitCancelFullScreen
                || document.mozCancelFullScreen
                || document.msCancelFullScreen;
        if (cfs !== "undefined" && cfs) {
            cfs.call(document);
        } else if (window.ActiveXObject !== "undefined") {
            // for Internet Explorer
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
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