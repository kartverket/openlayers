/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.PointMenu = 
    OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonPointMenu',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    attr : {},
    data : [
	{'id'   : 'PMinformation',
	 'title': 'Informasjon om dette punktet',
	 'img'  : 'img/pointMenuInformation.png',
	 'cnt'  : ''   
	},
	{'id'   : 'PMweather',
	 'title': '',
	 'img'  : 'img/pointMenuWeather.png',
	 'cnt'  : ''   
	},
	{'id'   : 'PMsun',
	 'title': '',
	 'img'  : 'img/pointMenuSun.png',
	 'cnt'  : ''   
	},
	{'id'   : 'PMshare',
	 'title': '',
	 'img'  : 'img/pointMenuShare.png',
	 'cnt'  : '<div class="shareContent">' + 
	   '<a href="http://www.facebook.com" alt="">Facebook see er ae ser erer er</a>'+   
	   '<a href="http://www.twitter.com" alt="">Twitter</a>'+  
	   '<a href="http://www.youtube.com" alt="">Youtube</a>'+   
	  '</div>'
	},
	{'id'   : 'PMwater',
	 'title': '',
	 'img'  : 'img/pointMenuWater.png',
	 'cnt'  : ''   
	},
	{'id'   : 'PMmaid',
	 'title': '',
	 'img'  : 'img/pointMenuMaid.png',
	 'cnt'  : ''     
	}
    ],
	

    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);
        self.type = OpenLayers.Control.TYPE_BUTTON;
    }, // initialize
    
    draw: function () {
        var self   = this, cName = 'btnPointMenu';
	var mapped = 'OpenLayers_Control_PointMenu' + self.map.id;
        var btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe( btn, 'click', 
            OpenLayers.Function.bind( self.toggleControls, self )
        );

	self.map.events.register( 'click', self, self.showPointMenu );
	self.map.events.register( 'move', self, self.movePointMenu );

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE(
	 '<img alt="" src="img/pointMenu.png">'
	);

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }

	self.attr['button'] = btn;
        return self.div;
    }, // draw

    /**
     * Method: hideControls
     */	
    hideControls: function () {        
	var self = this, attr = self.attr;
	var btn  = attr['button'], main = attr['main'];

    	OpenLayers.Element.removeClass( btn, 'active' );
    	if ( main ) OpenLayers.Element.removeClass( main, 'active' );
    }, //hideControls

    /**
     * Method: showControls
     */	
    showControls: function () {	
	var self = this, attr = self.attr;
	var btn  = attr['button'], main = attr['main'];
	if ( ! main ) main = self.createPointMenu();
    	OpenLayers.Element.addClass( btn,  'active' );
    }, // showControls

    /**
     * Method: enable
     */
    enable: function () {
    }, // enable

    /**
     * Method: disable
     */
    disable: function () {
    }, // disable

    /**
     * Method: toggleControls
     */
    toggleControls: function () {
	var self = this, attr = self.attr, btn = attr['button'];
	
	OpenLayers.Element.hasClass( btn, 'active' ) ? 
	    self.hideControls() : self.showControls();
    }, // toggleControls

    /**
     * Method: movePointMenu
     */
    movePointMenu: function ( e ) {
	var self = this, attr = self.attr; 
	if ( attr['ignorMove'] ) return;

	var btn = attr['button'], main = attr['main'];
	if  ( ! btn || ! main || ! OpenLayers.Element.hasClass(btn,'active') ) return;	

	var d = self.map.getPixelFromLonLat(attr['center']);
	var l = 'left:'+d['x']+'px;';
	var t = 'top:'+d['y']+'px;';
	
	main.setAttribute('style', l+t );
    }, // movePointMenu 

    /**
     * Method: showPointMenu
     */
    showPointMenu: function ( e ) {
	var self = this, attr = self.attr; 
	var btn  = attr['button'], main = attr['main'], menu = attr['menu'];
	if ( ! btn || ! main || ! OpenLayers.Element.hasClass(btn,'active') ) return;

	self.resetMenuItems( true );
	attr['clickEvent'] = e, attr['center'] = self.map.getLonLatFromPixel(e.xy);
	attr['lon'] = attr['center'].lon, attr['lat'] = attr['center'].lat; 	

	var actived    = OpenLayers.Element.hasClass( main, 'active' ); 	 
	var centralize = function() {
	    self.map.setCenter( attr['center'] );
	    var h = 500, s = self.getWindowSize(), w = [
		parseInt( self.getStyle(main,'width')  ) || 0, 
		parseInt( self.getStyle(main,'height') ) || 0
	    ];	   

	    w[2] = w[0]/2, w[3] = w[1] /2;
	    s[2] = s[0]/2, s[3] = s[1] /2;
	    
	    var t = h + w[3], m = s[3] - t, d = 10;
	    if ( m > 0 ) return;

	    if ( t+w[3]+d > s[1] ) m += (t+w[3] - s[1] - d);
	    self.map.moveByPx( 0, m );
	}; 

	if ( actived ) {
	    attr['menuBFopenCallback'] = centralize;
	    /*
	    attr['menuEndCallback']    = function(){self.movePointMenu(); };

	    OpenLayers.Element.hasClass( main, 'onClose' ) ? 	 
		attr['menuEndCallback']() : self.toggleMenu( true );
	    */
 	    OpenLayers.Element.removeClass( main, 'active' );
	    OpenLayers.Element.addClass( main, 'onClose' );
	    self.movePointMenu(), setTimeout( function() {
		OpenLayers.Element.addClass( main, 'active' );
	    }, 50 );
	}
	else { 
	    centralize(), setTimeout( function() {	   
		OpenLayers.Element.addClass( main, 'active'  ); 	 
		OpenLayers.Element.addClass( main, 'onClose' ); 
		self.toggleMenu( true );
		if ( ! attr['once'] ) {
		    setTimeout( function(){ self.toggleMenu( false ); }, 100 );
		    attr['once'] = true;
		}
	    }, 100 );
	}
    }, // showPointMenu

    /***************************************************************************/

    /**
     * Method: createCookie
     */    	
    createCookie : function( name, value, days ) {
	if ( ! name ) return;
	var cookie = [ name+'='+(value||'') ];
	var d = new Date(), expires = days || 360;
	d.setTime( d.getTime() + (expires*24*60*60*1000) );
	cookie.push( 'expires='+d.toGMTString() );
	cookie.push( 'path=/' );
	document.cookie = cookie.join('; ');
    }, // createCookie

    /**
     * Method: readCookie
     */    		
    readCookie : function( name ) {
	 var nameEQ = name + '=', ca = document.cookie.split(';');
	 for ( var i=0; i<ca.length; i++ ) {
	     var c = ca[i];
	     while (c.charAt(0)==' ') c = c.substring(1,c.length);
	     if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	 }
	 return '';
    },

    /**
     * Method: eraseCookie
     */    	
    eraseCookie : function( name ) { 
	return helper.createCookie( name, '', -1 ); 
    }, // eraseCookie

    /**
     * Method: getWindowSize
     */    	
    getWindowSize : function(){
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
    }, // getWindowSize

    /**
     * Method: getStyle
     */    	
    getStyle : function( dom, property ){
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
    }, // getStyle

    /**
     * Method: isIE
     */    
    isIE : function() {
	if ( ! (navigator.appName).match('Microsoft Internet Explorer') ) return 0;
	var m = (navigator.appVersion).match( /MSIE\s([\d\.]+)/);
	return m && m[1] ? parseFloat( m[1] ) : 0; 
    }, // isIE

    /**
     * Method: displayItemWidget
     */    
    displayItemWidget : function( index ) {
	var self = this, attr = self.attr, data = self.data;
	var main = attr['main'], menu = attr['menu'], widget = attr['widget'];
	
	if ( typeof(index) != 'number') {
	    index = parseInt( menu.getAttribute('data-view') );
	    if ( typeof(index) != 'number') return;
	}
	
	if ( ! menu.children[index] )return;

	var id = menu.children[index].id;
	if ( ! id ) return;

	var cnt = '', loop = data.length;
	for ( var i=0; i<loop; i++ ) {
	    if ( data[i]['id'] == id ) {
		cnt = data[i]['cnt'], i = loop;
	    }
	}

	widget.setAttribute('class', 'view'+id );
	widget.innerHTML = cnt || '';
	OpenLayers.Element.addClass( menu.children[index], 'active' ); 
	setTimeout(function() { // Set timeout only for IE8 
	    OpenLayers.Element.addClass( main, 'display' ); 
	}, 50 );
	
    }, // displayItemWidget

    /**
     * Method: rotateToItem
     */    
    rotateToItem : function( index ) {
	var self = this, attr = self.attr;
	if ( ! index ) index = 0;

	var main = attr['main'], menu = attr['menu'];
	var list = menu.children || [], loop = list.length;

	if ( attr['ie'] && attr['ie']<10 ) {
	    if ( ! attr['first'] ) attr['first'] = menu.children[0].id;

	    var temp = [], count = loop, c = 0;
	    while ( count-- > 0 ) {
		var j = (index + (c++))%loop;
		temp.push( list[j].id );
		OpenLayers.Element.removeClass(list[j],'active');
	    }

	    for ( var i=0; i<loop; i++ ) 
		list[i].id = temp[i];
	    self.displayItemWidget( 0 );
	}
	else {
	    var now = parseInt( menu.getAttribute('data-view') ) || 0;
	    var degree = 60, next = index * degree;
	    var temp = '-moz-transform: rotateZ(NUMBERdeg);' +
		'-webkit-transform: rotateZ(NUMBERdeg);'+
		'-o-transform: rotateZ(NUMBERdeg);'+
		'transform: rotateZ(NUMBERdeg);';
	    
	    var style = temp.replace( /NUMBER/g, next );
	    for ( var i=0; i<loop; i++ ) {
		if ( ! list[i].id || list[i].id == 'offButton' ) continue;
		OpenLayers.Element.removeClass(list[i],'active');
		list[i].setAttribute('style', style );
	    }
	    menu.setAttribute('style', temp.replace( /NUMBER/g,next*-1) );
	    if ( now == index ) {
		OpenLayers.Element.hasClass( main, 'display' ) ? 
		    OpenLayers.Element.removeClass( main, 'display' ) :
		    self.displayItemWidget( index ); 
	    }
	    else { 
		OpenLayers.Element.removeClass( main, 'display' );
	    }
	}
	menu.setAttribute('data-view', index+'');
    }, // rotateToItem

    /**
     * Method: toggleMenu
     */    
    toggleMenu : function( force ) {
	var self = this, attr = self.attr;
	var main = attr['main'], menu = attr['menu'];
	var close = typeof(force) == 'boolean' ? force : 
	    (! OpenLayers.Element.hasClass(main,'onClose') );

	var temp  = 'left:NUMBER%;top:NUMBER%;right:NUMBER%;bottom:NUMBER%;'+
	    'opacity:OPACITY; filter:alpha(opacity=ALPHA);';
	var style = temp.replace( /NUMBER/g, close ? '100' : '0')
	    .replace( /OPACITY/g, close ? '0' : '1' )
	    .replace( /ALPHA/g, close ? '0' : '100' );

	if ( close ) {
	    OpenLayers.Element.addClass(main,'onClose'); 
	    OpenLayers.Element.removeClass(main,'onOpen');
	    OpenLayers.Element.removeClass(main,'display');

	    menu.removeAttribute('data-view');
	    self.resetMenuItems();

	    if ( attr['ie'] && attr['ie'] < 10 ) {
		var order = [], loop = menu.children.length;
		var count = loop, index = 0, c = 0;

		for ( var i=0; i<loop; i++ ) {
		    if ( menu.children[i].id == attr['first'] ) {
			index = i, i = loop;
		    }
		}

		while ( count-- > 0 ) {
		    var j = (index + (c++))%loop;
		    order.push( menu.children[j].id ); 
		     OpenLayers.Element.removeClass( menu.children[j],'active');
		}

		for ( var i=0; i<loop; i++ ) 
		    menu.children[i].id = order[i]; 
	    }
	}
	else {   
	    if ( attr['menuBFopenCallback'] ) {
		attr['menuBFopenCallback']();
		attr['menuBFopenCallback'] = null;
	    }
	    OpenLayers.Element.removeClass(main,'onClose'); 
	    OpenLayers.Element.addClass(main,'onOpen'); 
	}
	//menu.setAttribute('style', style);

    }, // toggleMenu

    /**
     * Method: createPointMenu
     */    
    clickOnPointerMenuItem : function( e ) {
	var self = this, attr = self.attr;
	if ( ! e ) e = window.event;

	var target = e.target || e.srcElement, id = target.id;
	if ( ! id ) return;

	var main = attr['main'], tool = attr['tool'], menu = attr['menu'];

	if ( id == 'PMcloser' || id == 'PMopener' ) {
	    self.toggleMenu( id == 'PMcloser' );
	}
	else {
	    var list = menu.children, loop = list.length, index = -1;
	    for ( var i=0; i<loop; i++ ) {
		if ( list[i].id == id ) {
		    index = i, i = loop;
		}
	    }
	    if ( index >= 0 ) self.rotateToItem( index );
	}
    }, // clickOnPointerMenuItem

    /**
     * Method: pointMenuEndHandler
     */    
    pointMenuEndHandler : function( e ) {
	var self = this, attr = self.attr;
	if ( e.target.id != attr['menu'].id ) return;

	clearTimeout( attr['pointMenuEndHandlerTImeout'] || 0 );
	attr['pointMenuEndHandlerTImeout'] = setTimeout( function() {
	    var main   = attr['main'], menu = attr['menu'];
	    var close  = OpenLayers.Element.hasClass( main, 'onClose' );
	    var onOpen = OpenLayers.Element.hasClass( main, 'onOpen' );
	    var callback = attr['menuEndCallback'];
	    attr['menuEndCallback'] = null;

	    //removeClass(main, 'onOpen');
	    if ( close ) {
		self.resetMenuItems();
		if ( callback ) callback();
	    }
	    else if ( onOpen ) {
		if ( menu.clientWidth ) {
		    setTimeout( function() { 
			OpenLayers.Element.removeClass(main, 'onOpen'); 
			if ( callback ) callback();
		    }, 50 );
		}
	    }
	    else if ( ! onOpen ) {
		self.displayItemWidget();
		if ( callback ) callback();
	    }
	},  30 );

    }, // pointMenuEndHandler

    /**
     * Method: resetMenuItems
     */    
    resetMenuItems : function( force) {
	var self = this, attr = self.attr;
	var menu = attr['menu'], main = attr['main'];
	for ( var i=0; i<menu.children.length; i++ ) {
	    menu.children[i].removeAttribute('style');
	    OpenLayers.Element.removeClass( menu.children[i], 'active' );
	}
	if ( force ) {
	    menu.removeAttribute( 'style' );
	    main.removeAttribute( 'style' );
	    OpenLayers.Element.removeClass( main, 'display' ); 	   
	}
    }, // resetMenuItems

    /**
     * Method: createPointMenu
     */
    createPointMenu: function () {
	var self = this, attr = self.attr, data = self.data, items = [];

	for (var i=0; i<data.length; i++ ) {
	    var id = data[i]['id'] || '';
	    items.push( '<li id="'+id+'" class="item icon'+(i+1)+'"></li>');
	}

	var menu   = '<ul id="PMmenu">'+items.join('')+'</ul>';
	var widget = '<div id="PMwidget"></div><div id="PMarrow"></div>';
	var tool   = '<ul id="PMtool">' +
	    '<li id="PMcloser" class="item"></li>'+
	    '<li id="PMopener" class="item"></li>'+
	    '</ul>';

	var main = document.createElement('div');
	main.setAttribute('id', 'pointMenu');
	main.innerHTML = widget + tool + menu;
	document.body.appendChild( main );

	attr['ie']     = self.isIE();
	attr['main']   = document.getElementById('pointMenu');
	attr['tool']   = document.getElementById('PMtool');
	attr['menu']   = document.getElementById('PMmenu');
	attr['widget'] = document.getElementById('PMwidget');

	for (var i=0; i<attr['menu'].children.length; i++ ) {
	    if (  OpenLayers.Element.hasClass(attr['menu'].children[i],'item') ){
		OpenLayers.Event.observe( 
		    attr['menu'].children[i], 'click',
		    OpenLayers.Function.bind( self.clickOnPointerMenuItem, self )
		);
	    }
	}

	for ( var i=0; i<attr['tool'].children.length; i++ ) {
	    if ( OpenLayers.Element.hasClass(attr['tool'].children[i],'item') ) {
		OpenLayers.Event.observe( 
		    attr['tool'].children[i], 'click',
		    OpenLayers.Function.bind( self.clickOnPointerMenuItem, self )
		);
	    }
	}

	var end = ['webkitTransitionEnd', 'oTransitionEnd otransitionend', 'MSTransitionEnd', 'transitionend'];
	for ( var i=0; i<end.length; i++ ) {
	    OpenLayers.Event.observe( 
		attr['menu'], end[i],OpenLayers.Function.bind( self.pointMenuEndHandler, self )
	    );
	}
    }, // createPointMenu




	_kiet : function ( text, value ) {
            var debug = document.getElementById('debugWidget'), v = '', d = new Date();
            if ( ! debug ) {

                debug = document.createElement('div');
                debug.setAttribute('id', 'debugWidget');
                debug.setAttribute('style',
				   'position:fixed;right:10px;top:10px;height:200px;width:400px;overflow:scroll;background-color:white;color:black;z-index:10000;font-size:11px'
				  );
                document.body.appendChild( debug );
            }

            var p = debug.innerHTML || '';
            var t = d.getMinutes() + ':' + d.getSeconds();
            if ( value != null ) {
                if ( typeof(value) != 'object' )
                    v = value;
                else if( value instanceof Array )
                    v = value.join('<br/>');
                else {
                    var data = [];
                    for ( var k in value ) data.push( k + ' : ' + value[k]);
                    v = data.join( '<br/>' );
                }
            }
            debug.innerHTML = t + '<br/>' + text + '<br/>' + v + '<div>&nbsp;</div>' + p;
        },


    CLASS_NAME: "OpenLayers.Control.PointMenu"
}); // OpenLayers.Control.PointMenu

OpenLayers.Util.extend(OpenLayers.Lang.nb, {
    'Copy the following address to share this page': 'Klipp og lim følgende tekst for å dele denne siden'
});

