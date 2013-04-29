/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.Embed = 
    OpenLayers.Class(OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonEmbed',
    title: null,
    widget: null,
    cnt: null,
    stepProgressPanel: null,
    stepSpecificPanel: null,
    activeStep: null,
    nextButton: null,
    backButton: null,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.type = OpenLayers.Control.TYPE_BUTTON;
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Embed': 'Bruk kartutsnitt',
            'Select type:': 'Velg type:',
            'Dynamic map based on open services': 'Dynamisk kart basert på åpne tjenester',
            'Static map': 'Statisk kart',
            'Terms': 'Vilkår for bruk',
            'You can use the maps freely for any internet based purposes. You are not allowed to combine multiple maps to form a bigger, continous map.': 'Du kan fritt bruke kartutsnittene til alle nettbaserte formål. Kartene må brukes enkeltvis og ikke settes sammen slik at de danner et større sammenhengende kart.',
            'Svalbard terms': 'Integrasjon av Svalbard-kart er ikke tillatt uten spesiell avtale med Norsk Polarinstitutt. Se bruksvilkårene i Norsk Polarinstitutts egen kartportal, TopoSvalbard (toposvalbard.npolar.no) for ytterligere informasjon.',
            'Providers: Statens kartverk, Geovekst, municipalities and Norge digitalt partners': 'Innholdsleverandører: Statens kartverk, Geovekst, kommuner og Norge digitalt-parter.',
            'Previous': 'Forrige',
            'Next': 'Neste',
            'Show selected map area': 'Vis kartutsnitt',
            'Choose area': 'Velg utsnitt',
            'Include map tools': 'Ta med kartverktøy',
            'Include a marker': 'Sett inn markør',
            'Comment': 'Skriv inn kommentar',
            'Add': 'Legg til',
            'Skip': 'Hopp over',
            'Click in the map to add markers with descriptions.': 'Klikk på steder i kartet for å sette inn markører med forklaring. Legg til flere punkter ved å klikke i kartet.',
            'Map description': 'Beskriv kartutsnitt',
            'Short description:': 'Kort beskrivelse:',
            'I.ex.': 'F.eks.',
            '"Stores in Hordaland"': '"Utsalgssteder i Hordaland"',
            'Why?': 'Hvorfor?',
            'Long description:': 'Lang beskrivelse:',
            'A long description is used when there is an error, or when the user is unable to see the map.': 'Lang beskrivelse brukes når det skjer en feil og kartet ikke kan vises eller når brukeren ikke kan se kartet.',
            'Generate map': 'Generere kart',
            'Generate code': 'Generere kode',
            'Points:': 'Punkter:',
            'step <span>${stepCount}</span> of ': 'trinn <span>${stepCount}</span> av '
        });
        
        this.navButtons = {};
        this.navButtons.next = null;
        this.navButtons.back = null;

        this.title = OpenLayers.Lang.translate('Embed');
        this.widgetStates = {};

    }, // initialize
    
    draw: function () {
        var self = this, 
            cName = 'Embed-button nkButton',
            mapped, 
            btn, 
            toolElement, 
            panel,
            step,
            stepElement,
            stepCount = 0,
            header,
            stepElements = [],
            buttonsPanel,
            i, j;

        mapped = 'OpenLayers_Control_Embed' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click',
            OpenLayers.Function.bind(self.toggleWidget, self)
        );
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="72.151px" height="38.936px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 72.151 38.936" class="icon embed"><path d="m 51.541,0 -6.91,5.549 14.83,13.918 -14.635,13.919 6.91,5.55 20.415,-19.469 z M 20.415,0 0,19.469 20.61,38.936 27.52,33.387 12.69,19.469 27.325,5.55 z" /></svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'embed');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                self.div = toolElement;
            } else {
                self.div.appendChild(btn);
            }
        }

        self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        self.div.appendChild(self.widget);

        header = document.createElement('header');
        header.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Embed') + '</h1>';

        this.stepProgressPanel = document.createElement('ol');
        this.stepProgressPanel.setAttribute('class', 'progress');

        for (step in this.steps) {
            if (this.steps.hasOwnProperty(step)) {
                stepCount += 1;
                stepElement = document.createElement('li');
                stepElement.setAttribute('class', step);
                stepElement.innerHTML = OpenLayers.Lang.translate('step <span class="step-number">${stepCount}</span> of ', {'stepCount': stepCount});
                stepElements.push(stepElement);
                this.stepProgressPanel.appendChild(stepElement);
            }
        }
        while (stepElements.length > 0) {
            var stepCountElement = document.createElement('span');
            stepCountElement.innerHTML = '' + stepCount;
            stepElements.pop().appendChild(stepCountElement);
        }
        header.appendChild(this.stepProgressPanel);
        this.cnt.appendChild(header);

        this.stepSpecificPanel = document.createElement('div');
        this.stepSpecificPanel.setAttribute('class', 'step-specific');
        this.stepSpecificPanel.innerHTML = 'arst neio';

        this.cnt.appendChild(this.stepSpecificPanel);

        // add the bottom navigation (next/previous) buttons
        buttonsPanel = document.createElement('div');
        buttonsPanel.setAttribute('class', 'buttons-panel');

        this.backButton = document.createElement('button');
        this.backButton.setAttribute('class', 'back');
        this.backButton.innerHTML = OpenLayers.Lang.translate('Previous');
        buttonsPanel.appendChild(this.backButton);

        this.nextButton = document.createElement('button');
        this.nextButton.setAttribute('class', 'next');
        this.nextButton.innerHTML = OpenLayers.Lang.translate('Next');
        buttonsPanel.appendChild(this.nextButton);

        this.cnt.appendChild(buttonsPanel);

        return self.div;
    }, // draw

    updateStepProgressPanel: function () {
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'type-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'terms-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'area-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'markers-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'description-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'preview-active');
        OpenLayers.Element.addClass(this.stepProgressPanel, this.activeStep + '-active');
    },

    nextStep: function () {
        console.log('nextStep');
        var removeCurrent,
            drawNext;

        switch (this.activeStep) {
        case 'type':
            next = 'terms';
            break;
        case 'terms':
            next = 'area';
            break;
        case 'area':
            next = 'markers';
            break;
        case 'markers':
            next = 'descriptions';
            break;
        case 'descriptions':
            next = 'preview';
            break;
        case 'preview':
            next = null;
            break;
        default:
            break;
        }

        removeCurrent = this.steps[this.activeStep].remove;
        removeCurrent();

        if (next) {
            drawNext = this.steps[next].draw;
            drawNext();
        }
    },

    steps: {
        type: {
            draw: function () {
                console.log('draw type');
            },
            remove: function () {
                console.log('remove type');
            }
        },
        terms: {
            draw: function () {
                console.log('draw terms');
            },
            remove: function () {
                console.log('remove terms');
            }
        },
        area: {
            draw: function () {
                console.log('draw area');
            },
            remove: function () {
                console.log('remove area');
            }
        },
        markers: {
            draw: function () {

            },
            remove: function () {

            }
        },
        descriptions: {
            draw: function () {

            },
            remove: function () {
                
            }
        },
        preview: {
            draw: function () {

            },
            remove: function () {

            }
        }

    },
    hideControls: function () { 
//        OpenLayers.Event.stopObservingElement(this.transformButton);
        OpenLayers.Element.removeClass( this.div, 'active' );

        this.steps[this.activeStep].remove();
        this.activeStep = null;
    }, //hideControls

    showControls: function () {
        var html = '',
            inputForm,
            selected,
            button,
            coordinates,
            that = this,
            inSystem,
            outSystem,
            fieldset,
            eastLabel, eastInput,
            northLabel, northInput;

        this.activeStep = 'type';
        this.steps[this.activeStep].draw();
        this.updateStepProgressPanel();  
/*        OpenLayers.Event.observe(this.inputForm, 'submit', 
            OpenLayers.Function.bind(that.transform, that)
        );
*/
        OpenLayers.Element.addClass(this.div, 'active');

//        this.map.events.register('click', this, this.setCoordinatesFromClick);
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleWidget: function () {
        OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleGetURL
    
    toggleControls: function () {      
       var self = this;
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.Embed"
}); // OpenLayers.Control.Transformations
