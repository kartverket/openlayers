/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 * @requires OpenLayers/Util/preciseRound.js
 */
OpenLayers.Control.PointMenu = OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonPointMenu',
    // svg graphics
    menuButtonIcon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="emergency-poster icon"><defs><linearGradient id="pointMenuGradient" x1="0%" y1="0%" x2="100%" y2="100%" spreadMethod="pad"><stop offset="0%"   stop-color="#4b8bc2" stop-opacity="1"/><stop offset="100%" stop-color="#0159a3" stop-opacity="1"/></linearGradient></defs><circle cx="32" cy="32" r="31" fill="url(#pointMenuGradient)" stroke="#004179" stroke-width="1"/><path fill="#ffffff" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z"/></svg>',
    PMSprite: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64px" height="128px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="point-menu minus icon"><defs><linearGradient id="pointMenuSpriteGradient" x1="0%" y1="0%" x2="100%" y2="100%" spreadMethod="pad"><stop offset="0%" stop-color="#4b8bc2" stop-opacity="1"/><stop offset="100%" stop-color="#0159a3" stop-opacity="1"/></linearGradient><circle cx="32" cy="32" r="31" fill="url(#pointMenuSpriteGradient)" stroke="#004179" stroke-width="1" id="backgroundCircle"/><symbol id="minus"><use xlink:href="#backgroundCircle" x="0" y="0"/><path fill="#ffffff" d="m14,27.5 36,0 0,9 -36,0z"/></symbol><symbol id="plus"><use xlink:href="#backgroundCircle" x="0" y="0"/><path fill="#ffffff" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z"/></symbol></defs><use xlink:href="#minus" y="32" x="0"/><use xlink:href="#plus" y="-32" x="0"/></svg>',
    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    attr : { 'ajax':[], 'stroke': {'strokeColor':'#666666','strokeWidth':2}, 'embedAreaSize': [400,300] },
    data : [
	{'id'   : 'PMinformation',
	 'title': 'Informasjon om dette punktet',
	 'img'  : 'img/pointMenuInformation.png',
	 'svg'	: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="210px" height="415px" viewBox="0 0 210 415" class="info icon" preserveAspectRatio="xMidYMid meet"><path fill-rule="evenodd" clip-rule="evenodd" d="M79.756,175.312c4.427-11.382-1.271-17.078-6.34-17.078c-23.407,0-53.804,55.063-65.174,55.063c-4.447,0-8.242-4.442-8.242-8.235c0-11.396,27.845-37.972,36.089-46.203c25.308-24.05,58.228-42.404,94.938-42.404c27.209,0,56.333,16.449,33.546,77.86l-45.579,123.406c-3.783,9.495-10.746,25.332-10.746,35.454c0,4.425,2.518,8.866,7.581,8.866c18.978,0,53.807-53.807,62.672-53.807c3.158,0,7.58,3.787,7.58,9.486c0,18.355-74.041,96.846-137.973,96.846c-22.787,0-38.61-10.748-38.61-34.804c0-30.376,21.513-82.281,25.965-93.05L79.756,175.312z M113.927,50.624c0-27.843,24.048-50.624,51.9-50.624c25.332,0,43.677,17.076,43.677,43.033c0,29.128-24.041,50.652-52.526,50.652C131.027,93.685,113.927,76.585,113.927,50.624"/></svg>',
	 'cnt'  : '<div class="loading">Lasting...</div>',
	 'api'  : [
	     {'id':'place', 'url':'http://openwps.statkart.no/skwms1/wps.elevation'}
	 ]
	},
	{'id'   : 'PMweather',
	 'title': 'V&aelig;ret',
	 'img'  : 'img/pointMenuWeather.png',
	 'svg'	: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="458px" height="452px" viewBox="0 0 458 452" class="icon weather" preserveAspectRatio="xMidYMid meet"><path d="M411.683,320.966c1.684-6.473,2.584-13.309,2.584-20.337c0-44.345-35.955-80.33-80.315-80.33c-33.356,0-61.935,20.353-74.103,49.293c-10.398-12.263-25.932-20.041-43.296-20.041c-31.393,0-56.838,25.438-56.838,56.849c0,5.393,0.769,10.611,2.16,15.58c-25.638,9.39-43.92,34.009-43.92,62.936c0,36.972,29.973,66.988,66.991,66.988h206.526c37.053,0,67.025-30.017,67.025-66.988C458.497,354.915,438.825,329.553,411.683,320.966 M183,66.405c10.662,0,19.295-8.635,19.295-19.313V19.298C202.295,8.651,193.662,0,183,0c-10.628,0-19.261,8.651-19.261,19.298v27.794C163.739,57.77,172.372,66.405,183,66.405 M279.11,106.218c4.936,0,9.894-1.895,13.639-5.655l19.684-19.673c7.523-7.519,7.523-19.734,0-27.254c-7.52-7.558-19.75-7.558-27.273,0l-19.685,19.65c-7.523,7.518-7.523,19.751,0,27.277C269.234,104.323,274.187,106.218,279.11,106.218 M73.285,100.563c3.761,3.76,8.699,5.655,13.636,5.655c4.941,0,9.879-1.895,13.64-5.655c7.534-7.526,7.534-19.759,0-27.277l-19.655-19.65c-7.523-7.558-19.754-7.558-27.305,0c-7.488,7.52-7.488,19.735,0,27.254L73.285,100.563z M299.647,183.015c0,6.005,2.715,11.366,6.998,14.898c8.779-2.338,17.937-3.579,27.306-3.579c8.798,0,17.364,1.092,25.538,3.136c4.01-3.528,6.542-8.683,6.542-14.44c0-10.655-8.647-19.291-19.295-19.291h-27.793C308.278,163.739,299.647,172.375,299.647,183.015 M156.545,249.42c-26.389-10.531-44.998-36.266-44.998-66.391c0-39.501,31.982-71.515,71.487-71.515c39.471,0,71.485,32.014,71.485,71.515c0,16.499-5.624,31.694-15.009,43.793c4.575,1.309,9.024,3.024,13.292,5.102c7.078-8.356,15.388-15.533,24.576-21.32c2.566-8.752,3.989-18.018,3.989-27.574c0-54.229-44.115-98.348-98.333-98.348c-54.222,0-98.336,44.119-98.336,98.348c0,39.276,23.155,73.224,56.542,88.972C145.082,263.641,150.265,256.026,156.545,249.42 M73.285,265.49l-19.684,19.672c-7.523,7.521-7.523,19.719,0,27.271c3.76,3.76,8.713,5.626,13.634,5.626c4.956,0,9.893-1.866,13.671-5.626l19.655-19.688c7.534-7.52,7.534-19.715,0-27.255C93.038,257.954,80.81,257.954,73.285,265.49 M66.402,183.03c0-10.655-8.651-19.291-19.31-19.291H19.296C8.651,163.739,0,172.375,0,183.015c0,10.647,8.651,19.281,19.296,19.281h27.796C57.751,202.296,66.402,193.693,66.402,183.03"/></svg>',
	 'cnt'  : '<div class="loading">Lasting...</div>',
	 'api'  : [
	     {'id':'weather', 'url':'http://beta.norgeskart.no/ws/forecast.py'},
	     {'id':'sunRise', 'url':'http://beta.norgeskart.no/ws/sun.py'}
	 ]
	},	
	{'id'   : 'PMruler',
	 'title': 'M&aring;ling',
	 'img'  : 'img/pointMenuRuler.png',
	 'svg'	: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 32 32" class="icon ruler" preserveAspectRatio="xMidYMid meet"><path d="M24.953,2L2.999,23.955L9.045,30L30.999,8.047L24.953,2z M8.129,27.057l-2.938-2.938l0.548-0.546l2.937,2.938L8.129,27.057z M8.791,23.845L7.13,22.182l0.544-0.547l1.664,1.663L8.791,23.845z M10.729,21.907l-1.662-1.663l0.545-0.546l1.664,1.663L10.729,21.907z M12.666,19.97l-1.663-1.663l0.547-0.546l1.663,1.663L12.666,19.97z M14.604,18.032L12.94,16.37l0.547-0.546l1.663,1.662L14.604,18.032z M17.816,17.37l-2.938-2.938l0.547-0.547l2.938,2.939L17.816,17.37z M18.477,14.157l-1.661-1.662l0.547-0.548l1.662,1.664L18.477,14.157z M20.415,12.221l-1.663-1.664l0.546-0.546l1.664,1.661L20.415,12.221zM22.352,10.282L20.688,8.62l0.548-0.546l1.662,1.663L22.352,10.282z M24.289,8.344l-1.663-1.661l0.546-0.547l1.664,1.663L24.289,8.344z M24.563,4.746l0.548-0.546l2.938,2.937l-0.547,0.547L24.563,4.746z"/></svg>',
	 'cnt'  : '<div class="loading">Lasting...</div>'
	},
	{'id'   : 'PMshare',
	 'title': 'Bruk og del',
	 'img'  : 'img/pointMenuShare.png',
	 'svg'	: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="72.151px" height="38.936px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 72.151 38.936" class="icon embed"><path d="m 51.541,0 -6.91,5.549 14.83,13.918 -14.635,13.919 6.91,5.55 20.415,-19.469 z M 20.415,0 0,19.469 20.61,38.936 27.52,33.387 12.69,19.469 27.325,5.55 z" /></svg>',
	 'cnt'  : '<div class="shareContent">' + 
	   //'<a href="#CreatePermaLink">LAGE PERMALENKE</a>'+  
	   '<a href="#ShareMapView">DEL PUNKT</a>'+  
	   '<a href="#UseMapView">BRUK KARTUTSNITT</a>'+   
	  '</div>'
	},
	
        {'id'   : 'PMhome',
         'title': 'Eiendom',
         'img'  : 'img/pointMenuHome.png',
         'svg'	: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="105" height="95" preserveAspectRatio="xMinYMid meet" viewBox="0 0 105 95" class="icon address"><path d="M60.145,61.984l-26.67-49.292L13.059,38.258v43.59l45.615,13.243L97.85,70.077V47.27L60.145,61.984z M34.395,23.911c2.97,0,5.378,3.541,5.378,7.909c0,4.368-2.408,7.909-5.378,7.909	c-2.971,0-5.378-3.541-5.378-7.909C29.017,27.452,31.424,23.911,34.395,23.911 M44.695,85.742l-20.6-5.886V47.454l20.6,3.495V85.742z" /><polygon points="0,41.936 32.555,0 78.538,0 104.372,38.89 62.492,54.64 34.823,4.844 2.143,44.661" /></svg>',
	 'cnt'  : '<div class="loading">Lasting...</div>',
	 'api'  : [
	     {'id':'property', 'url':'http://beta.norgeskart.no/ws/wfs.teig.py'}
	 ]
        },
	
	/*
        {'id'   : 'PMsun',
         'title': 'Sol opp- og nedgang',
         'img'  : 'img/pointMenuSun.png',
	 'cnt'  : '<div class="loading">Lasting...</div>',
	 'api'  : [
	     {'id':'sunRise', 'url':'http://beta.norgeskart.no/ws/sun.py'}
	 ]
        },
	*/
	/*
	{'id'   : 'PMwater',
	 'title': '',
	 'img'  : 'img/pointMenuWater.png',
	 'cnt'  : ''   
	},
	*/
	{'id'   : 'PMmaid',
	 'title': 'N&oslash;dplakat',
	 'img'  : 'img/pointMenuMaid.png',
	 'svg'	: '<svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="emergency-poster icon"><circle cx="32" cy="32" r="30" fill="#ec0303" /><path fill-rule="evenodd" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z M 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg>',
	 'cnt'  : ''     
	}
    ],
	
    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);
        self.type = OpenLayers.Control.TYPE_BUTTON;
        this.title = OpenLayers.Lang.translate('Point menu');
    }, // initialize
    
    draw: function () {
    	var self, 
    		cName,
    		mapped, 
    		btn;

        self   = this;
        cName = 'btnPointMenu point-menu-button';
		mapped = 'OpenLayers_Control_PointMenu' + self.map.id;
        btn    = OpenLayers.Util.createButton(mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleControls, self));

		self.map.events.register('click', self, self.showPointMenu);
		self.map.events.register('move', self, self.movePointMenu);
		
		OpenLayers.Util.appendToggleToolClick({'self':self});
	
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE(this.menuButtonIcon);

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }

		self.attr['button'] = btn;

		// Activate point menu on map init as default tool.
		self.showControls();

        return self.div;
    }, // draw

    /**
     * Method: hideControls
     */	
    hideControls: function () {
    	var self,
    		attr,
    		btn,
    		main;

		self = this;
		attr = self.attr;
		btn  = attr['button'];
		main = attr['main'];

		if (typeof self.tracking === 'function') {
		    self.tracking({
		    	'module': self,
		    	'where':'hideControls'
		    });
		}

		OpenLayers.Element.removeClass(btn, 'active');
		OpenLayers.Element.removeClass(btn, 'simulation');

		if (main) {
			OpenLayers.Element.removeClass(main, 'active');
		}
		
		self.deleteModuleData();
    }, //hideControls

    /**
     * Method: showControls
     */	
    showControls: function () {
		var self = this, attr = self.attr, btn = attr['button'], main = attr['main'];
		if ( typeof(self.tracking)=='function' )
		    self.tracking({'module':self,'where':'showControls'});

		if (!main) { 
		    main = self.createPointMenu();
	        OpenLayers.Event.observe(attr['widget'], 'click', OpenLayers.Function.bind(self.clickOnPointMenuWidget, self));
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
	var self = this, attr = self.attr, btn = attr['button'];		
	OpenLayers.Element.hasClass(btn, 'active') ? 
	    self.hideControls() : self.showControls();
    }, // toggleControls

    /**
     * Method: movePointMenu
     */
    movePointMenu: function (e) {
    	var self,
    		attr,
    		btn,
    		main,
    		data,
    		style;

		self = this;
		attr = self.attr;

		if (attr['ignorMove']) {
			return;
		}
		btn  = attr['button'];
		main = attr['main'];
		test = !btn || !main || ( 
		    !OpenLayers.Element.hasClass(btn,'active') && !OpenLayers.Element.hasClass(btn,'simulation')
		);
		if (test) {
			return;	
		}
		if (typeof self.tracking === 'function') {
		    self.tracking({'module':self,'where':'movePointMenu'});
		}
		data  = self.map.getPixelFromLonLat(attr['center']);
		style = 'left:' + data['x'] + 'px; top:' + data['y'] + 'px;';
		
		main.setAttribute('style', style), self.moveEmbedArea();	
    }, // movePointMenu 

    /**
     * Method: moveEmbedArea
     */
    moveEmbedArea : function() {
		var self = this, attr = self.attr, embed = attr['UseMapView'], points;
		if (!embed) {
			return;
		}
	    
	    if (!embed.attr['points']) {
		    points = self.getEmbedAreaPoints(attr['embedAreaSize']);
			embed.attr['points'] = points;
			embed.setDragAreaShadow(points, true);
		}

		/*
			Commented out because point updates are now handled by 
			embed controller (see Embed.updatePoints function)
		*/
	    //embed.setDragAreaShadow(points, true);

    }, // moveEmbedArea

    /**
     * Method: showPointMenu
     */
    showPointMenu: function (e, force, center, simular) {
    	var self,
    		attr,
    		btn,
    		main,
    		menu,
    		parent,
    		i,
    		actived,
    		centralize;

		self = this;
		attr = self.attr; 
		btn  = attr['button'];
		main = attr['main'];
		menu = attr['menu'];

		if (!btn || !main || !OpenLayers.Element.hasClass(btn,'active')) {
		    return;
		}
		if (typeof self.tracking === 'function') {
		    if (self.tracking({'module':self,'where':'showPointMenu'})) {
				return;
			}
		}
		
		parent = (main.getAttribute('class') || '').match( /(^|\s+)by([\w\_\-]+)/gi );
		if (parent) {
		    for (i = 0; i < parent.length; i++) {
				OpenLayers.Element.removeClass(main, parent[i]);		
			}
		}

		if (self.parent) {
		    OpenLayers.Element.addClass(main, 'by' + self.parent);
		}
		//if ( typeof(self.tracking)=='function' )
		//self.tracking({'module':self,'where':'showPointMenu'});

		self.resetMenuItems(true);
		attr['clickEvent'] = e;
		attr['simular']    = simular; 
		attr['center']     = center || self.map.getLonLatFromPixel(e.xy);
		attr['lon']        = attr['center'].lon;
		attr['lat'] 	   = attr['center'].lat; 
	    attr['geometry']   = new OpenLayers.LonLat(
		    attr['lon'], 
		    attr['lat']).transform(self.map.getProjectionObject(),  
		    new OpenLayers.Projection("EPSG:4326")
		);

		actived    = OpenLayers.Element.hasClass(main, 'active');
		
		centralize = function () {
			var h,
				s,
				w,
				t,
				m,
				d,
				has;

		    self.map.setCenter(attr['center']);

		    h = 450;
		    s = OpenLayers.Util.getWindowSize();
		    w = [
				parseInt(OpenLayers.Util.getStyle(main,'width')) || 0, 
				parseInt(OpenLayers.Util.getStyle(main,'height')) || 0
		    ];	   
		    
		    w[2] = w[0] / 2;
		    w[3] = w[1] / 2;
		    s[2] = s[0] / 2;
		    s[3] = s[1] / 2;
			    
		    t = h + w[3];
		    m = s[3] - t;
		    d = 10;

		    if (m > 0) {
		    	return;
		    }

		    if (t + w[3] + d > s[1]) {
				m += (t + w[3] - s[1] - d);
		    }
		    self.map.moveByPx(0, m);
		}; 

		if (actived && !force) {
		    attr['menuBFopenCallback'] = centralize;
		    OpenLayers.Element.removeClass(main, 'active');
		    OpenLayers.Element.addClass(main, 'onClose');
		    self.movePointMenu();
		    setTimeout(function () {
				OpenLayers.Element.addClass(main, 'active');
		    }, 50 );
		} else { 
		    var has = OpenLayers.Element.hasClass(main, 'active');
		    centralize();
		    setTimeout(function () {
				OpenLayers.Element.addClass(main, 'active');
				OpenLayers.Element.addClass(main, 'onClose');
				self.toggleMenu(true);
				if (!attr['once'] || force) {
				    attr['once'] = setTimeout(function () { self.toggleMenu(false); }, force && has ? 600 : 100 );		     
				}
		    }, 100 );
		}
    }, // showPointMenu

    /***************************************************************************/

    /**
     * Method: displayRuler
     */
    displayRuler : function() {
		var self = this, attr = self.attr, map = self.map;
	        self.insertDrawPoint([attr['lon'], attr['lat']], [attr['lon'], 15806506], true);
		map.addLayers( attr['draw']['vector'] );
		attr['onMeasure'] = true; 
		if (!attr['mousemove']) {
		    attr['mousemove'] = true;
		    map.events.register( 'mousemove', self, self.measure);	
		}
    }, // displayRuler

    
    /**
     * Method: measure
     */
    measure : function (e) {
    	var self,
    		attr,
    		widget,
    		map,
    		center,
    		exist,
    		i,
    		lon,
    		lat,
    		unit,
    		distance,
    		temp,
    		p1,
    		p2,
    		dx,
    		dy,
    		angle,
    		degree;

		self = this;
		attr = self.attr;
		widget = attr['widget'];

		if (!attr['onMeasure'] || !e) {
			return;
		}
		map = self.map;
		center = map.getLonLatFromPixel(e.xy);

		if (!center) {
			return;
		}
		exist = attr['draw'] ? (attr['draw']['vector'] || []) : [];
		for (i = 0; i < exist.length; i++) {
		   map.removeLayer(exist[i]);
		}
		lon = center.lon;
		lat = center.lat; 
		self.insertDrawPoint([attr['lon'], attr['lat']], [lon, lat], false, true);

		self.map.addLayers(attr['draw']['vector']);

		unit = 'm';
		distance = attr['draw']['point'][1][0].distanceTo( 
		    attr['draw']['point'][1][1] 
		);
		
		if (distance > 1000) {
		    temp = distance / 1000;
		    unit = 'km';
		    distance = parseFloat(temp).toFixed(2);
		} else { 
			distance = parseFloat(distance).toFixed(2);
		}
		
		p1 = map.getPixelFromLonLat(attr['center']);
		p2 = map.getPixelFromLonLat(center);
		dx = p2.x-p1.x;
		dy = p2.y-p1.y;
		angle = Math.atan2(dx, dy); 
		degree = (360 - (angle * 180 / Math.PI) - 90) - 90;

		widget.innerHTML = '<ul class="measureContent">' +
		    '<li class="rulerDistance">' +
		      '<span class="label">Avstand:</span>'+ 
		    '<span class="value">' + distance + ' <span class="unit">' + unit + '</span></span>'+
		    '</li>' + 
		    '<li class="rulerDegree">' + 
		      '<span class="label">Grader:</span>'+ 
		      '<span class="value">' + parseFloat(degree).toFixed(3)+ '</span>'+
		    '</li>'+ 
		'</ul>';
    }, // measure

    /**
     * Method: insertDrawPoint
     */
    insertDrawPoint: function (from, to, reset, append, stroke) {
    	var self,
    		attr,
    		draw,
    		start,
    		end,
    		line,
    		vector;

		self = this;
		attr = self.attr;
		if (reset || ! attr['draw']) {
		    attr['draw'] = {'point':[],'vector':[],'line':[]};
		} else if ( append && attr['draw'] ) {
		    draw = attr['draw'];
		    attr['draw'] = {
			'point' :[ draw['point'][0]  ],
			'vector':[ draw['vector'][0] ],
			'line'  :[ draw['line'][0]   ]
		    };
		}
		
		start  = new OpenLayers.Geometry.Point(from[0], from[1]);
		end    = new OpenLayers.Geometry.Point(to[0], to[1]);
		line   = new OpenLayers.Geometry.LineString([start, end]);	
		vector = new OpenLayers.Layer.Vector();

		vector.addFeatures([new OpenLayers.Feature.Vector(
		    line, null, stroke || attr['stroke']
		)]);
			
		attr['draw']['point'].push([start,end]);
		attr['draw']['line'].push(line);       
		attr['draw']['vector'].push(vector);
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
    clickOnPointMenuWidget : function (e) {
    	var target,
    		self,
    		attr,
    		data,
    		added,
    		widget,
    		main,
    		menu,
    		key,
    		steps,
    		j,
    		bool,
    		back,
    		currentNode;

		self   = this;
		attr = self.attr;
		data = self.data;
		added = false;			
		widget = attr['widget'];
		main = attr['main'];
		menu = attr['menu'];

		if (!e) {
			e = window.event;
		}

		target = e.target || e.srcElement; 
		currentNode = target;
		while (currentNode !== widget) {
			if (currentNode.tagName === 'A') {
				target = currentNode;
			}
			currentNode = currentNode.parentNode;
		}

		if (OpenLayers.Element.hasClass(target, 'realLink')) {
			return;
		}

		if (OpenLayers.Element.hasClass(target, 'external-link') || OpenLayers.Element.hasClass(target, 'share-link')) {
			if (target.href) {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
				e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
				window.open(target.href);
			}
			return false;
		}

		OpenLayers.Util.preventDefaultEvent(e);

		key = (target.getAttribute('href') || '').replace(/^\#/, '');

		if (key === 'goBack') {
		    self.goBackViewMenu();
		} else if (key === 'ShareMapView') {
		    if (!attr[key]) {
				attr[key] = new OpenLayers.Control.GetURL({});
		    }
		    widget.setAttribute('class', 'display' + key);
		    widget.innerHTML = attr[key] && attr[key].getContent ? attr[key].getContent(attr['center']) : '';
		    added = true;	    
		} else if (key == 'UseMapView') {
		    attr[key] = new OpenLayers.Control.Embed({});
		    widget.setAttribute('class', 'display' + key);
		    if (attr[key] && attr[key].insertContent ) {
				attr[key].setMap(self.map, function (data) {
				    if (!data || !data['module']) {
				    	return;
					}
				    if (data['step']=='area') { 
						self.drawEmbedArea(data);
					} else if (data['step'] == 'markers') {
						self.drawEmbedMarker(data);
					} else if (data['step'] == 'descriptions' || data['step'] == 'preview') {
						//attr[key].adjustWidgetPosition();
					} else if (data['step'] == 'end') {
						self.goBackViewMenu();
					}
		 			
				    //if ( data['step']=='markers' || data['step']=='area' ) {
				    if (data['step'] == 'area') {
						setTimeout(function () {
						    data['clicked'] == 'next' ?
							data['module'].nextButton.click() :
							data['module'].backButton.click();
						}, 20 );
				    }
				});
				attr[key].insertContent(widget);
				attr[key].activeStep = 'type';
				attr[key].steps[attr[key].activeStep].draw.apply(attr[key]);
				attr[key].updateStepProgressPanel();
			
				steps = attr[key].stepProgressPanel ? (attr[key].stepProgressPanel.children || []) : [];
				
				for (j = 0; j < steps.length; j++) {
				    bool = OpenLayers.Element.hasClass(steps[j], 'area');
				    if (bool) {
				    	OpenLayers.Element.addClass(steps[j], 'disabled');
				    }
				}
				added = true;
		    }
		}
		if (added) {
		    OpenLayers.Element.addClass(widget, 'hasBackArrrow');
		    back = document.createElement('a');
		    back.setAttribute('class', 'goBackButton'        );
		    back.setAttribute('href',  '#goBack'             );
		    back.setAttribute('title', 'Tilbake forrige meny');
		    widget.appendChild(back);
		}
		return false;
    }, // clickOnPointMenuWidg

    /**
     * Method: getEmbedAreaPoints
     */
    getEmbedAreaPoints: function ( size, lonlat ) {
		var self = this, attr = self.attr;
		if (!attr['center']) {
			return;
		}
		var area   = size ? [size[0]||0, size[1]||0] : [0,0];
		var center = self.map.getPixelFromLonLat(attr['center']);

		// Creating tl (top left) and br (bottom right) points of a square.
		var w  = parseInt( area[0] / 2 ), h = parseInt( area[1] / 2 );
		var tl = [parseInt(center['x'] - w), parseInt(center['y'] - h)];
		var br = [parseInt(center['x'] + w), parseInt(center['y'] + h)];

		return lonlat ? [
		    self.map.getLonLatFromPixel({'x':tl[0],'y':tl[1]}),
		    self.map.getLonLatFromPixel({'x':br[0],'y':br[1]})
		] : [ tl, br ];
    },

    /**
     * Method: drawEmbedArea
     */
    drawEmbedArea : function() {
		this.moveEmbedArea();

	/*
	var self = this, attr = self.attr, embed = data['module'];
	if ( ! embed ) return;

        var points = self.getEmbedAreaPoints( attr['embedAreaSize'] );
        embed.setDragAreaShadow( points, true, 'byPointMenu' );

	/*
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
	*/
    }, // drawEmbedArea

    /**
     * Method: drawEmbedMarker
     */
    drawEmbedMarker : function (data) {
    	var self,
    		attr,
    		timer,
    		embed,
    		event,
    		elements,
    		heading,
    		note,
    		value,
    		id,
    		field,
    		render;

		self  = this;
		attr = self.attr;
		timer = 0; 
		embed = data['module'];
		event = attr['clickEvent'];

		if (!embed || !event) {
			return;
		}

		elements = embed['stepSpecificElements'] || {};
		heading  = elements['heading'];
		note = elements['instructions'];

		if (!note) {
			return;
		}
		if (heading) {
			heading.innerHTML = 'Mark&oslash;r';
		}
		if (!event['lonLat']) {
		    event['lonLat'] = {'lon':attr['lon'],'lat':attr['lat']};
		}
		value = attr['embedMarkerComment'] || '';
		id    = 'PointMenuEmbedMarkerComment';
		note.innerHTML = '<label>'+
		      'Legg til beskrivelse for &aring; lage en ' +
		      'mark&oslash;r p&aring; punktet du ser nedenfor i kartutsnittet:' +
		    '</label>' + 
		    '<input type="text" id="'+id+'" value="'+value+'">';

		field = document.getElementById( id );
		if (!field) {
			return;
		}
		render = function (e) {
			var list,
				i,
				btn,
				pin;

		    list = embed['stepSpecificElements']['markerList'] ? (embed['stepSpecificElements']['markerList'].children || []) : [];

		    for (i = 0; i < list.length; i++) {
				btn = document.getElementById('remove-' + (list[i].id));

				if (btn) {
					btn.click();
				}
		    }

		    field.focus(), setTimeout( function() { field.focus(); }, 50 );
		    attr['embedMarkerComment'] = field.value;
		    if ( ! attr['embedMarkerComment'] ) return;
		    
		    embed.embedMarkerPointSelectHandler( event, true );
		    embed.confirmAddedMarker( event, attr['embedMarkerComment'] );	
		    
		    pin = document.getElementById('nk-user-marker');
		    if (pin) {
		    	pin.style.display = 'none';
		    }
		};

		OpenLayers.Event.observe(field, 'keyup', function (e) {	   
		    clearTimeout(timer);
		    timer = setTimeout(function () {
		    	render(e); 
		    }, 300);
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
    getSunRiseAndSetInformation : function (text) {
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
     * Method: displayProperty
     */    
    displayProperty : function (text, type) {
    	var self,
    		attr,
    		widget,
    		info,
    		row,
    		keys,
    		i,
    		key,
    		value,
    		temp,
    		check,
    		label,
    		splited,
    		unitOfMeasure;


        self = this;
        attr = self.attr;
        widget = attr['widget'];
        info = {};
        row = [];
        keys = [
            {'key': 'kommunenr'},
            {'key': 'areal', 'unit': ' m²'},
            {'key': 'gardsnr'},
            {'key': 'bruksnr'},
            {'key': 'festenr'},
            {'key': 'seksjonsnr'},
            {'key': 'eiendomstype'},
            {'key': 'matrikkelnr'}
        ];

        for (i = 0; i < keys.length; i++) {
            key = keys[i].key;
            splited = text.split(OpenLayers.Util.createRegExp('<matrikkel:' + key + '>', true, true)) || [];
            temp = splited[2] || '';

            if (!temp) {
                info[key] = '';
            } else {
                check = temp.split( '<' ) || [];
                info[key] = check[0] || '';
            }
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i].key;
            label = key.charAt(0).toUpperCase() + key.slice(1);
            unitOfMeasure = keys[i].unit || '';

            if (label && info[key]) {
            	row.push('<tr><td>' + label + '</td><td>' + info[key] + unitOfMeasure + '</td></tr>');
        	}
        }
        if (!isNaN(parseInt(info['kommunenr'], 10)) && 
        	!isNaN(parseInt(info['gardsnr'], 10)) && 
        	!isNaN(parseInt(info['bruksnr'], 10)) && 
        	!isNaN(parseInt(info['festenr'], 10)) && 
        	!isNaN(parseInt(info['seksjonsnr'], 10))) {

        	row.push('<tr><td>Mer informasjon</td><td><a class="external-link" href="http://seeiendom.no/services/Matrikkel.svc/GetDetailPage?type=property&knr=' + info['kommunenr'] + '&gnr=' + info['gardsnr'] + '&bnr=' + info['bruksnr'] + '&fnr=' + info['festenr'] + '&snr=' + info['seksjonsnr'] + '&customer=kartverket">Se eiendom</a></td></tr>');
    	}

        widget.innerHTML = '<table id="propertyTable">' + row.join('') + '</table>';

	/*
	if ( ! text ) return;
	text = '{"error":null,"wfsTeigInfo":{"TeigId":179697159,"Areal":"766627124.6","GardsNr":"44","BruksNr":"1","FesteNr":"0","SeksjonsNr":"0","MatrikkelNr":"44/1","HovedTeig":true,"KommuneNavn":"Lierne","Adresses":["44/1, 44/1-4","44/1-6","44/1-7, 44/1-9, 44/1-10, 44/1-11, 44/1-12, 44/1-14, 44/1-15, 44/1-16, 44/1-18, 44/1-19"],"ArealMerknadsKoder":"3,4,6","UregistrertJordsameie":false,"AvklartEiere":false,"TeigMedFlereMatrikkelEnheter":false,"Tvist":false,"KommuneNr":"1738"}}';

	var self = this, attr = self.attr, widget = attr['widget'];	
	var info = JSON.parse( text )['wfsTeigInfo'] || {}, row = [];
	if ( info['Adresses'] ) {
	    var label = 'Adresse' +(info['Adresses'].length > 1 ? 'r' : '');
	    row.push(
		'<tr class="address">'+
		  '<td>'+label+'</td><td>'+info['Adresses'].join(',')+'</td>' +
		'</tr>'
	    );	    
	} else { row.push('<tr><td>Adresse</td><td>&nbsp;</td></tr>'); }



	var kno = info['KommuneNr'] || '?', mno = info['MatrikkelNr'] || '?';
	row.push('<tr class="property"><td>Eiendom</td><td>'+[kno,mno].join(' - ')+'</td></tr>');

	var kname = info['KommuneNavn'] || '?';
	row.push('<tr class="city"><td>Kommune</td><td>'+[kno,kname].join(' - ')+'</td></tr>');
	
	widget.innerHTML = '<table id="propertyTable">'+row.join('')+'</table>';
	*/
	/*
	widget.innerHTML = note +
	    '<a href="http://met.no/" target="_blank" class="realLink weatherReference">' +
	      'Data fra Meteorologisk institutt' +
	    '</a>';
	*/
    }, // displayWeather


    /**
     * Method: displayWeather
     */    
    displayWeather : function (text, type) {
		if ( ! text ) return;
		
		var self = this, attr = self.attr, widget = attr['widget'];
		/*
		var note = type == 'PMsun' ? 
		    self.getSunRiseAndSetInformation( text ) :
		    self.getWeatherInformation( text ) ;

		widget.innerHTML = note +
		    '<a href="http://met.no/" target="_blank" class="realLink weatherReference">' +
		      'Data fra Meteorologisk institutt' +
		    '</a>';
		*/

		
		var sun     = self.getSunRiseAndSetInformation( text );
		var weather = self.getWeatherInformation( text );

		widget.innerHTML = weather + sun +
		    '<a href="http://met.no/" target="_blank" class="realLink weatherReference">' +
		      'Data fra Meteorologisk institutt' +
		    '</a>';
		//*/
    }, // displayWeather

    /**
     * Method: displayInformation
     */    
    displayInformation : function (text) {
    	var self, 
    		attr,
    		widget,
    		out,
    		temp,
    		list,
    		data,
    		reg,
    		test,
    		key,
			i,
			epsg,
			d,
			t,
			a,
			trf,
			slc,
			getViewData,
			list;

		if (!text) {
			return;
		}
		//text = '<wps:ProcessOutputs><wps:Output><ows:Identifier>placename</ows:Identifier><ows:Title>placename</ows:Title><wps:Data><wps:LiteralData dataType="string">Monsroa</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>terrain</ows:Identifier><ows:Title>terrain</ows:Title><wps:Data><wps:LiteralData dataType="string">Dyrket mark</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>elevation</ows:Identifier><ows:Title>elevation</ows:Title><wps:Data><wps:LiteralData dataType="float" uom="m.a.s.l.">140.0</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>ssrid</ows:Identifier><ows:Title>SSRID</ows:Title><wps:Data><wps:LiteralData dataType="integer">1298156</wps:LiteralData></wps:Data></wps:Output></wps:ProcessOutputs>';

		self = this;
		attr = self.attr;
		widget = attr['widget'];
		out = [];
		temp = (text || '').replace(/\r/g,'').replace(/\n/g,'').replace(/\s+/g,' ');
		list = [];
		data = {};
		reg  = /(.*)(\<wps\:output\>(.*)\<\/wps:output\>)/i;

		do {
		    test = temp.match(reg) || [];
		    list.push(test[2] || '');
		    temp = test[1] || '';
		} while (temp.match(reg));
		
		for (i = 0; i < list.length; i++) {
		    test = list[i].match( /\<ows\:identifier\>(.*)\<\/ows\:identifier\>/i ) || [];
		    key  = test[1];

		    if (!key) {
		    	continue;
		    }

		    if (!data[key]) {
		    	data[key] = {};
		    }

		    test = list[i].match( /\<ows\:title\>(.*)\<\/ows\:title\>/i ) || [];
		    data[key]['title'] = test[1] || '';

		    test = list[i].match( /\<wps\:data\>(.*)\<\/wps\:data\>/i );
		    test = test ? test[1].match( /\>(.*)\<\// ) || test : [];
		    data[key]['value'] = test[1] || '';
		} // end of for loop

		getViewData = function (key, label) {
		    return data[key] && data[key]['value'] && data[key]['value'].replace(/[ \t]+/g, '') ? (
			'<li class="data ' + key + '">' + 
			    '<span class="label">' + (label || '') + '</span>' + 
			    '<span class="value">' + data[key]['value'] + '</span>' + 
			'</li>'
		    ) : '';
		};
			
		// placename
		if (data['placename'] && data['placename']['value'] && data['placename']['value'].replace(/[ \t]+/g, '')) {
			out.push('<li class="data placename">' + 
				    '<span class="label">STEDSNAVN:</span>' + 
				    ((data['ssrid'] && data['ssrid']['value']) ?
				    '<a class="value external-link" href="http://faktaark.statkart.no/SSRFakta/faktaarkfraobjektid?enhet=' + data['ssrid']['value'] + '">' + data['placename']['value'] + '</a>' :
				    '<span class="value">' + data['placename']['value'] + '</span>') + 
				'</li>'
			);
		}
		// terrain
		out.push(getViewData('terrain', 'Terreng:'));		

		// elevation
		if (data['elevation'] && data['elevation']['value'] && !isNaN(parseInt(data['elevation']['value'], 10))) {
			out.push('<li class="data elevation"><span class="label">H&oslash;yde:</span>' + 
				     '<span class="value">' + OpenLayers.Util.preciseRound(data['elevation']['value'], 0) + ' <abbr title="' + OpenLayers.Lang.translate('Meters above sea level') + '">' + OpenLayers.Lang.translate('m.a.s.l.') + '</abbr></span></li>');
		}

		list = document.createElement('ul');
		list.setAttribute('id', 'locationWrapper');

		list.innerHTML = out.join('');
		widget.innerHTML = '';
		widget.appendChild(list);

		// coordinates
		trf = new OpenLayers.Control.Transformations({
		    'url': self.url
		});
		coordinateElement = document.createElement('li');
		coordinateElement.setAttribute('class', 'data coordinate');
		coordinateElement.innerHTML = '<span class="label name">Koordinater:</span>';
		var coordinateSystemSelector = trf.generateCoordinateSystemsList('coordinate-system-selector', OpenLayers.Lang.translate('Coordinate system:'), 23);
		coordinateElement.appendChild(coordinateSystemSelector.label);
		coordinateElement.appendChild(coordinateSystemSelector.select);

		var coordinates = document.createElement('dl');
		var northLabel = document.createElement('dt');
		northLabel.innerHTML = OpenLayers.Lang.translate('North coordinate') + ':';
		coordinates.appendChild(northLabel);

		var northElement = document.createElement('dd');
		northElement.setAttribute('class', 'value north');
		northElement.innerHTML = OpenLayers.Util.preciseRound(attr.lat, 5);
		coordinates.appendChild(northElement);

		var eastLabel = document.createElement('dt');
		eastLabel.innerHTML = OpenLayers.Lang.translate('East coordinate') + ':';
		coordinates.appendChild(eastLabel);

		var eastElement = document.createElement('dd');
		eastElement.setAttribute('class', 'value east');
		eastElement.innerHTML = OpenLayers.Util.preciseRound(attr.lon, 5);
		coordinates.appendChild(eastElement);

		trf.setSpecialOutputElements({east: eastElement, north: northElement});

		coordinateElement.appendChild(coordinates);
		list.appendChild(coordinateElement);

		OpenLayers.Event.observe(coordinateSystemSelector.select, 'change', function (e) {
			trf.clearSpecialOut();
			var outSystem = e.target.value;
			trf.transformData({ost: attr.lon, nord: attr.lat, sosiKoordSys: 23, resSosiKoordSys: outSystem}, trf.specialOut);
		});


		/*
		trf.transform(attr['clickEvent'], true);
		*/

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
		    
		    switch (d['id']) {
		    	case 'sunRise':
		    		request = self.getSunRequest();
		    		break;
		    	case 'property':
		    		request = self.getPropertyRequest();
		    		break;
		    	case 'weather':
		    		request = self.getBaseRequest();		
		    		break;
		    	case 'place':
		    		request = self.getPlaceRequest();		
		    		break;
		    }
		    
		    //_kiet( '============', url+'?'+request );

		    attr['ajax'].push( OpenLayers.Util.createAjaxRequest(function (result) {
				save.push(result);
				if (--count === 0) {			    
				    if (id ==='PMweather' || id === 'PMsun') { 
						self.displayWeather(save.join(''), id);
				    } else if (id == 'PMinformation') {
						self.displayInformation(save.join(''));
				    } else if (id == 'PMhome') {
						self.displayProperty(save.join(''));
					}
				    
				}
		    }, url, request ) );	 
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
		
		if (note['api']) { 
		    self.displayAPIrequest(note); 
		} else if (id === 'PMruler') {
		    self.displayRuler();
		} else if (id === 'PMmaid') {	    
		    if (!attr[id]) {
				attr[id] = new OpenLayers.Control.EmergencyPoster({});
		    }
		    if (attr[id]) {
			    attr[id].pointMenu = self;
			    attr[id].setMap(self.map);
				attr[id].setCoordinatesFromPointMenu(attr['center']);
				attr[id].drawPopup(widget);
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
			'-o-transform: rotate(NUMBERdeg);'+
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
			
		var target = e.currentTarget || e.target || e.srcElement, id = target.id;
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
		if (e.target.id !== attr['menu'].id) {
			return;
		}
		if ( typeof(self.tracking)=='function' ) {
		    if ( self.tracking({'module':self,'where':'pointMenuEndHandler'}) ) {
				return;
			}
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
		    attr['UseMapView'].removeDragArea();
		    attr['UseMapView'] = null, attr['embedMarkerComment'] = null;	    
		}
		
		if ( attr['onMeasure'] ) {
		    var exist = attr['draw'] ? (attr['draw']['vector'] || []) : [];
		    for ( var i=0; i<exist.length; i++ )
			map.removeLayer( exist[i] );	    
		    attr['onMeasure'] = false, attr['draw'] = null; 
		}
    },

    /**
     * Method: createPointMenu
     */
    createPointMenu: function () {
		var self = this, attr = self.attr, data = self.data, items = [];
		for ( var i=0; i<data.length; i++ ) {
		    var id    = 'id="' + (data[i]['id'] || '') + '"';
		    var title = 'title="' + (data[i]['title'] || '') + '"';
		    var svg = data[i]['svg'] ? OpenLayers.Util.hideFromOldIE(data[i]['svg']) : '';
		    items.push( '<li ' + id + ' ' + title + ' class="item icon' + (i + 1) + '">' + svg + '</li>');
		}

		var menu   = '<ul id="PMmenu">' + items.join('') + '</ul>';
		var widget = '<div id="PMwidget"></div><div id="PMarrow"></div>';
		var tool   = '<ul id="PMtool">' +
		    '<li id="PMcloser" class="item"></li>'+
		    '<li id="PMopener" class="item"></li>'+
		  '</ul>';

		var main = document.createElement('div');
		main.setAttribute('id', 'pointMenu');
		main.innerHTML = widget + tool + menu;
		document.body.appendChild(main);

		attr['ie']     = self.isIE();
		attr['main']   = document.getElementById('pointMenu');
		attr['tool']   = document.getElementById('PMtool');
		attr['menu']   = document.getElementById('PMmenu');
		attr['widget'] = document.getElementById('PMwidget');

		for ( var i=0; i<attr['menu'].children.length; i++ ) {
		    if (OpenLayers.Element.hasClass(attr['menu'].children[i], 'item')) {
			OpenLayers.Event.observe( 
			    attr['menu'].children[i], 
			    'click',
			    OpenLayers.Function.bind(self.clickOnPointerMenuItem, self)
			);
		    }
		}

		for ( var i=0; i<attr['tool'].children.length; i++ ) {
		    if (OpenLayers.Element.hasClass(attr['tool'].children[i],'item')) {
			OpenLayers.Event.observe( 
			    attr['tool'].children[i],
			    'click',
			    OpenLayers.Function.bind(self.clickOnPointerMenuItem, self)
			);
		    }
		}
		
		//var end = ['webkitTransitionEnd', 'oTransitionEnd otransitionend', 'MSTransitionEnd', 'transitionend'];
		var end = ['webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd', 'transitionend'];
		for ( var i=0; i<end.length; i++ ) {
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
    getPlaceRequest: function () {
		return 'request=Execute&service=WPS&version=1.0.0&identifier=elevation&datainputs=[' + this.getBaseRequest() + ';epsg=4326]';
    }, // getSunRequest

    /**
     * Method: getSunRequest
     */    	
    getSunRequest: function () {
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
     * Method: getPropertyRequest
     */
    getPropertyRequest: function () {
    	var geo = this.attr.geometry;
    	return 'bbox=' + geo.lat + ',' + geo.lon + ',' + (geo.lat + 0.00001) + ',' + (geo.lon + 0.00001);
    },

    /**
     * Method: getBaseRequest
     */    	
    getBaseRequest: function () {
    	var self,
    		attr;
		self = this;
		attr = self.attr;
		return ['lat=' + attr['geometry'].lat, 'lon=' + attr['geometry'].lon].join(';'); 
    }, // getBaseRequest

    /**
     * Method: getUnitSymbol
     */    	
    getUnitSymbol: function (unit) {
		return !unit ? '' : (
		    unit == 'percent' ? '%' : (
			unit == 'celcius' ? '&#186;' : (unit || '')
		    ) 
		);
    }, // getUnitSymbol

    /**
     * Method: getDayOfDate
     */    	
    getDayOfDate: function (date) {
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
    getHourOfDate: function (date) {
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