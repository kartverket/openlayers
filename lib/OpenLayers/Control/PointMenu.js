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
	 'cnt'  : '<div class="loading">Lasting...</div>',
	 'api'  : [
	     {'id':'place', 'url':'http://openwps.statkart.no/skwms1/wps.elevation'}
	 ]
	},
	{'id'   : 'PMweather',
	 'title': '',
	 'img'  : 'img/pointMenuWeather.png',
	 'cnt'  : '<div class="loading">Lasting...</div>',
	 'api'  : [
	     {'id':'weather', 'url':'http://beta.norgeskart.no/ws/forecast.py'},
	     {'id':'sunRise', 'url':'http://beta.norgeskart.no/ws/sun.py'}
	 ]
	},
	{'id'   : 'PMruler',
	 'title': '',
	 'img'  : 'img/pointMenuRuler.png',
	 'cnt'  : '<div class="loading">Lasting...</div>'
	},
	{'id'   : 'PMshare',
	 'title': '',
	 'img'  : 'img/pointMenuShare.png',
	 'cnt'  : '<div class="shareContent">' + 
	   '<a href="#CreatePermaLink">LAGE PERMALENKE</a>'+  
	   '<a href="#ShareMapView">DEL PUNKT</a>'+  
	   '<a href="#UseMapView">BRUK KARTUTSNITT</a>'+   
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

	OpenLayers.Util.appendToggleToolClick({'self':self});

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
	if ( ! main ){ 
	    main = self.createPointMenu();
            OpenLayers.Event.observe( attr['widget'], 'click',
	      OpenLayers.Function.bind( self.clickOnPointMenuWidget, self )
	    );	    
	}
	OpenLayers.Util.renderToggleToolClick({'self':self});
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
        attr['geometry'] = new OpenLayers.LonLat(attr['lon'], attr['lat']).transform(
            self.map.getProjectionObject(),  new OpenLayers.Projection("EPSG:4326")
        );

	/*
	var kiet = 
	    'http://api.yr.no/weatherapi/textlocation/1.0/?language=nb;' +
	    //'http://api.yr.no/weatherapi/textlocation/1.0/?language=nb;'+
	    'latitude='+attr['geometry'].lat+';longitude='+attr['geometry'].lon;
	return self._kiet(kiet );
	*/

	var actived    = OpenLayers.Element.hasClass( main, 'active' ); 	 
	var centralize = function() {
	    self.map.setCenter( attr['center'] );
	    var h = 450, s = OpenLayers.Util.getWindowSize(), w = [
		parseInt( OpenLayers.Util.getStyle(main,'width')  ) || 0, 
		parseInt( OpenLayers.Util.getStyle(main,'height') ) || 0
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
     * Method: convertText2Date
     */    
    convertText2Date : function ( text ){
	var test = ! text ? null :
	    text.match( /(\d{4})\-(\d{2})\-(\d{2})\w(\d{2})\:(\d{2})/ );
	if ( ! test ) return new Date();
	
	for ( var i=1; i<test.length; i++) {
	    test[i] = parseInt( test[i].replace( /^0/,'') );
	}
	return new Date( test[1], test[2]-1, test[3], test[4], test[5] );
    }, // convertText2Date

    /**
     * Method: convertDate2Text
     */    
    convertDate2Text : function( date ) {
	if ( ! date ) return '';
	var d = [date.getFullYear(),date.getMonth()+1,date.getDate()];
	var h = [date.getHours(),date.getMinutes(),date.getSeconds()];
	
	for (var i=0; i<d.length; i++ ) {
	    if ( d[i] < 10 ) d[i] = '0'+d[i]; 
	}
	
	for (var i=0; i<h.length; i++ ) {
	    if ( h[i] < 10 ) h[i] = '0'+h[i]; 
	}
	
	return d.join('-')+'T'+h.join(':')+'Z';
    }, // convertDate2Text

    /**
     * Method: insertXMLtext2Object
     */    
    insertXMLtext2Object : function( text, object ) {
	if ( ! object ) object = {};
	var splited = text.split( /\/\>/gi );
	for (var i=0; i<splited.length; i++ ) {
	    var m = splited[i].match( /\<(\w+)(.*)/i );
	    var k = m ? m[1] : '';
	    if ( ! k ) continue;
	    
	    var s = (m[2] || '').split( /\s+/ );
	    if ( ! object[k] ) object[k] = {};
	    for ( var j=0; j<s.length; j++ ) {
		var d = s[j].replace( /^\s+/g, '' ).replace( /\"/g, '').split( '=' );
		if ( d.length < 2 || ! d[0].replace( /\s+/, '') ) continue;
		object[k][d[0]] = d[1]+'';
	    }
	}
    }, // insertXMLtext2Object

    /**
     * Method: isIE
     */    
    isIE : function() {
	if ( ! (navigator.appName).match('Microsoft Internet Explorer') ) return 0;
	var m = (navigator.appVersion).match( /MSIE\s([\d\.]+)/);
	return m && m[1] ? parseFloat( m[1] ) : 0; 
    }, // isIE

    /**
     * Method: clearSelection
     */  	
    clearSelection : function() {
	if ( window.getSelection )
	    window.getSelection().removeAllRanges();
	else if ( document.selection ) 
	    document.selection.empty();
    }, // clearSelection
	
    /**
     * Method: clickOnPointMenuWidget
     */  
    clickOnPointMenuWidget : function( e ) {
	var self = this, attr = self.attr, data = self.data;
	if ( ! e ) e = window.event;
	
	OpenLayers.Util.preventDefaultEvent( e );
	
	var widget = attr['widget'], main = attr['main'], menu = attr['menu'];
	var target = e.target || e.srcElement, added = false; 
	var key    = (target.getAttribute('href') || '').replace(/^\#/, '');

	if ( key == 'goBack' ) {
	    var index = parseInt( menu.getAttribute('data-view') ) || 0;
	    self.displayItemWidget( index );
	}
	else if ( key == 'ShareMapView' ) {
	    if ( ! attr[key] ) attr[key] = new OpenLayers.Control.GetURL({});	 
	    widget.setAttribute('class', 'display'+key );
	    widget.innerHTML = attr[key] && attr[key].getContent ? 
		attr[key].getContent( attr['center'] ) : '';
	    added = true;
	}
	else if ( key == 'UseMapView' ){
	    if ( ! attr[key] ) attr[key] = new OpenLayers.Control.Embed({});	 
	    widget.setAttribute('class', 'display'+key );
	    if ( attr[key] && attr[key].insertContent ) {
		attr[key].insertContent( widget );
		attr[key].activeStep = 'type';
		attr[key].steps[attr[key].activeStep].draw.apply(attr[key]);
		attr[key].updateStepProgressPanel();
		added = true;
	    }
	}

	if ( added ) {
	    OpenLayers.Element.addClass( widget,  'hasBackArrrow' );
	    var back = document.createElement('a');
	    back.setAttribute('class', 'goBackButton'        );
	    back.setAttribute('href',  '#goBack'             );
	    back.setAttribute('title', 'Tilbake forrige meny');
	    widget.appendChild( back );
	}

	return false;
    }, // clickOnPointMenuWidg

    /**
     * Method: getWeatherInformation
     */    
    getWeatherInformation : function( text ) {
	if ( ! text ) return '';
	var self = this, attr = self.attr, test = null;
	
	var now  = new Date();
	var from = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0,0);
	var to   = new Date( from.getTime() + (1000*60*60*6) );
	var cc   = new Date( from.getTime() + (1000*60*60) );

	var cf   = self.convertDate2Text( from ); 
	var ct   = self.convertDate2Text( to );
	var tt   = self.convertDate2Text( cc );

	var note = {}, pin = [], reg = [
	   OpenLayers.Util.createRegExp( 
	       'from="'+tt+'" to="'+tt+'"', true, true, false, false 
	   ), 
	   OpenLayers.Util.createRegExp( 
	       'from="'+cf+'" to="'+ct+'"', true, true, false, false 
	   )
	];

	var splited = (text || '').replace( /\r\n/g, '' ).split( /\<\/time\>/gi );
	for (var i=0; i<splited.length; i++ ) {
	    for  ( var j=0; j<reg.length; j++ ) {
		if ( splited[i].match(reg[j]) ) {
		    var m = splited[i].match( /\<location.*?\>(.*)\<\/location\>/i );
		    pin[j] = m[1];
		}    
	    }
	}

	for ( var i=0; i<pin.length; i++ ) {
	    self.insertXMLtext2Object( pin[i], note );
	}
 
	var description = [], out = [
	    '<li class="data date">' +
		'<span class="date">'+self.getDayOfDate(from)+'</span>' +
		' kl ' +
		'<span class="time">'+
		  self.getHourOfDate( from ) + ' - ' + self.getHourOfDate( to ) +
		'</span>'+
	    '</li>'
	];

	// temperature
	if ( note['temperature'] && note['symbol'] ) {	   
	    var hour  = from.getHours();
	    var night = hour >= 16 || hour < 4;
	    var unit  = note['temperature']['unit'] || '';
	    var src   = 'http://api.yr.no/weatherapi/weathericon/1.0/?symbol='+
		note['symbol']['number'] + ';'+
		(night ? 'is_night=1;' : '') +
	        'content_type=image/png';
	    out.push( 
	      '<li class="temperature data">' +
		'<img class="symbol" src="' + src + '" alt="symbol">' +
		'<span class="number">' +
		  (note['temperature']['value'] || '') +
		  self.getUnitSymbol(unit)+
		'</span>' +
	      '</li>'
	    );
	}

	/*
	// windDirection
	if ( note['windDirection'] ) {	    
	    out.push( 
	      '<li class="windDirection data">' +
                '<span class="label">WindDirection</span>'+
		'<span class="value">'+(note['windDirection']['deg'] || '')+'</span>' +
	      '</li>'
	    );
	}

	// windSpeed
	if ( note['windSpeed'] ) {
	    out.push( 
	      '<li class="windSpeed data">' +
                '<span class="label">windSpeed</span>'+
		'<span class="value">'+(note['windSpeed']['mps'] || '')+'</span>' +
	      '</li>'
	    );
	}
	
	// cloudiness
	if ( note['cloudiness'] ) {
	    out.push( 
	      '<li class="cloudiness data">' +
                '<span class="label">cloudiness</span>'+
		'<span class="value">'+(parseInt(note['cloudiness']['percent']) || '0')+'</span>' +
	      '</li>'
	    );
	}

	// fog
	if ( note['fog'] ) {
	    out.push( 
	      '<li class="fog data">' +
                '<span class="label">fog</span>'+
		'<span class="value">'+(parseInt(note['fog']['percent']) || '0')+'</span>' +
	      '</li>'
	    );
	}
	*/

	// humidity
	if ( note['humidity'] ) {	    
	    description.push( 
	      '<span class="humidity">' +
		note['humidity']['value'] + ' ' +
		self.getUnitSymbol( note['humidity']['unit'] ) +
		' luftfuktighet' + 
	      '</span>'
	    );
	}

	// precipitation
	if ( note['precipitation'] ) {
	    description.push( 
	      '<span class="precipitation">' +
		  note['precipitation']['value'] + ' ' +      
		  self.getUnitSymbol( note['precipitation']['unit'] ) +   
		  ' nedb&oslash;r' + 
	      '</span>'
	    );
	}

	out.push( '<li class="data description">'+description.join(', ')+'</li>');

	var style = note['symbol'] ? (note['symbol']['id'] || '') : '';
	return '<ul id="weatherWrapper" class="'+style+'">'+out.join('')+'</ul>';
    }, // getWeatherInformation

    /**
     * Method: getSunRiseAndSetInformation
     */    
    getSunRiseAndSetInformation : function( text ) {
	if ( ! text ) return '';
	var self = this, attr = self.attr, test = null;

	test = text.match( /\<sun\s(.*)/i );
	var sun  = test ? test[1] : ''; 
 
	test = text.match( /\<moon\s(.*)/i );
	var moon  = test ? test[1] : ''; 

	var sRise  = '', sSet = '', mRise = '', mSet = ''; 
	var regexp = /(^|\s)(rise|set)\=\"([\w\d\.\_\-\:\.]+)\"/gi;

	test = sun.match( regexp ) || [];
	for ( var i=0; i<test.length; i++ ) {
	    var s = test[i].replace( /[\"\s]+/g, '').split('='); 
	    var t = (s[1]||'').match( /\w(\d{2}\:\d{2})/ );
	    if ( s[0].match(/^rise$/) ) {
		sRise = t[1] || '';
	    }
	    else if ( s[0].match(/^set$/) ) {
		sSet = t[1] || '';
	    }  
	}
	
	test = moon.match( regexp ) || [];
	for ( var i=0; i<test.length; i++ ) {
	    var s = test[i].replace( /[\"\s]+/g, '').split('='); 
	    var t = (s[1]||'').match( /\w(\d{2}\:\d{2})/ );
	    if ( s[0].match(/^rise$/) ) {
		mRise = t[1] || '';
	    }
	    else if ( s[0].match(/^set$/) ) {
		mSet = t[1] || '';
	    }  
	}

	return '<ul id="sunMoonWrapper">'+	    
	  '<li class="sunRiseAndSetWrapper">' +
	    '<div class="sunRise">'+
	      '<span class="label">Soloppgang</span>'+
	      '<span class="value">'+sRise+'</span>'+
	    '</div>'+
	    '<div class="sunSet">'+
	      '<span class="label">Solnedgang</span>'+
	      '<span class="value">'+sSet+'</span>'+
	    '</div>'+
	  '</li>' +
	  '<li class="moonRiseAndSetWrapper">' +
	    '<div class="moonRise">'+
	      '<span class="label">M&aring;neoppgang</span>'+
	      '<span class="value">'+mRise+'</span>'+
	    '</div>'+
	    '<div class="moonSet">'+
	      '<span class="label">M&aring;nenedgang</span>'+
	      '<span class="value">'+mSet+'</span>'+
	    '</div>'+
	  '</li>' +
	'</ul>';	
    }, // getSunRiseAndSetInformation

    /**
     * Method: displayWeather
     */    
    displayWeather : function( text ) {
	if ( ! text ) return;
	var self = this, attr = self.attr, widget = attr['widget'];
	
	var sun     = self.getSunRiseAndSetInformation( text );
	var weather = self.getWeatherInformation( text );

	widget.innerHTML = weather + sun;

    }, // displayWeather

    /**
     * Method: displayWeather
     */    
    displayInformation : function( text ) {
	text = '<wps:ProcessOutputs><wps:Output><ows:Identifier>placename</ows:Identifier><ows:Title>placename</ows:Title><wps:Data><wps:LiteralData dataType="string">Monsroa</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>terrain</ows:Identifier><ows:Title>terrain</ows:Title><wps:Data><wps:LiteralData dataType="string">Dyrket mark</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>elevation</ows:Identifier><ows:Title>elevation</ows:Title><wps:Data><wps:LiteralData dataType="float" uom="m.a.s.l.">140.0</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>ssrid</ows:Identifier><ows:Title>SSRID</ows:Title><wps:Data><wps:LiteralData dataType="integer">1298156</wps:LiteralData></wps:Data></wps:Output></wps:ProcessOutputs>';

	if ( ! text ) return;
	var self = this, attr = self.attr, widget = attr['widget'], out = [];
	var temp = (text || '').replace(/\r/g,'').replace(/\n/g,'').replace(/\s+/g,' ');
	var list = [], data = {}, reg  = /(.*)(\<wps\:output\>(.*)\<\/wps:output\>)/i;

	do {
	    var test = temp.match( reg );
	    list.push( test[2] || '' );
	    temp = test[1];
	} while( temp.match( reg ) );

	for (var i=0; i<list.length; i++ ) {
	    var test = list[i].match( /\<ows\:identifier\>(.*)\<\/ows\:identifier\>/i ) || [];
	    var key  = test[1];
	    if ( ! key ) continue;

	    if ( ! data[key] ) data[key] = {};

	    test = list[i].match( /\<ows\:title\>(.*)\<\/ows\:title\>/i ) || [];
	    data[key]['title'] = test[1] || '';

	    test = list[i].match( /\<wps\:data\>(.*)\<\/wps\:data\>/i );
	    test = test ? test[1].match( /\>(.*)\<\// ) || test : [];
	    data[key]['value'] = test[1] || '';
	}

	var getViewData = function( key, label ) {
	    return data[key] && data[key]['value'] ? (
	      '<li class="data '+key+'">'+
	        '<span class="label">'+(label || '')+'</span>'+
	        '<span class="value">'+data[key]['value']+'</span>'+
	      '</li>' ) : '';
	};
	
	// placename
	out.push( getViewData('placename', 'STEDSNAVN:' ) );
	
	// coordinate
	var epsg = [Math.round(attr['lon']*100)/100,Math.round(attr['lat']*100)/100];
	for ( var i=0; i<epsg.length; i++ ) {
	    var d = 10, t = epsg[i]+(epsg[i]%1 ? ((epsg[i]*10)%1 ? '':'0') :'.00');
	    if ( t.length < d ) {
		var a = new Array( (d-t.length) + 1 );
		t = a.join('0') + t;
	    }
	    epsg[i] = t;
	}
	out.push(
	    '<li class="data coordinate">'+ 
		'<span class="label name">Koordinater:</span>' +
		'<span class="label description">EPSG 32633 &Oslash;st / Nord</span>' +
		'<span class="value lonlat">'+epsg[0]+', '+epsg[1]+ '</span>'+
	    '</li>'
	);

	//terrain
	out.push( getViewData('terrain', 'Terreng:') );
	
	widget.innerHTML = '<ul id="locationWrapper">' + out.join('')+'</ul>';
    }, // displayWeather

    /**
     * Method: displayAPIrequest
     */    
    displayAPIrequest : function( note ) {
	if ( ! note || ! note['api'] || ! note['id'] ) return;
	var self = this, attr = self.attr, widget = attr['widget'];
	var save = [], api = note['api'], count = api.length, id = note['id'];

	for ( var i=0; i<api.length; i++ ) {
	    var d = api[i], url = d['url'], request = '';
	    if ( d['id'] == 'sunRise' )
		request = self.getSunRequest();
	    else if ( d['id'] == 'weather' )
		request = self.getBaseRequest();
	    else if ( d['id'] == 'place' ) 
		request = self.getPlaceRequest();

	    OpenLayers.Util.createAjaxRequest( function( result ) {
		save.push( result );
		if ( --count == 0 ) {
		    if ( id == 'PMweather' ) 
			self.displayWeather( save.join('') );
		    else if ( id == 'PMinformation' ) 
			self.displayInformation( save.join('') );
		    
		}
	    }, url, request );	    
	}		
    }, // displayAPIreques()

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

	var cnt = '', note = null, loop = data.length;
	for ( var i=0; i<loop; i++ ) {
	    if ( data[i]['id'] == id ) {		
		note = data[i], cnt = note['cnt'], i = loop;
	    }
	}

	widget.setAttribute('class', 'display'+id );
	widget.innerHTML = cnt || '';

	if ( note['api'] ) { 
	    self.displayAPIrequest( note ); 
	}
	else if ( id == 'PMmaid' ) {	    
	    if ( ! attr[id] ) attr[id] = new OpenLayers.Control.EmergencyPoster({});	 
	    if ( attr[id] ) {
		attr[id].drawTermsPopup( widget );
		//attr[id].insertContent( widget );
		//attr[id].activeStep = 'type';
		//attr[id].steps[attr[key].activeStep].draw.apply(attr[key]);
		//attr[id].updateStepProgressPanel();
	    }	    
	}

	OpenLayers.Element.addClass( menu.children[index], 'active' ); 
	setTimeout(function() { // Set timeout only for IE8 
	    self.clearSelection();
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
	    var any = (menu.getAttribute('style') ||'').match(/\d+deg/i);
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
		if ( OpenLayers.Element.hasClass( main, 'display' ) )
		    OpenLayers.Element.removeClass( main, 'display' );
		else if ( any || index > 0 ) {		    
		    self.displayItemWidget( index ); 
		}

		//OpenLayers.Element.hasClass( main, 'display' ) ? 
		//    OpenLayers.Element.removeClass( main, 'display' ) :
		//    self.displayItemWidget( index ); 
		//self._kiet('b...');
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
	menu.setAttribute('style', style);
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
	    var id    = 'id="'+(data[i]['id'] || '')+'"';
	    var title = 'title="'+(data[i]['title'] || '')+'"';
	    items.push( '<li '+id+' '+title+' class="item icon'+(i+1)+'"></li>');
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

    /**
     * Method: getSunRequest
     */    	
    getPlaceRequest : function() {
	return 'request=Execute&service=WPS&version=1.0.0&identifier=elevation&'+
	    'datainputs=['+this.getBaseRequest()+';epsg=4326]';
    }, // getSunRequest

    /**
     * Method: getSunRequest
     */    	
    getSunRequest : function() {
	var self = this, attr = self.attr, date = new Date();
	var time = [date.getFullYear(),date.getMonth()+1,date.getDate()];
	for ( var i=0; i<time.length; i++ ) {
	    if ( time[i]<10 ) time[i] = '0'+time[i];
	}
	return [self.getBaseRequest(),'date='+time.join('-')].join(';'); 
    }, // getSunRequest

    /**
     * Method: getBaseRequest
     */    	
    getBaseRequest : function() {
	var self = this, attr = self.attr;
	return ['lat='+attr['geometry'].lat,'lon='+attr['geometry'].lon].join(';'); 
    }, // getBaseRequest

    /**
     * Method: getUnitSymbol
     */    	
    getUnitSymbol : function( unit ) {
	return ! unit ? '' : (
	    unit == 'percent' ? '%' : (
		unit == 'celcius' ? '&#186;' : (unit || '')
	    ) 
	);
    }, // getUnitSymbol

    /**
     * Method: getDayOfDate
     */    	
    getDayOfDate : function( date ) {
	if ( ! date  ) return '';
	var day = ['S&oslash;ndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','L&oslash;dag'];
	return day[ date.getDay() ] || '';
    }, // getDayOfDate

    /**
     * Method: getHourOfDate
     */    	
    getHourOfDate : function( date ) {
	if ( ! date ) return '00:00';
	var data = [date.getHours(),date.getMinutes()];
	for ( var i=0; i<data.length; i++ ) {
	    if ( data[i] < 10 ) data[i] = '0'+data[i];
	}
	return data.join(':');
    }, // getHourOfDate

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

