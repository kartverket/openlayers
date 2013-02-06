OpenLayers.Control.Search = OpenLayers.Class(OpenLayers.Control, {
    EVENT_TYPES: ["doSearch"],
    size: null,
    element: null,
    submitBtnId: "searchSubmit",
    
    initialize: function(options) {
        this.EVENT_TYPES = OpenLayers.Control.Search.prototype.EVENT_TYPES.concat(        
            OpenLayers.Control.prototype.EVENT_TYPES);
            
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
        
        this.allowSelection = true;
    }, // initialize
    
    draw: function(){
        var position, size, image, inputElem, submitBtn;
        
        position = new OpenLayers.Pixel(275, 1);
        size = new OpenLayers.Size( 230, 58);
        OpenLayers.Control.prototype.draw.apply(this, []);
        image = OpenLayers.Util.getImageLocation("search-bg.png");
        
        this.element = OpenLayers.Util.createDiv(
            'OpenLayers_Control_Search' + this.map.id,
            position,
            size,
            image
        );
        OpenLayers.Element.addClass(this.element, 'searchDiv');
        inputElem = document.createElement('input');
        inputElem.setAttribute( 'name', 'searchInput' );
        inputElem.setAttribute( 'id', 'searchInput' );
        inputElem.setAttribute( 'type', 'text' );
        inputElem.style.width = "150px";
        inputElem.style.border = "none";
        inputElem.style.margin = "0px";
        inputElem.style.top = "17px";
        inputElem.style.left = "20px";
        inputElem.style.position = "relative";
        
        
        submitBtn = document.createElement( 'input' );
        submitBtn.setAttribute( 'type', 'submit' );
        submitBtn.setAttribute( 'id', this.submitBtnId );
        submitBtn.setAttribute( 'value', 'sok' );
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.top = '17px';
        submitBtn.style.left = '20px';
        submitBtn.style.position = 'relative';
        submitBtn.style.width = '30px';
        submitBtn.style.height = '25px';
        submitBtn.style.margin = '0px';
        submitBtn.style.border = 'none';
        
        
        this.element.innerHTML = '';
        this.element.appendChild(inputElem);
        this.element.appendChild(submitBtn);
        
        this.div.appendChild(this.element);
        
        OpenLayers.Event.observe(this.div, 'click', 
            OpenLayers.Function.bind(this.onClick, this)
        );
         
        // overriding default events and allows filling the search input
        this.events = new OpenLayers.Events(this, this.div, null, true);        
        this.events.on({
            "mousedown": this.defaultEvent,
            "mousemove": this.defaultEvent,
            "mouseup": this.defaultEvent,
            "mouseout": this.defaultEvent,
            "dblclick": this.defaultEvent,            
            "focus": this.defaultEvent,            
            //"keydown": this.onKeyDown,
            //"keyup": this.onKeyDown, // this didnt work
            scope: this
        });  
          
        var that = this;
          
        $('#searchInput').live("keyup", function(e) {
                if ( e.keyCode == 13 ) {
                   
                   return false;
                } // endif
                var lastTyped = $('#searchInput').val();
                if ( lastTyped.length < 2 ) {
                   
                   return false;
                } // endif
                setTimeout(function() {
                    // launch with delay
                    if ( lastTyped == $('#searchInput').val() ) {
                        that.doSearch();
                    }
                }, 1000);
        });
          
          
        return this.div;
    }, // draw
     
   
    doSearch: function () {                
       // returning test data
       var phrase = $('#searchInput').val();
       var fakeJson = {
            "areas": ['adin', 'dwad', 'trej', phrase],
            "addresses": ['one','two', phrase],
            "objects": ['three', 'four', phrase]
        };
       
       this.drawResponse(fakeJson)
       
       /* uncomment and update when connected to real service
       $.ajax({
            url: this.url + $('#searchInput').val(),
            dataType: "json"
        }).done(function(data){
            if (data.success == 1) {
                this.drawResponse( {"areas": data.results});
            } else {
                alert( 'error: '+data.msg);
            } // 
        });
       */ 

    }, 
    
    onKeyDown: function(event) {
        OpenLayers.Event.stop(event, true);
        var lastTyped, 
            k = event.keyCode || event.which,
            that;
            
        if (k == 13) {
            this.doSearch();            
            return true;
        }
         
        lastTyped = $('#searchInput').val();
        if ( lastTyped.length < 2 ) {

           return false;
        } // endif
        
        that = this;
        
        setTimeout( function() {
            // launch with delay
            if ( lastTyped != $('#searchInput').val() ) {
                that.doSearch();
            }   
            }, 1000 );
    }, //onKeyDown
    
    drawResponse: function(resultJson) {
        var resultHtml = [], subResult, resultDiv;
                
        if (resultJson.length == 0) {
            resultHtml.push("No records found");
        } else {    
            $.each(resultJson, function(label, results){            
                subResult = [];

                $.each(results, function(key, value) {
                    subResult.push('<li>'+value+'</li>');
                });

                resultHtml.push('<div class="'+label+'"><span>'+label+'</span><ul>'+subResult.join('')+'</ul></div>');            
            });
        } //
        
        if ( $('#searchResults').length == 0 ) {            
            resultDiv = $( '<div/>', { 'id': 'searchResults', html: '<a href="#" class="close">x</a><div class="list"></div>'});
            $('.searchDiv').after(resultDiv);
        } else {
            resultDiv = $('#searchResults');   
        } // endif
                        
        $('#searchResults div.list').html( resultHtml.join('') );
        resultDiv.slideDown({'duration':250}, function(){});
        
        $('#searchResults a.close').on( "click", function(e){ $('#searchResults').remove() });
    }, // draw 
    
    defaultEvent: function(event) {
        OpenLayers.Event.stop(event, true);
    },
    
    onClick: function (event) {
        if ( event.target.id == this.submitBtnId ) {
            this.doSearch();
        }
    }, // onClick
    
    
    CLASS_NAME: "OpenLayers.Control.Search"
}); // OpenLayers.Control.Search 