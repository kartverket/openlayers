/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.PointMenu = OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonPointMenu',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    attr : { 'ajax':[], 'stroke': {'strokeColor':'#666666','strokeWidth':2}, 'embedAreaSize': [400,300] },
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
	   //'<a href="#CreatePermaLink">LAGE PERMALENKE</a>'+  
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
    	var self, 
    		cName,
    		mapped, 
    		btn;

        self   = this;
        cName = 'btnPointMenu';
		mapped = 'OpenLayers_Control_PointMenu' + self.map.id;
        btn    = OpenLayers.Util.createButton(mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleControls, self));

	self.map.events.register('click', self, self.showPointMenu);
	self.map.events.register('move', self, self.movePointMenu);
	
	OpenLayers.Util.appendToggleToolClick({'self':self});
	
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="emergency-poster icon"><defs><linearGradient id="pointMenuGradient" x1="0%" y1="0%" x2="100%" y2="100%" spreadMethod="pad"><stop offset="0%"   stop-color="#4b8bc2" stop-opacity="1"/><stop offset="100%" stop-color="#0159a3" stop-opacity="1"/></linearGradient></defs><circle cx="32" cy="32" r="31" fill="url(#pointMenuGradient)" stroke="#004179" stroke-width="1"/><path fill="#ffffff" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z"/></svg>');

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

	if ( typeof(self.tracking)=='function' )
	    self.tracking({'module':self,'where':'hideControls'});

	OpenLayers.Element.removeClass(btn, 'active');
	OpenLayers.Element.removeClass(btn, 'simulation');

	if ( main ) OpenLayers.Element.removeClass(main, 'active');
	
	self.deleteModuleData();
    }, //hideControls

    /**
     * Method: showControls
     */	
    showControls: function () {
	var self = this, attr = self.attr, btn = attr['button'], main = attr['main'];
	if ( typeof(self.tracking)=='function' )
	    self.tracking({'module':self,'where':'showControls'});

	if ( ! main ) { 
	    main = self.createPointMenu();
            OpenLayers.Event.observe( attr['widget'], 'click',
	      OpenLayers.Function.bind(self.clickOnPointMenuWidget, self)
	    );
	}
	OpenLayers.Util.renderToggleToolClick({'self': self});
    	OpenLayers.Element.addClass(btn, 'active');
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
		var self,
			attr,
			btn;

		self = this;
		attr = self.attr;
		btn = attr['button'];
		
		OpenLayers.Element.hasClass(btn, 'active') ? self.hideControls() : self.showControls();
    }, // toggleControls

    /**
     * Method: movePointMenu
     */
    movePointMenu: function (e) {
	var self = this, attr = self.attr;
	if (attr['ignorMove']) return;
	
	var btn  = attr['button'], main = attr['main'];
	var test = !btn || !main || ( 
	    !OpenLayers.Element.hasClass(btn,'active') && !OpenLayers.Element.hasClass(btn,'simulation')
	);
	if (test) return;	
	
	if ( typeof(self.tracking)=='function' )
	    self.tracking({'module':self,'where':'movePointMenu'});

	var data  = self.map.getPixelFromLonLat(attr['center']);
	var style = 'left:'+data['x']+'px;top:'+data['y']+'px;';
	
	main.setAttribute('style', style), self.moveEmbedArea();	
    }, // movePointMenu 

    /**
     * Method: deleteEmbedArea
     */
    deleteEmbedArea : function() {
	var self = this, attr = self.attr, area = attr['embedArea'];
	if ( ! area || ! area.length ) return;
	for ( var i=0; i<area.length; i++ )
	    area[i].parentNode.removeChild( area[i] );
	attr['embedArea'] = null;	
    }, //deleteEmbedArea

    /**
     * Method: moveEmbedArea
     */
    moveEmbedArea : function() {
	var self = this, attr = self.attr, area = attr['embedArea'];
	if ( ! area || ! area.length ) return;
	
	var view   = OpenLayers.Util.getWindowSize(), size = attr['embedAreaSize'];
	var points = self.getEmbedAreaPoints( size );
	var basic  = 'position:absolute;z-index:800;background:rgba(0, 0, 0, 0.7);';
	var tw     = points[1][0]-points[0][0];

	style = basic + 'top:0;bottom:0;left:0;width:'+points[0][0]+'px;';
	attr['embedArea'][0].setAttribute( 'style', style );

	style = basic + 'top:0;height:'+points[0][1]+'px;' +
	    'left:'+points[0][0]+'px;width:'+(tw)+'px;';
	attr['embedArea'][1].setAttribute( 'style', style );

	style = basic + 'top:0;bottom:0;right:0;left:'+points[1][0]+'px;';
	attr['embedArea'][2].setAttribute( 'style', style );

	style = basic + 'top:'+points[1][1]+'px;bottom:0;'+
	    'left:'+points[0][0]+'px;width:'+tw+'px;';
	attr['embedArea'][3].setAttribute( 'style', style );
    }, // moveEmbedArea

    /**
     * Method: showPointMenu
     */
    showPointMenu: function ( e, force, center, simular ) {
	var self = this, attr = self.attr; 
	var btn  = attr['button'], main = attr['main'], menu = attr['menu'];

	if (!btn || !main || !OpenLayers.Element.hasClass(btn,'active')) 
	    return;

	if ( typeof(self.tracking)=='function' ) {
	    if( self.tracking({'module':self,'where':'showPointMenu'}) )
		return;
	}
	
	//if ( typeof(self.tracking)=='function' )
	//self.tracking({'module':self,'where':'showPointMenu'});

	self.resetMenuItems(true);
	attr['clickEvent'] = e, attr['simular'] = simular; 
	attr['center']     = center || self.map.getLonLatFromPixel(e.xy);
	attr['lon']        = attr['center'].lon, attr['lat'] = attr['center'].lat; 
       	attr['geometry']   = new OpenLayers.LonLat(
	    attr['lon'], 
	    attr['lat']).transform(self.map.getProjectionObject(),  
	    new OpenLayers.Projection("EPSG:4326")
	);
	
	var actived    = OpenLayers.Element.hasClass(main, 'active');
	var centralize = function() {
	    self.map.setCenter(attr['center']);
	    var h = 450, s = OpenLayers.Util.getWindowSize(),w = [
		parseInt(OpenLayers.Util.getStyle(main,'width')) || 0, 
		parseInt(OpenLayers.Util.getStyle(main,'height')) || 0
	    ];	   
	    
	    w[2] = w[0] / 2, w[3] = w[1] / 2;
	    s[2] = s[0] / 2,s[3] = s[1] / 2;
		    
	    var t = h + w[3], m = s[3] - t, d = 10;
	    if ( m > 0 ) return;
	    
	    if (t + w[3] + d > s[1])
		m += (t + w[3] - s[1] - d);
	    
	    self.map.moveByPx(0, m);
	}; 

	if (actived && ! force ) {
	    attr['menuBFopenCallback'] = centralize;
	    OpenLayers.Element.removeClass(main, 'active');
	    OpenLayers.Element.addClass(main, 'onClose');
	    self.movePointMenu(), setTimeout( function() {
		OpenLayers.Element.addClass(main, 'active');
	    }, 50 );
	} 
	else { 
	    var has = OpenLayers.Element.hasClass( main, 'active'  );
	    centralize(), setTimeout( function() {	   
		OpenLayers.Element.addClass( main, 'active'  ); 	 
		OpenLayers.Element.addClass( main, 'onClose' ); 
		self.toggleMenu( true );
		if ( ! attr['once'] || force ) {
		    attr['once'] = setTimeout( function(){ 
			self.toggleMenu( false ); 
		    }, force && has ? 600 : 100 );		     
		}
	    }, 100 );
	}
    }, // showPointMenu

    /***************************************************************************/

    /**
     * Method: insertDrawPoint
     */
    insertDrawPoint: function (from, to, reset, want) {
    	var self,
    		attr,
    		start,
    		end,
    		line,
    		vector;

		self = this;
		attr = self.attr;
		if (reset) {
			attr['draw'] = {
				'point': [],
				'vector': [],
				'line':[]
			};
		}
		start  = new OpenLayers.Geometry.Point(from[0], from[1]);
		end    = new OpenLayers.Geometry.Point(to[0], to[1]);
		line   = new OpenLayers.Geometry.LineString([start, end]);
		
		vector = new OpenLayers.Layer.Vector();
		vector.addFeatures([new OpenLayers.Feature.Vector(
		    line, null, attr['stroke']
		)]);
		
		attr['draw']['point'].push([start,end]);
		attr['draw']['vector'].push(vector);
		attr['draw']['line'].push(line);       
    }, // insertDrawPoint

    /**
     * Method: 
     */    
    aboutAjaxRequest : function () {
    	var self,
    		attr,
    		list,
    		ajax;

		self = this;
		attr = self.attr;
		list = attr['ajax'];

		while (list.length > 0) {
		    ajax = list.shift();
		    if (ajax) {
		    	ajax.abort();
		    }
		}
    }, // aboutAjaxRequest

    /**
     * Method: convertText2Date
     */    
    convertText2Date : function (text) {
    	var test,
    		i;

		test = ! text ? null : text.match( /(\d{4})\-(\d{2})\-(\d{2})\w(\d{2})\:(\d{2})/ );
		if (!test) {
			return new Date();
		}
		for (i = 1; i < test.length; i++) {
		    test[i] = parseInt(test[i].replace( /^0/,''));
		}
		return new Date(test[1], test[2]-1, test[3], test[4], test[5]);
    }, // convertText2Date

    /**
     * Method: convertDate2Text
     */    
    convertDate2Text : function( date ) {
    	var d,
    		h,
    		i;

		if (!date) {
			return '';
		}
		d = [date.getFullYear(),date.getMonth()+1,date.getDate()];
		h = [date.getHours(),date.getMinutes(),date.getSeconds()];
		
		for (i = 0; i < d.length; i++ ) {
		    if (d[i] < 10) {
		    	d[i] = '0' + d[i];
		    }
		}
		
		for (i = 0; i < h.length; i++) {
		    if (h[i] < 10) {
		    	h[i] = '0' + h[i];
		    }
		}
		
		return d.join('-') + 'T' + h.join(':') + 'Z';
    }, // convertDate2Text

    /**
     * Method: insertXMLtext2Object
     */    
    insertXMLtext2Object : function( text, object ) {
    	var splited,
    		i,
    		j,
    		m,
    		k,
    		s,
    		d;

		if (!object ) {
			object = {};
		}
		splited = text.split( /\/\>/gi );
		for (i = 0; i < splited.length; i++) {
		    m = splited[i].match( /\<(\w+)(.*)/i );
		    k = m ? m[1] : '';
		    if (!k) {
		    	continue;
		    }
		    s = (m[2] || '').split( /\s+/ );
		    if (!object[k]) {
		    	object[k] = {};
		    }
		    for (j = 0; j < s.length; j++) {
				d = s[j].replace( /^\s+/g, '' ).replace( /\"/g, '').split( '=' );
				if (d.length < 2 || !d[0].replace( /\s+/, '')) {
					continue;
				}
				object[k][d[0]] = d[1] + '';
		    }
		}
    }, // insertXMLtext2Object

    /**
     * Method: isIE
     */    
    isIE : function() {
    	var m;
		if (!(navigator.appName).match('Microsoft Internet Explorer')) {
			return 0;	
		} 
		m = (navigator.appVersion).match( /MSIE\s([\d\.]+)/);
		return m && m[1] ? parseFloat(m[1]) : 0; 
    }, // isIE

    /**
     * Method: clearSelection
     */  	
    clearSelection : function () {
	if (window.getSelection) {
	    window.getSelection().removeAllRanges();
	} else if ( document.selection ) {
	    document.selection.empty();
	}
    }, // clearSelection

    /**
     * Method: goBackViewMenu
     */  	
    goBackViewMenu : function () {
	var self  = this, attr = self.attr, menu = attr['menu'];
	var index = parseInt(menu.getAttribute('data-view')) || 0;
	self.displayItemWidget(index), self.deleteModuleData();
    }, // goBackViewMenu
	
    /**
     * Method: clickOnPointMenuWidget
     */  
    clickOnPointMenuWidget : function(e) {
	if ( ! e ) e = window.event;

	var target = e.target || e.srcElement; 
	if ( OpenLayers.Element.hasClass(target,'realLink') ) return;

	OpenLayers.Util.preventDefaultEvent(e);
	var self   = this, attr = self.attr, data = self.data, added = false;			
	var widget = attr['widget'], main = attr['main'], menu = attr['menu'];
	var key    = (target.getAttribute('href') || '').replace(/^\#/, '');

	if (key === 'goBack' ) {
	    self.goBackViewMenu();
	} 
	else if (key === 'ShareMapView') {
	    if ( ! attr[key] ) {
		attr[key] = new OpenLayers.Control.GetURL({});
	    }
	    widget.setAttribute('class', 'display' + key);
	    widget.innerHTML = attr[key] && attr[key].getContent ? attr[key].getContent(attr['center']) : '';
	    added = true;	    
	} 
	else if (key == 'UseMapView'){
	    attr[key] = new OpenLayers.Control.Embed({});
	    widget.setAttribute('class', 'display' + key);
	    if (attr[key] && attr[key].insertContent ) {
		attr[key].setMap( self.map, function( data ) {
		    if ( ! data || ! data['module'] ) return;
 
		    if ( data['step']=='area' ) 
			self.drawEmbedArea( data );
		    else if ( data['step']=='markers' )
			self.drawEmbedMarker( data ); 
		    else if ( data['step']=='end' )
			self.goBackViewMenu();
 
		    //if ( data['step']=='markers' || data['step']=='area' ) {
		    if ( data['step']=='area' ) {
			setTimeout( function() {
			    data['clicked'] == 'next' ?
				data['module'].nextButton.click() :
				data['module'].backButton.click();
			}, 20 );
		    }
		});
		attr[key].insertContent( widget );
		attr[key].activeStep = 'type';
		attr[key].steps[attr[key].activeStep].draw.apply(attr[key]);
		attr[key].updateStepProgressPanel();
		
		var steps = attr[key].stepProgressPanel ? 
		    (attr[key].stepProgressPanel.children || []) : [];
		
		for ( var j=0; j<steps.length; j++ ) {
		    var bool = OpenLayers.Element.hasClass(steps[j], 'area');
		    if (bool) OpenLayers.Element.addClass(steps[j], 'disabled');
		}
		added = true;
	    }
	}
	
	if ( added ) {
	    OpenLayers.Element.addClass(widget,  'hasBackArrrow');
	    var back = document.createElement('a');
	    back.setAttribute('class', 'goBackButton'        );
	    back.setAttribute('href',  '#goBack'             );
	    back.setAttribute('title', 'Tilbake forrige meny');
	    widget.appendChild(back);
	}
	
	return false;
    }, // clickOnPointMenuWidg

    /**
     * Method: insertDrawPoint
     */
    getEmbedAreaPoints: function ( size, lonlat ) {
	var self = this, attr = self.attr; 
	if ( ! attr['center'] ) return;
	
	var area   = size ? [size[0]||0, size[1]||0] : [0,0];
	var center = self.map.getPixelFromLonLat(attr['center']);	

	// Creating tl (top left) and br (bottom right) points of a square.
	var w  = parseInt( area[0] / 2 ), h = parseInt( area[1] / 2 );
	var tl = [parseInt(center['x']-w), parseInt(center['y']-h)];
	var br = [parseInt(center['x']+w), parseInt(center['y']+h)];

	return lonlat ? [
	    self.map.getLonLatFromPixel({'x':tl[0],'y':tl[1]}),
	    self.map.getLonLatFromPixel({'x':br[0],'y':br[1]})
	] : [ tl, br ];
    },

    /**
     * Method: drawEmbedArea
     */
    drawEmbedArea : function( data ) {
	var self = this, attr = self.attr, embed = data['module'];
	var controller = embed ? embed.boxControl : null;	
	if ( ! controller || ! controller['handler'] ) return;

	if ( ! attr['embedArea'] ) {
	    attr['embedArea'] = [
		document.createElement('div'),
		document.createElement('div'),
		document.createElement('div'),
		document.createElement('div')
	    ];
	    
	    for ( var i=0; i<attr['embedArea'].length; i++ )
		document.body.appendChild( attr['embedArea'][i] );
	}

	var event = attr['clickEvent'], size = attr['embedAreaSize'];

	if ( ! attr['simular'] ) {
            controller['handler']['down'](event);
            controller['handler']['move'](event);
	}

        embed.data = {'centerX':attr['lon'],'centerY':attr['lat'], 'width':size[0],'height':size[1]};
	
	self.moveEmbedArea();
    }, // drawEmbedArea

    /**
     * Method: drawEmbedMarker
     */
    drawEmbedMarker : function( data ) {
	var self  = this, attr = self.attr, timer = 0; 
	var embed = data['module'], event = attr['clickEvent'];
	if ( ! embed || ! event ) return;
	
	var note = embed['stepSpecificElements'] ? 
	    embed['stepSpecificElements']['instructions'] : null; 
	
	if ( ! event['lonLat'] )
	    event['lonLat'] = {'lon':attr['lon'],'lat':attr['lat']};

	var value = attr['embedMarkerComment'] || ''; 
	var id    = 'PointMenuEmbedMarkerComment';
	note.innerHTML = '<label>Skriv inn kommentar</label>' + 
	    '<input type="text" id="'+id+'" value="'+value+'">';

	var field = document.getElementById( id );
	if ( ! field ) return;
	
	var render = function( e ) {
	    var list = embed['stepSpecificElements']['markerList'] ? 
		(embed['stepSpecificElements']['markerList'].children || []) : [];
	    for ( var i=0; i<list.length; i++ ) {
		var btn = document.getElementById( 'remove-'+(list[i].id) );
		if ( btn ) btn.click();
	    }

	    field.focus(), setTimeout( function() { field.focus(); }, 50 );
	    attr['embedMarkerComment'] = field.value;
	    if ( ! attr['embedMarkerComment'] ) return;
	    
	    embed.embedMarkerPointSelectHandler( event, true );
	    embed.confirmAddedMarker( event, attr['embedMarkerComment'] );	
	    
	    var pin = document.getElementById('nk-user-marker');
	    if ( pin ) pin.style.display = 'none';
	};

	OpenLayers.Event.observe( field, 'keyup', function(e){	   
	    clearTimeout( timer );
	    timer = setTimeout( function() { render( e ); }, 300 );
	});
    }, // drawEmbedMarker

    /**
     * Method: getWeatherInformation
     */    
    getWeatherInformation : function(text) {
    	var self,
    		attr,
    		test,
    		now,
    		from,
    		to,
    		cc,
    		cf,
    		ct,
    		tt,
    		note,
    		pin,
    		reg,
    		splited,
    		i,
    		j,
    		m,
    		description,
    		out,
    		hour,
    		night,
    		unit,
    		src,
    		style;

		if (!text) {
			return '';
		}
		self = this;
		attr = self.attr;
		test = null;
		
		now  = new Date();
		from = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),0,0,0);
		to   = new Date(from.getTime() + (1000 * 60 * 60 * 6));
		cc   = new Date(from.getTime() + (1000 * 60 * 60));

		cf   = self.convertDate2Text(from); 
		ct   = self.convertDate2Text(to);
		tt   = self.convertDate2Text(cc);

		note = {};
		pin = [];
		reg = [
		   OpenLayers.Util.createRegExp('from="' + tt + '" to="' + tt + '"', true, true, false, false), 
		   OpenLayers.Util.createRegExp('from="' + cf + '" to="' + ct + '"', true, true, false, false)
		];

		splited = (text || '').replace( /\r\n/g, '' ).split( /\<\/time\>/gi );
		for (i = 0; i < splited.length; i++) {
		    for (j = 0; j < reg.length; j++) {
				if (splited[i].match(reg[j])) {
				    m = splited[i].match( /\<location.*?\>(.*)\<\/location\>/i );
				    pin[j] = m[1];
				}    
		    }
		}

		for (i = 0; i < pin.length; i++) {
		    self.insertXMLtext2Object(pin[i], note);
		}
	 
		description = [];
		out = [
		    '<li class="data date">' +
			'<span class="date">' + self.getDayOfDate(from) + '</span>' +
			' kl ' +
			'<span class="time">' +
			  self.getHourOfDate(from) + ' - ' + self.getHourOfDate(to) +
			'</span>'+
		    '</li>'
		];

		// temperature
		if (note['temperature'] && note['symbol'] ) {
		    hour  = from.getHours();
		    night = hour >= 16 || hour < 4;
		    unit  = note['temperature']['unit'] || '';
		    src   = 'http://api.yr.no/weatherapi/weathericon/1.0/?symbol='+
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
		if (note['humidity']) {	    
		    description.push('<span class="humidity">' + note['humidity']['value'] + ' ' + self.getUnitSymbol( note['humidity']['unit'] ) + ' luftfuktighet' + '</span>');
		}

		// precipitation
		if (note['precipitation']) {
		    description.push('<span class="precipitation">' + note['precipitation']['value'] + ' ' + self.getUnitSymbol( note['precipitation']['unit'] ) + ' nedb&oslash;r' + '</span>');
		}

		out.push('<li class="data description">' + description.join(', ') + '</li>');

		style = note['symbol'] ? (note['symbol']['id'] || '') : '';
		return '<ul id="weatherWrapper" class="' + style + '">' + out.join('') + '</ul>';
    }, // getWeatherInformation

    /**
     * Method: getSunRiseAndSetInformation
     */    
    getSunRiseAndSetInformation : function(text) {
    	var self,
    		attr,
    		test,
    		sun,
    		moon,
    		sRise,
    		sSet,
    		mRise,
    		mSet,
    		regexp,
    		i,
    		s,
    		t;

		if (!text) {
			return '';
		}
		self = this;
		attr = self.attr;
		test = null;

		test = text.match( /\<sun\s(.*)/i );
		sun  = test ? test[1] : ''; 
	 
		test = text.match( /\<moon\s(.*)/i );
		moon  = test ? test[1] : ''; 

		sRise  = '';
		sSet = '';
		mRise = '';
		mSet = '';
		regexp = /(^|\s)(rise|set)\=\"([\w\d\.\_\-\:\.]+)\"/gi;

		test = sun.match(regexp) || [];
		for (i = 0; i < test.length; i++) {
		    s = test[i].replace( /[\"\s]+/g, '').split('='); 
		    t = (s[1]||'').match( /\w(\d{2}\:\d{2})/ );
		    if (s[0].match(/^rise$/)) {
				sRise = t[1] || '';
		    } else if ( s[0].match(/^set$/) ) {
				sSet = t[1] || '';
		    }  
		}
		
		test = moon.match(regexp) || [];
		for (i = 0; i < test.length; i++) {
		    s = test[i].replace( /[\"\s]+/g, '').split('='); 
		    t = (s[1]||'').match( /\w(\d{2}\:\d{2})/ );
		    if (s[0].match(/^rise$/)) {
				mRise = t[1] || '';
		    } else if (s[0].match(/^set$/)) {
				mSet = t[1] || '';
		    }
		}

		return '<ul id="sunMoonWrapper">'+	    
		  '<li class="sunRiseAndSetWrapper">' +
		    '<div class="sunRise">'+
		      '<span class="label">Soloppgang</span>'+
		      '<span class="value">' + sRise + '</span>'+
		    '</div>'+
		    '<div class="sunSet">'+
		      '<span class="label">Solnedgang</span>'+
		      '<span class="value">' + sSet + '</span>'+
		    '</div>'+
		  '</li>' +
		  '<li class="moonRiseAndSetWrapper">' +
		    '<div class="moonRise">'+
		      '<span class="label">M&aring;neoppgang</span>'+
		      '<span class="value">' + mRise + '</span>'+
		    '</div>'+
		    '<div class="moonSet">'+
		      '<span class="label">M&aring;nenedgang</span>'+
		      '<span class="value">' + mSet + '</span>'+
		    '</div>'+
		  '</li>' +
		'</ul>';	
    }, // getSunRiseAndSetInformation

    /**
     * Method: displayWeather
     */    
    displayWeather : function( text ) {
	if ( ! text ) return;
	
	var self    = this, attr = self.attr, widget = attr['widget'];
	var sun     = self.getSunRiseAndSetInformation( text );
	var weather = self.getWeatherInformation( text );

	widget.innerHTML = weather + sun +
	    '<a href="http://met.no/" target="_blank" class="realLink weatherReference">' +
	      'Data fra Meteorologisk institutt' +
	    '</a>';
    }, // displayWeather

    /**
     * Method: displayInformation
     */    
    displayInformation : function(text) {
	if ( !text ) return;
	
	//text = '<wps:ProcessOutputs><wps:Output><ows:Identifier>placename</ows:Identifier><ows:Title>placename</ows:Title><wps:Data><wps:LiteralData dataType="string">Monsroa</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>terrain</ows:Identifier><ows:Title>terrain</ows:Title><wps:Data><wps:LiteralData dataType="string">Dyrket mark</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>elevation</ows:Identifier><ows:Title>elevation</ows:Title><wps:Data><wps:LiteralData dataType="float" uom="m.a.s.l.">140.0</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>ssrid</ows:Identifier><ows:Title>SSRID</ows:Title><wps:Data><wps:LiteralData dataType="integer">1298156</wps:LiteralData></wps:Data></wps:Output></wps:ProcessOutputs>';

	var self = this, attr = self.attr, widget = attr['widget'], out = [];
	var temp = (text || '').replace(/\r/g,'').replace(/\n/g,'').replace(/\s+/g,' ');
	var list = [], data = {}, reg  = /(.*)(\<wps\:output\>(.*)\<\/wps:output\>)/i;

	do {
	    test = temp.match(reg) || [];
	    list.push(test[2] || '');
	    temp = test[1] || '';
	} while (temp.match(reg));
	
	for (var i=0; i <list.length; i++) {
	    var test = list[i].match( /\<ows\:identifier\>(.*)\<\/ows\:identifier\>/i ) || [];
	    var key  = test[1];
	    if ( !key ) continue;

	    if ( !data[key] )data[key] = {};
	    	    
	    test = list[i].match( /\<ows\:title\>(.*)\<\/ows\:title\>/i ) || [];
	    data[key]['title'] = test[1] || '';

	    test = list[i].match( /\<wps\:data\>(.*)\<\/wps\:data\>/i );
	    test = test ? test[1].match( /\>(.*)\<\// ) || test : [];
	    data[key]['value'] = test[1] || '';
	} // end of for loop

	getViewData = function (key, label) {
	    return data[key] && data[key]['value'] ? (
		'<li class="data ' + key + '">' + 
		    '<span class="label">' + (label || '') + '</span>' + 
		    '<span class="value">' + data[key]['value'] + '</span>' + 
		'</li>'
	    ) : '';
	};
		
	// placename
	out.push( getViewData('placename', 'STEDSNAVN:' ) );
	
	// coordinate
	var epsg = [Math.round(attr['lon']*100)/100,Math.round(attr['lat']*100)/100];
	for ( var i=0; i<epsg.length; i++) {
	    var d = 10, t = epsg[i] + (epsg[i] % 1 ? ((epsg[i] * 10) % 1 ? '' : '0') : '.00');	    
	    
	    if (t.length < d) {
		var a = new Array((d - t.length) + 1);
		t = a.join('0') + t;
	    }
	    epsg[i] = t;
	}
	out.push(
	    '<li class="data coordinate">' + 
		'<span class="label name">Koordinater:</span>' +
		'<span class="label description">EPSG 32633 &Oslash;st / Nord</span>' +
		'<span class="value lonlat">' + epsg[0] + ', ' + epsg[1] + '</span>' +
		'<div id="PMcoordinate"></div>' +
	    '</li>'
	);

	// terrain
	out.push(getViewData('terrain', 'Terreng:'));		

	// elevation
	out.push(getViewData('elevation', 'H&oslash;yde:'));

	widget.innerHTML = '<ul id="locationWrapper">' + out.join('') + '</ul>';
	
	var trf = new OpenLayers.Control.Transformations({
	    'url': self.url
	});
	trf.setCnt( document.getElementById('PMcoordinate') ); 
	trf.insertContent( {'lon':attr['lon'],'lat':attr['lat']} );
	
	//var btn = document.getElementById('transformations-output-coordinate-system-submit-button');
	var slc = document.getElementById('transformations-output-coordinate-system');
	slc ? OpenLayers.Event.observe(slc, 'change', function(e){
	    trf.transform( e, true );
	}) : null;

	trf.transform( attr['clickEvent'], true );
    }, // displayInformation

    /**
     * Method: displayAPIrequest
     */    
    displayAPIrequest : function (note) {
    	var self,
    		attr,
    		widget,
    		save,
    		api,
    		count,
    		id,
    		i,
    		d,
    		url,
    		request;

		if (!note || !note['api'] || !note['id']) {
			return;
		}
		self = this;
		attr = self.attr;
		widget = attr['widget'];

		save = [];
		api = note['api'];
		count = api.length;
		id = note['id'];

		for (i = 0; i < api.length; i++) {
		    d = api[i];
		    url = d['url'];
		    request = '';

		    if (d['id'] === 'sunRise') {
				request = self.getSunRequest();
		    } else if (d['id'] === 'weather') {
				request = self.getBaseRequest();
		    } else if (d['id'] === 'place') {
				request = self.getPlaceRequest();
			}

		    attr['ajax'].push(
		    	OpenLayers.Util.createAjaxRequest(
			    	function (result) {
						save.push(result);
						if ( --count === 0 ) {

						    if (id === 'PMweather') {
								self.displayWeather(save.join(''));
						    } else if (id === 'PMinformation') {
								self.displayInformation(save.join(''));
							}
						}
			    	},
			    	url,
			    	request
			    )
			);	 
		}
    }, // displayAPIreques()

    /**
     * Method: displayItemWidget
     */    
    displayItemWidget : function ( index ) {
	var self = this, attr = self.attr, data = self.data;
	var main = attr['main'], menu = attr['menu'], widget = attr['widget'];
	
	if (typeof index !== 'number') {
	    index = parseInt(menu.getAttribute('data-view'));
	    if (typeof index !== 'number') return;
	}
		
	if ( ! menu.children[index] ) return;
	
	var id = menu.children[index].id;
	if ( !id ) return;
		

	var cnt = '', note = null, loop = data.length;
	for ( var i=0; i<loop; i++ ) {
	    if (data[i]['id'] === id) {		
		note = data[i], cnt = note['cnt'], i = loop;
	    }
	}
	
	self.aboutAjaxRequest(), self.deleteModuleData();
	
	widget.setAttribute('class', 'display' + id);
	widget.innerHTML = cnt || '';
	
	if ( note['api'] ) { 
	    self.displayAPIrequest(note); 
	} 
	else if (id == 'PMmaid') {	    
	    if (!attr[id]) {
		attr[id] = new OpenLayers.Control.EmergencyPoster({});
	    }
	    if (attr[id]) {
		attr[id].setCoordinate(attr['center']);
		attr[id].drawTermsPopup(widget);
		//attr[id].insertContent( widget );
		//attr[id].activeStep = 'type';
		//attr[id].steps[attr[key].activeStep].draw.apply(attr[key]);
		//attr[id].updateStepProgressPanel();
	    }	    
	}
	
	OpenLayers.Element.addClass(menu.children[index], 'active'); 
	setTimeout(function() { // Set timeout only for IE8 
	    self.clearSelection();
	    OpenLayers.Element.addClass( main, 'display' ); 
	}, 50 );
	
    }, // displayItemWidget

    /**
     * Method: rotateToItem
     */    
    rotateToItem : function (index) {
    	var self,
    		attr,
    		main,
    		menu,
    		list,
    		loop,
    		temp,
    		count,
    		c,
    		j,
    		any,
    		now,
    		degree,
    		next,
    		temp,
    		style;

		self = this;
		attr = self.attr;
		if (!index) {
			index = 0;
		}

		main = attr['main'];
		menu = attr['menu'];
		list = menu.children || [];
		loop = list.length;

		if (attr['ie'] && attr['ie']<10) {
		    if (!attr['first']) {
		    	attr['first'] = menu.children[0].id;
		    }
		    temp = [];
		    count = loop;
		    c = 0;

		    while (count-- > 0) {
				j = (index + (c++)) % loop;
				temp.push(list[j].id);
				OpenLayers.Element.removeClass(list[j],'active');
		    }

		    for (i = 0; i < loop; i++) { 
				list[i].id = temp[i];
			}
		    self.displayItemWidget( 0 );
		} else {
		    any = (menu.getAttribute('style') ||'').match(/\d+deg/i);
		    now = parseInt(menu.getAttribute('data-view')) || 0;
		    degree = 60;
		    next = index * degree;
		    temp = '-moz-transform: rotateZ(NUMBERdeg);' +
			'-webkit-transform: rotateZ(NUMBERdeg);'+
			'-o-transform: rotateZ(NUMBERdeg);'+
			'transform: rotateZ(NUMBERdeg);';
		    style = temp.replace( /NUMBER/g, next );

		    for (i = 0; i < loop; i++) {
				if (!list[i].id || list[i].id === 'offButton') {
					continue;
				}

				OpenLayers.Element.removeClass(list[i],'active');
				list[i].setAttribute('style', style );
		    }

		    menu.setAttribute('style', temp.replace( /NUMBER/g, next * -1));

		    if (now === index) {
				if (OpenLayers.Element.hasClass(main, 'display')) {
				    OpenLayers.Element.removeClass(main, 'display');
				} else if (any || index > 0) {		    
				    self.displayItemWidget(index); 
				}
		    } else { 
				OpenLayers.Element.removeClass( main, 'display' );
		    }
		}
		menu.setAttribute('data-view', index + '');
    }, // rotateToItem

    /**
     * Method: toggleMenu
     */    
    toggleMenu : function (force) {
    	var self,
    		attr,
    		main,
    		menu,
    		close,
    		temp,
    		style,
    		order,
    		loop,
    		count,
    		index,
    		c,
    		i,
    		j;

		self = this;
		attr = self.attr;
		main = attr['main'];
		menu = attr['menu'];
		close = typeof(force) === 'boolean' ? force : (!OpenLayers.Element.hasClass(main, 'onClose'));

		temp  = 'left:NUMBER%;top:NUMBER%;right:NUMBER%;bottom:NUMBER%;' +
		    (attr['ie'] && attr['ie'] < 9 ? '' : 'opacity:OPACITY; filter:alpha(opacity=ALPHA);');

		style = temp.replace( /NUMBER/g, close ? '100' : '0').replace(/OPACITY/g, close ? '0' : '1').replace(/ALPHA/g, close ? '0' : '100');

		if ( close ) {
		    OpenLayers.Element.addClass(main,'onClose'); 
		    OpenLayers.Element.removeClass(main,'onOpen');
		    OpenLayers.Element.removeClass(main,'display');

		    menu.removeAttribute('data-view');
		    self.resetMenuItems();

		    if (attr['ie'] && attr['ie'] < 10) {
				order = [];
				loop = menu.children.length;
				count = loop;
				index = 0;
				c = 0;

				for (i = 0; i < loop; i++) {
				    if (menu.children[i].id === attr['first']) {
						index = i;
						i = loop;
				    }
				}

				while (count-- > 0 ) {
				    j = (index + (c++)) % loop;
				    order.push(menu.children[j].id); 
				    OpenLayers.Element.removeClass(menu.children[j], 'active');
				}

				for (i = 0; i < loop; i++) { 
				    menu.children[i].id = order[i]; 
				}
		    }
		} else {   
		    if (attr['menuBFopenCallback']) {
				attr['menuBFopenCallback']();
				attr['menuBFopenCallback'] = null;
		    }
		    OpenLayers.Element.removeClass(main, 'onClose'); 
		    OpenLayers.Element.addClass(main, 'onOpen'); 
		}
		menu.setAttribute('style', style);
    }, // toggleMenu

    /**
     * Method: createPointMenu
     */    
    clickOnPointerMenuItem : function (e) {
	if ( !e ) e = window.event;
		
	var target = e.target || e.srcElement, id = target.id;
	if ( !id ) return;
		
	var self = this, attr = self.attr;
	var main = attr['main'], tool = attr['tool'], menu = attr['menu'];

	if (id === 'PMcloser' || id === 'PMopener') {
	    self.toggleMenu(id === 'PMcloser');
	    self.deleteModuleData();
	} 
	else {
	    var list = menu.children, loop = list.length, index = -1;	    
	    for (var i = 0; i < loop; i++) {
		if (list[i].id === id) {
		    index = i, i = loop;
		}
	    }

	    if ( index >= 0 ) { 
		self.deleteModuleData();
		self.rotateToItem( index );
	    }
	}
    }, // clickOnPointerMenuItem

    /**
     * Method: pointMenuEndHandler
     */    
    pointMenuEndHandler : function (e) {
	var self = this, attr = self.attr;
	if (e.target.id !== attr['menu'].id) return;

	if ( typeof(self.tracking)=='function' ) {
	    if ( self.tracking({'module':self,'where':'pointMenuEndHandler'}) )
		return;
	}

	clearTimeout(attr['pointMenuEndHandlerTImeout'] || 0);
	attr['pointMenuEndHandlerTImeout'] = setTimeout( function() {
	    var main   = attr['main'], menu = attr['menu'];
	    var close  = OpenLayers.Element.hasClass(main, 'onClose');
	    var onOpen = OpenLayers.Element.hasClass(main, 'onOpen');
	    var callback = attr['menuEndCallback'];
	    attr['menuEndCallback'] = null;

	    //removeClass(main, 'onOpen');
	    if ( close ) {
		self.resetMenuItems();		
		if (callback) callback();
		
	    } 
	    else if (onOpen) {
		if (menu.clientWidth ) {
		    setTimeout( function() { 
			OpenLayers.Element.removeClass(main, 'onOpen'); 
			if ( callback ) callback();
				
		    }, 50 );
		}
	    } 
	    else if (!onOpen) {
		self.displayItemWidget();
		if (callback) callback();
		
	    }
	}, 30 );
    }, // pointMenuEndHandler

    /**
     * Method: resetMenuItems
     */    
    resetMenuItems : function (force) {
	var self = this, attr = self.attr; 
	var menu = attr['menu'], main = attr['main'];

	for ( var i=0; i < menu.children.length; i++) {
	    menu.children[i].removeAttribute('style');
	    OpenLayers.Element.removeClass(menu.children[i], 'active');
	}
	
	if ( force ) {
	    menu.removeAttribute('style');
	    main.removeAttribute('style');
	    OpenLayers.Element.removeClass(main, 'display');
	    self.deleteModuleData();
	}
    }, // resetMenuItems

    deleteModuleData : function() {
	var self = this, attr = self.attr; 	
	if ( attr['UseMapView'] && attr['UseMapView'].deleteStepData ) {
	    attr['UseMapView'].deleteStepData();
	    attr['UseMapView'] = null, attr['embedMarkerComment'] = null;	    
	    self.deleteEmbedArea();
	}
    },

    /**
     * Method: createPointMenu
     */
    createPointMenu: function () {
    	var self,
    		attr,
    		data,
    		items,
    		i,
    		id,
    		title,
    		menu,
    		widget,
    		tool,
    		main,
    		end;

		self = this;
		attr = self.attr;
		data = self.data;
		items = [];

		for (i = 0; i < data.length; i++) {
		    id    = 'id="' + (data[i]['id'] || '') + '"';
		    title = 'title="' + (data[i]['title'] || '') + '"';
		    items.push( '<li ' + id + ' ' + title + ' class="item icon' + (i + 1) + '"></li>');
		}

		menu   = '<ul id="PMmenu">' + items.join('') + '</ul>';
		widget = '<div id="PMwidget"></div><div id="PMarrow"></div>';
		tool   = '<ul id="PMtool">' +
		    '<li id="PMcloser" class="item"></li>'+
		    '<li id="PMopener" class="item"></li>'+
		    '</ul>';

		main = document.createElement('div');
		main.setAttribute('id', 'pointMenu');
		main.innerHTML = widget + tool + menu;
		document.body.appendChild(main);

		attr['ie']     = self.isIE();
		attr['main']   = document.getElementById('pointMenu');
		attr['tool']   = document.getElementById('PMtool');
		attr['menu']   = document.getElementById('PMmenu');
		attr['widget'] = document.getElementById('PMwidget');

		for (i = 0; i < attr['menu'].children.length; i++) {
		    if (OpenLayers.Element.hasClass(attr['menu'].children[i], 'item')) {
				OpenLayers.Event.observe( 
				    attr['menu'].children[i], 
				    'click',
				    OpenLayers.Function.bind(self.clickOnPointerMenuItem, self)
				);
		    }
		}

		for (i = 0; i < attr['tool'].children.length; i++) {
		    if (OpenLayers.Element.hasClass(attr['tool'].children[i],'item')) {
				OpenLayers.Event.observe( 
				    attr['tool'].children[i],
				    'click',
				    OpenLayers.Function.bind(self.clickOnPointerMenuItem, self)
				);
		    }
		}

		end = ['webkitTransitionEnd', 'oTransitionEnd otransitionend', 'MSTransitionEnd', 'transitionend'];
		for (i = 0; i < end.length; i++) {
		    OpenLayers.Event.observe(
		    	attr['menu'],
		    	end[i],
		    	OpenLayers.Function.bind(self.pointMenuEndHandler, self)
		    );
		}
    }, // createPointMenu

    /**
     * Method: getSunRequest
     */    	
    getPlaceRequest : function () {
		return 'request=Execute&service=WPS&version=1.0.0&identifier=elevation&datainputs=[' + this.getBaseRequest() + ';epsg=4326]';
    }, // getSunRequest

    /**
     * Method: getSunRequest
     */    	
    getSunRequest : function() {
    	var self,
    		attr,
    		date,
    		time,
    		i;

		self = this;
		attr = self.attr;
		date = new Date();
		time = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
		for (i = 0; i < time.length; i++) {
		    if (time[i] < 10) {
		    	time[i] = '0' + time[i];
		    }
		}
		return [self.getBaseRequest(), 'date=' + time.join('-')].join(';'); 
    }, // getSunRequest

    /**
     * Method: getBaseRequest
     */    	
    getBaseRequest : function() {
    	var self,
    		attr;
		self = this;
		attr = self.attr;
		return ['lat=' + attr['geometry'].lat, 'lon=' + attr['geometry'].lon].join(';'); 
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
    getDayOfDate : function (date) {
    	var day;

		if (!date) {
			return '';
		}
		day = ['S&oslash;ndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','L&oslash;dag'];
		return day[date.getDay()] || '';
    }, // getDayOfDate

    /**
     * Method: getHourOfDate
     */    	
    getHourOfDate : function (date) {
    	var data,
    		i;

		if (!date) {
			return '00:00';
		}

		data = [date.getHours(),date.getMinutes()];
		for (i = 0; i < data.length; i++) {
		    if (data[i] < 10) {
		    	data[i] = '0' + data[i];
		    }
		}
		return data.join(':');
    }, // getHourOfDate

    CLASS_NAME: "OpenLayers.Control.PointMenu"
}); // OpenLayers.Control.PointMenu

OpenLayers.Util.extend(OpenLayers.Lang.nb, {
    'Copy the following address to share this page': 'Klipp og lim følgende tekst for å dele denne siden'
});