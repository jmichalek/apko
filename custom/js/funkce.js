/* credit https://github.com/jeffsu/json2yaml - slightly adapted */

(function (self) {
  /*
   * TODO, lots of concatenation (slow in js)
   */
  var spacing = "  ";

  function getType(obj) {
    var type = typeof obj;
    if (obj instanceof Array) {
      return 'array';
    } else if (type == 'string') {
      return 'string';
    } else if (type == 'boolean') {
      return 'boolean';
    } else if (type == 'number') {
      return 'number';
    } else if (type == 'undefined' || obj === null) {
      return 'null';
    } else {
      return 'hash';
    }
  }

  function convert(obj, ret) {
    var type = getType(obj);

    switch(type) {
      case 'array':
        convertArray(obj, ret);
        break;
      case 'hash':
        convertHash(obj, ret);
        break;
      case 'string':
        convertString(obj, ret);
        break;
      case 'null':
        ret.push('null');
        break;
      case 'number':
        ret.push(obj.toString());
        break;
      case 'boolean':
        ret.push(obj ? 'true' : 'false');
        break;
    }
  }

  function convertArray(obj, ret) {
    if (obj.length === 0) {
      ret.push('[]');
    }
    for (var i=0; i<obj.length; i++) {

      var ele     = obj[i];
      var recurse = [];
      convert(ele, recurse);

      for (var j=0; j<recurse.length; j++) {
        ret.push((j == 0 ? "- " : spacing) + recurse[j]);
      }
    }
  }

  function convertHash(obj, ret) {
    for (var k in obj) {
      var recurse = [];
      if (obj.hasOwnProperty(k)) {
        var ele = obj[k];
        convert(ele, recurse);
        var type = getType(ele);
        if (type == 'string' || type == 'null' || type == 'number' || type == 'boolean') {
          ret.push(normalizeString(k) + ': ' +  recurse[0]);
        } else {
          ret.push(normalizeString(k) + ': ');
          for (var i=0; i<recurse.length; i++) {
            ret.push(spacing + recurse[i]);
          }
        }
      }
    }
  }

  function normalizeString(str) {
    return str;
  }

  function convertString(obj, ret) {
    ret.push(normalizeString(obj));
  }

  self.json2yaml = function(obj) {
    if (typeof obj == 'string') {
      obj = JSON.parse(obj);
    }

    var ret = [];
    convert(obj, ret);
    return ret.join("\n");
  };
})(this);


/* Textov?? zpracov??n?? norem */

function hloubka(retezec) {
    // vrac?? pole stejn?? d??lky jako je ??et??zec, kter?? ud??v?? hloubku vno??en?? (aktu??ln?? n??sobnost) z??vorek na dan?? pozici ??et??zce

    var hloubka = 0;
    var letter;
    pole_hloubky = new Array();
    for (var i = 0; i < retezec.length; i++) {
        letter = retezec.charAt(i);
        // console.log(letter);
        switch (letter) {
            case "(":
                hloubka++;
                pole_hloubky[i]=hloubka;
                break;
            case ")": // odli??n?? po??ad??
                pole_hloubky[i]=hloubka;
                hloubka--;
                break;
            default:
                pole_hloubky[i]=hloubka;
        };
        // console.log(hloubka);


    };
    return pole_hloubky;
};

function zaslep_vnorene_zavorky(vyraz) {
    // v??echny ????sti v??razu ve hloubce v??t???? ne?? 0 nahrazuje p??smenem "z"
    var pole_hloubky = hloubka(vyraz);
    var retezec = new Array();

    //console.log(retezec);
    //console.log(pole_hloubky);

    for (var i = 0; i < vyraz.length; i++) {
        if (pole_hloubky[i] != 0 )
        {
            retezec[i] = "z";
        }
        else retezec[i] = vyraz.charAt(i);
        //console.log(retezec[i]);

    };
    // console.log(retezec);
    return retezec.join('');
};

function isBalanced([...str]) {return str.reduce((uptoPrevChar, thisChar) => {
    // funkce zkontroluje, zda je po??et z??vorek balancovan??
    // funkce po ??prav?? p??evzata; kredit: Rohan Paul citace: https://rohan-paul.github.io/javascript/2018/05/25/Parenthesis-Matching-Problem-in-JavaScript/
    ((thisChar === '(' && uptoPrevChar++ || thisChar === ')' && uptoPrevChar--));

    return uptoPrevChar;
}, 0) === 0 }

function odzavorkuj(vyraz) {
    // funkce odstra??uj??c?? z??vorky ze za????tku a konce (libovoln?? po??et) ??et??zce

    var retezec = '';

    if (isBalanced(vyraz) == true)

    // dokud bude m??t operace n??jak?? efekt, budeme postupn?? odeb??rat dal???? a dal???? vn??j???? z??vorku
    {
        retezec = vyraz.trim();
        var puvodni = retezec;
        var novy = puvodni;

        do {
            puvodni = novy;
            var pole_hloubky = hloubka(puvodni);

            var cond = false;
            if (puvodni.length>2) {
                for (var j=1; j<pole_hloubky.length-1; j++) {
                    if (pole_hloubky[j] == 0) {
                        cond = true; // je kus v hloubce 0, tedy ( XXXX ) AAA  (XXXS)
                        break;
                    }
                }
            }
            // cond = false znamen??, ??e nen?? ????dn?? mezikus v hloubce 0

            if (puvodni.charAt(0) == "(" && puvodni.charAt(puvodni.length-1 ) == ")" && cond == false ) {
                //console.log("Zkracujeme!");
                novy = puvodni.substring(1,puvodni.length-1).trim();
            }
        }
        while ( novy != puvodni );

    }
    else {
        console.error("Nespr??vn?? po??et z??vorek v ??et??zci vyhodnocovan??m funkc?? odzavorkuj(). Funkce odz??vorkov??n?? nebude aktivov??na. Zadan?? ??et??zec:\n \n "+ vyraz);
    }

    return novy;
}

function zpracujNormuNaJSON(vyraz) {
    // p??ij??m?? ??et??zec obsahuj??c?? funkcn?? vzorec normy a vrac?? objekt obsahuj??c?? strukturn?? vzorec { hypoteza: XX, dispozice: YY}
    if ( vyraz.match(/[=][>]/gi) == null && vyraz.match(/[<][=][>]/gi) == null ) {
        return { hypoteza: null, dispozice: funkcniVzorecNaJSON(vyraz),  ekvivalence: false  };
        }
    else if (vyraz.match(/[<=][=][>]/gi) != null) {
        var slozky = vyraz.split('<=>');
        return { hypoteza: funkcniVzorecNaJSON(slozky[0]), dispozice: funkcniVzorecNaJSON(slozky[1]), ekvivalence: true };
        }
    else if (vyraz.match(/[=][>]/gi) != null) {
        var slozky = vyraz.split('=>');
        return { hypoteza: funkcniVzorecNaJSON(slozky[0]), dispozice: funkcniVzorecNaJSON(slozky[1]), ekvivalence: false  };
    }
}

function funkcniVzorecNaJSON(vyraz) {
    // p??ij??m?? ??et??zec obsahuj??c?? funkcn?? vzorec hypot??zy a vrac?? objekt obsahuj??c?? strukturn?? vzorec s poli ozna??en??mi "konjunkce" a "disjunkce"
    // nap??. vstup: ((V1&(V2 | V3 ) & V4 & ( V5 | V6) ))
    // v??stup: { "konjunkce": [ "V1", { "disjunkce": [ "V2", "V3" ] }, "V4", { "disjunkce": [ "V5", "V6" ] } ] }

    // d??le p??id??me negaci NOT(X) se prop????e na { "negace" : X}

    // vylou????me vn??j???? z??vorky na za????tku a na konci, pokud jsou

   vyraz = odzavorkuj(vyraz);

   // nejprve mus??me o??et??it, ??e tam m????e b??t negace
   // console.log(vyraz);

   // console.log(vyraz.substring(0,3));


   let anditko = false;
   let oritko = false;
   zaslepeny = zaslep_vnorene_zavorky(vyraz);

   if ( zaslepeny.match(/[&]/gi) != null ) anditko = true;
   if ( zaslepeny.match(/[|]/gi) != null ) oritko = true;


   // hled??me symboly &, |
    if ( anditko == true && oritko == true ) console.error("Zadan?? v??raz je chybn??, proto??e obsahuje na stejn?? ??rovni konjunkci a disjnukci, nicm??n?? program vy??aduje explicitn?? uz??vorkov??n??. Zadan?? ??et??zec:\n \n "+ vyraz);

   else if (anditko == true || oritko == true ) {

   //console.log(anditko);
   //console.log(oritko);

   var symbol = '';
   var symbol_text = '';
   if (anditko == true) {symbol = "&"; symbol_text = "konjunkce";}
   if (oritko == true) {symbol = "|"; symbol_text = "disjunkce";}
   // console.log(symbol_text);


   var radek = new Array;

   var zbytek = zaslepeny;
   var zbytek_nezaslepeny = vyraz;

   var zacatek = '';
   var zacatek_nezaslepeny = '';

   var vysledek = {};

   //console.log(zbytek.indexOf(symbol));

   // dokud se ve zbytku vyskytuje symbol, budeme to sekat
   while (zbytek.indexOf(symbol) > -1) {

       zacatek = zbytek.substring(0,zbytek.indexOf(symbol)).trim();

       zacatek_nezaslepeny = zbytek_nezaslepeny.substring(0,zbytek_nezaslepeny.indexOf(symbol)).trim();

       zbytek = zbytek.substring(zbytek.indexOf(symbol)+1,zbytek.length).trim();

       zbytek_nezaslepeny = zbytek_nezaslepeny.substring(zbytek_nezaslepeny.indexOf(symbol)+1,zbytek_nezaslepeny.length).trim();

       radek.push(funkcniVzorecNaJSON(zacatek_nezaslepeny));
   }

   radek.push(funkcniVzorecNaJSON(zbytek_nezaslepeny));

   vysledek[symbol_text] = radek;
   // console.log(vysledek);
   return vysledek;}
   // hled??me negaci
   else if ( vyraz.substring(0,3) == "NOT" ) {
       // console.log("Nalezena negace!");
       return { "negace" : funkcniVzorecNaJSON(vyraz.substring(3,vyraz.length))};
   }
   else if ( anditko == false && oritko == false ) return vyraz;



}

/* Z??kladn?? syntaxe norem */

function labelOperace(prop) {
    // podle druhu operace vrac?? ??esk?? ekvivalent slova
    if (prop == 'konjunkce') return 'sou??asn??';
    if (prop == 'disjunkce') return 'alternativn??';
    if (prop == 'negace') return 'nen?? pravda, ??e';
}

function switchOperace(prop) {
    // podle druhu operace vrac?? ??esk?? ekvivalent slova
    if (prop == 'konjunkce') return 'disjunkce';
    if (prop == 'disjunkce') return 'konjunkce';
}

function signOperace(prop) {
    // podle druhu operace vrac?? ??esk?? ekvivalent slova
    if (prop == 'konjunkce') return '&';
    if (prop == 'disjunkce') return '|';
    if (prop == 'negace') return 'NOT';
}

const capitalize = (s) => {
    /* credit https://flaviocopes.com/how-to-uppercase-first-letter-javascript/ */

  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function naveti(vzorec) {
    vzorec.ekvivalence = vzorec.ekvivalence || false;
    if (vzorec.hypoteza != null ) {
        if (!vzorec.ekvivalence) { spojeni = ", <strong>pokud</strong>"; }
        else { spojeni = " <strong>pr??v?? tehdy, pokud</strong>"; }

        return '<div>'+ capitalize(vzorec.dispozice) + spojeni + '</div>';
    }
    else return '<div>' + capitalize(vzorec.dispozice) + '</div>';
}

function Norma(myOznaceni, myObsah) {
    // konstruktor t????dy pro normu, kter?? je schopen v??choz?? metodou hezky tisknout obsah dan?? normy
    this.obsah = myObsah;
    this.oznaceni = myOznaceni;
    // console.log(this.obsah);
    this.vzorec = zpracujNormuNaJSON(this.obsah);
    this.printObsah = function(komplex) {
        komplex=komplex || false;

        let znak = "";
        if (komplex) znak = "???";
        let vystup = "<h3>"+znak+" "+this.oznaceni+"</h3>\n\n";
        vystup+=naveti(this.vzorec);
        if (this.vzorec.hypoteza != null )
            vystup+= printJSONhypotezy(this.vzorec.hypoteza, true) ;
        vystup+="\n";
        return vystup;
    }
}

function normID(ind,...mylevel) {
    if ( (typeof mylevel[0]) == 'undefined' ) bod = "H";
    else bod = mylevel.join('.');
    return 'N'+ind+"/"+bod;
}

function addPrepinac(obsah,oznaceni,...mylevel) {

    /*
    let id = str    .replace("?? ","par")
                    .replace("odst. ","odst")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/([.,])\s+/g, '$1')
                    .replace(/([A-z])\s+([0-9])/g, '$1$2')
                    .replace(/([0-9])\s+([A-z])/g, '$1$2')
                    .replace(/[/]/g,"-")
                    .replace(/[()]/g,"")
                    .replace(/\s+/g,"-");
                    */
    let ind = (indexofset(obsazene_normy,'oznaceni',oznaceni)+1);
    nid = normID(ind,...mylevel);

    return '<div class="float-right" style="width:150px">\
    <div class="switch tiny" style="display:inline">\
  <input class="switch-input '+nid.replace(/(N\d+)[/].*/g,'$1')+'" id="'+nid.replace(/[/]/g,"-")+'" type="checkbox"\
  name="'+obsah+'">\
  <label class="switch-paddle" for="'+nid.replace(/[/]/g,"-")+'">\
    <span class="show-for-sr">Tiny Sandwiches Enabled</span>\
  </label>\
</div> \
<span class="secondary label norm-num"> \
'+nid+'\
</span>\
</div>';
}

function validityButton(name, value) {
    let vystup = '<div class="float-right" style="width:150px">';

    switch (value) {
        case true:
            vystup += '<button type="button" id="B'+name+'" class="success button" style="width:140px"><strong><i class="fi-check"></i> plat??</strong></button>';
            break;
        default:
            vystup += '<button type="button" id="B'+name+'" class="button" style="width:140px"><strong><i class="fi-x"></i> neplat??</strong></button>'
    }

    vystup += '</div>';
    return vystup;
}

function toggleButton(button) {
    // toggle the status of the button;
    let hodnota_button = false;
    if (button.classList.contains("success")) hodnota_button=true;

    switch (hodnota_button) {
        case true:
            button.classList.remove("success");
            button.innerHTML = '<strong><i class="fi-x"></i> neplat??</strong>';
            break;
        default:
            button.classList.add("success");
            button.innerHTML = '<strong><i class="fi-check"></i> plat??</strong>';
    }
}


function printJSONhypotezy(slozenina,baleni,prepinac = false,oznaceni = "" ,...level ) {
    if ((typeof level[0])=='undefined') level = [];
    // podle zadan??ho JSONu normy vytiskne hezk?? v??stup v polo??kov??m seznamu
    // balen?? je logick?? hodnota true/false, zda se m?? tisknout rozklik, v??choz?? hodnota je, ??e nikoliv
    // p??ep??na?? je zda m?? b??t aktivov??n m??d s p??ep??na??i
    baleni = baleni || false;

    //    prepinac = prepinac || false;

    if (slozenina.hasOwnProperty('konjunkce') || slozenina.hasOwnProperty('disjunkce') ) {
        let pole = slozenina[Object.keys(slozenina)[0]];
        if (! Array.isArray(pole)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");
        let vystup = '<strong class="'+ Object.keys(slozenina)[0] +'">' + labelOperace(Object.keys(slozenina)[0]) + "</strong>";

        vystup += "\n<ol>";

        level.push(0);

        pole.forEach( (el,i) => {

                vystup+= "\n<li>";
                incrementLastEl(level);

                switch (typeof(el)) {
                    case 'string':
                        vystup+= el;
                        if (baleni === true) vystup+= rozbal;
                        if (prepinac === true) {

                            vystup+= addPrepinac(el,oznaceni,...level);

                            //console.log(level);
                            //console.log(el);
                        }

                        break;
                    default:
                        //incrementLastEl(level);

                        vystup+=printJSONhypotezy(el,baleni,prepinac,oznaceni, ...level);
                };
                vystup+= "</li>\n ";
            });

        vystup +="\n</ol>";
        return vystup;

        }

    else if ( slozenina.hasOwnProperty('negace') ) {
        let vystup = '<strong class="negace">'+ labelOperace(Object.keys(slozenina)[0]) + "</strong><blockquote>";
        let part = slozenina[Object.keys(slozenina)[0]];
        switch (typeof(part)) {
            case 'string':
                vystup+= part;
                if (baleni === true) vystup+= rozbal;
                if (prepinac === true) vystup+= addPrepinac(part,oznaceni,...level);
                break;
            default:
                // level.push(0);
                vystup+=printJSONhypotezy(part,baleni,prepinac,oznaceni,...level);
        };
        return vystup + "</blockquote>";
        }

    else if ( slozenina.hasOwnProperty('komplex') ) {
        // vyps??n?? p????slu??n??ho komlexu
        let pole = slozenina['komplex'];
        if (! Array.isArray(pole)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");

        let vystup = pole[0]["vzorec"]["dispozice"];
        if (prepinac === true) vystup+= addPrepinac(vystup,oznaceni,...level);

        vystup+= "<blockquote>";

        // prvky tohoto pole jsou dal???? normativn?? komplexy
        pole.forEach( el => {
            if (el.constructor.name != 'NormativeComplex')                console.error("Nastala chyba, prvky komplexu nejsou typu NormativeComplex.");
            if (prepinac) {
                vystup+= el.printPrepinac(true);}
            else vystup+= el.printObsah(true);
            });

        return vystup + "</blockquote>";
        }

    else
    {
        let vystup = "";
        if (prepinac === true) vystup+= addPrepinac(slozenina,oznaceni,...level);
        return slozenina+vystup;

    }
    // { "konjunkce": [ "V1", { "disjunkce": [ "V2", "V3" ] }, "V4", { "disjunkce": [ "V5", "V6" ] } ] }
}


function vzorec2text(slozenina) {
    // podle zadan??ho JSONu podm??nek vytiskne standardizovan?? textov?? v??stup
    if (slozenina.hasOwnProperty('konjunkce') || slozenina.hasOwnProperty('disjunkce') ) {
        var pole = slozenina[Object.keys(slozenina)[0]];
        if (! Array.isArray(pole)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");

        vystup = " ( ";

        for (var i=0; i< pole.length; i++) {
            switch (typeof(pole[i])) {
                case 'string':
                    vystup+= pole[i];
                    break;
                default:
                    vystup+=vzorec2text(pole[i]);
            };
            if (i!= pole.length-1) vystup += signOperace(Object.keys(slozenina)[0]);
        }

        vystup += " ) ";

        return vystup;

        }

        else if ( slozenina.hasOwnProperty('negace') ) {
            var vystup = signOperace(Object.keys(slozenina)[0]) + "(";
            var part = slozenina[Object.keys(slozenina)[0]];
            switch (typeof(part)) {
                case 'string':
                    vystup+= part;
                    break;
                default:
                    vystup+=vzorec2text(part);
            };
            return vystup + ')';
        }

    else return slozenina;

    // { "konjunkce": [ "V1", { "disjunkce": [ "V2", "V3" ] }, "V4", { "disjunkce": [ "V5", "V6" ] } ] }
}

/* Trasov??n?? norem */

function createNormField() {
    // vytvo???? na zavol??n?? pole se seznamem v??ech objekt?? t????dy Norma
    /* N??sleduj??c??ch p??r ????dk?? z https://stackoverflow.com/questions/2602800/how-to-get-all-objects-of-a-given-type-in-javascript */

    var NormObjects = [];
    // Pole se seznamem v??ech objekt?? typu Norma
    for(var key in window) {
        var value = window[key];
        if (value instanceof Norma) {
            // foo instance found in the global scope, named by key
            // console.log(JSON.stringify(value));

            NormObjects.push(value);
        }
    }
    return NormObjects;
}

function childrenOfDispozice(testovanaDispozice) {
    // funkci se zad??v?? dispozice a vrac?? pole s normami, jejich?? konsekventy odpov??daj?? testovan?? dispozici; pokud takov?? nejsou, vrac?? pr??zdn?? pole
    var ResNormObjects = [];

    if (typeof NormObjects === 'undefined') NormObjects = createNormField();

    for(let i = 0; i < NormObjects.length; i++) {
        // console.log(NormObjects[i].vzorec.dispozice);
        if ( NormObjects[i].vzorec.dispozice == testovanaDispozice )
            ResNormObjects.push(NormObjects[i]);
    }
    // console.log("Testov??n?? d??t??");
    // console.log(ResNormObjects);
    return ResNormObjects;

}

function joinAntecedents(pole, dispozice){
    // funkce dost??v?? pole se seznamem norem a dispozic?? a vrac?? normu vzniklou souborem v??ech podm??nek; pokud se pou????v?? ve spojen?? s childrenOfDispozice, je t??eba pamatovat na to, ??e prezentace v??sledku jako alternativy nen?? informa??n?? ekvivalentn??, ale jde pouze implikace; proto je vhodn??j???? to ??e??it p??es komplexy

    podminky = [];
    pole.forEach(el => {
        podminky.push(vzorec2text(el.vzorec.hypoteza));
    });

    if (podminky.length == 0) return false;

    textik = podminky.join(' | ');
    polenazvu = [];
    nazev = pole.forEach(el => {polenazvu.push(el.oznaceni)});
    nazvy = polenazvu.join(", ");

    norma = new Norma(nazvy, textik + " => " + dispozice);
    //console.log(norma);
    return norma;
}

/* Zjednodu??uj??c?? operace na norm??ch */

function propagateNegation(tvar) {
    // funkce p??eb??r?? tvar typu {negace: dijunkce: A, B} a negaci p??evede na nejni?????? stupe?? dol??, tj. na {konjunkce: negace A a negace B}, kde A a B mohou st??le b??t slo??en?? v??roky
    if (tvar.hasOwnProperty("negace")) {
        let child = tvar[Object.keys(tvar)[0]];

        if (child.hasOwnProperty("konjunkce") || child.hasOwnProperty("disjunkce")) {
            let operator = Object.keys(child)[0];
            let pole = child[operator];
            if (! Array.isArray(pole)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");
            let novePole = [];

            pole.forEach(el => {
                switch (typeof(el)) {
                    case 'string':
                        novePole.push({negace: el});
                        break;
                    default:
                        novePole.push(propagateNegation({negace: el}));
                }
            });
            let vysledek = {};
            vysledek[switchOperace(operator)] = novePole;
            return vysledek;

        }
        else if (child.hasOwnProperty("negace")) {
            return child["negace"]; // dvakr??t negace je identita
        }
        else if (child.hasOwnProperty("komplex")) {
            let pole = child["komplex"];
            return {negace:
                        {komplex: pole.map( x => logicalSimplifyNegation(x))}};
            // props??n?? do komplexu
        }
        else return {negace: child};
    }
    else return tvar;

}

function propagateOperation(tvar, operator) {
    // funkce p??eb??r?? tvar typu {disjunkce: A, disjunkce(B,C) } p??ev??d?? ho na tvar (disjunkce: A, B, C); pokud tam toto ??et??zen?? nen??, vrac?? false
    if (operator != "konjunkce" && operator != "disjunkce") console.error("Zad??na chybn?? operace");

    if (tvar.hasOwnProperty(operator)) {
        let child = tvar[operator];
        // console.log(child);
        if (! Array.isArray(child)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");

        let novePole = [];

        child.forEach(el => {

            if (el.hasOwnProperty(operator)) {
                novePole = novePole.concat(el[operator]);
                // console.log(novePole);
            }
            else {
                // p??evezmeme bez zm??ny
                novePole.push(el);
            }
        });
        //console.log(novePole);
        let vysledek = {};
        vysledek[operator] = novePole;
        //console.log(vysledek);
        return vysledek;

    }
    else return false;


}

function logicalSimplifyNegation(slozenina) {
    // funkce p??eb??r?? ????st stromov??ho tvaru, kter?? zjednodu???? tak, aby formule typu X AND (Y AND Z) byla p??evedena na https://en.wikipedia.org/wiki/Conjunctive_normal_form
    // konjunktivn?? norm??ln?? forma nap??. jako u t.??. podvodu, tedy sou??asn?? napln??n?? n??kolika znak??, p??i??em?? n??kter?? z nich mohou p??ipou??t??t alternativy
    // https://en.wikipedia.org/wiki/Negation_normal_form
    // jde v po??ad?? o n??sleduj??c?? operace:
    // props??n?? negace
    // odstran??n?? dvojit?? negace
    // distribu??n?? z??kon pro stejn??
    // distribu??n?? z??kon pro jin??

    // for each node
    //

    /* n??sleduj??c?? ????dky inspirov??ny z  https://stackoverflow.com/questions/722668/traverse-all-the-nodes-of-a-json-object-tree-with-javascript/722732 */


    if ( slozenina.hasOwnProperty('negace') ) return propagateNegation(slozenina);

    else if ( slozenina.hasOwnProperty('konjunkce') || slozenina.hasOwnProperty('disjunkce') ) {
        let operator = Object.keys(slozenina)[0];
        let pole = slozenina[operator];

        if (! Array.isArray(pole)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");
        let novePole = [];

        pole.forEach(el => {
            switch (typeof(el)) {
                case 'string':
                    novePole.push(el);
                    break;
                default:
                    novePole.push(logicalSimplifyNegation(el));
            }
        });
        var vysledek = {};
        vysledek[operator] = novePole;
        return vysledek;

    }
    else if ( slozenina.hasOwnProperty('komplex')) {
        let vysledek = {};
        vysledek.komplex = logicalSimplifyNegation(slozenina.komplex);
        return vysledek;

    }
    else return slozenina;


}

function logicalSimplifyOperation(slozenina, operator) {
    // provede operaci propagateOperation na v??ech sou????stk??ch

    test = propagateOperation(slozenina, operator);

    // console.log(test);

    // m??me tam dan?? oper??tor
    if ( test != false )
    {
        return propagateOperation(slozenina, operator);
    }

    // nebo tam m????eme m??t opa??n?? oper??tor, potom je pot??eba funkci rekurzivn?? uplatnit na v??echny prvky pole
    else if ( slozenina.hasOwnProperty(switchOperace(operator))) {
        let pole = slozenina[switchOperace(operator)];

        if (! Array.isArray(pole)) console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");
        let novePole = [];

        pole.forEach(el => {
            switch (typeof(el)) {
                case 'string':
                    novePole.push(el);
                    break;
                default:
                    novePole = novePole.concat(logicalSimplifyOperation(el, operator));
            }
        });
        let vysledek = {};
        vysledek[switchOperace(operator)] = novePole;

        return vysledek;

    }

    else if ( slozenina.hasOwnProperty("negace") ) {

        let vysledek = {};
        vysledek["negace"] = logicalSimplifyOperation(slozenina["negace"], operator);
        return vysledek;

    }

    else return slozenina;


}

function simplifyNorm(normainput) {
    if (typeof normainput == false) console.error("Zadan?? vstup nen?? normou");
    let slozenina = normainput.vzorec.hypoteza;

    let zjednodusena =logicalSimplifyOperation(logicalSimplifyOperation(logicalSimplifyNegation(slozenina), "konjunkce"), "disjunkce");

    // console.log(zjednodusena);

    normaoutput = new Norma(normainput.oznaceni + " (z??kladn?? tvar)",
                vzorec2text(zjednodusena) + " => " + normainput.vzorec.dispozice);
    return normaoutput;
}

function simplifyNC(normain) {
    /* dostanu zadan?? normativn?? komplex a vr??t??m ho po proveden?? form??ln??ho zjednodu??en??, tj. v r??mci jeho hlavn?? struktury budou provedeny pot??ebn?? substituce, nicm??n?? toto se ji?? nebude propisovat dovnit?? */

    if ( (normain instanceof Norma) == true || (normain instanceof NormativeComplex) == true )  { // vstupem je norma

        let slozenina = normain.vzorec.hypoteza;

        let zjednodusena =logicalSimplifyOperation(logicalSimplifyOperation(logicalSimplifyNegation(slozenina), "konjunkce"), "disjunkce");

        normaoutput = new NormativeComplex(normain.oznaceni, zjednodusena, normain.vzorec.dispozice, normain.vzorec.ekvivalence);

        return normaoutput;


    }

    else console.error("Zadan?? vstup nen?? normou");

}


function traceHypothesis(dispozice) {
    // funkci zad??me dispozici a vrac?? dohledanou hypot??zu
    let norma = joinAntecedents(childrenOfDispozice(dispozice), dispozice);
    if (norma == false) return false;
    return simplifyNorm(norma);
}

/* Rozklik??v??n?? a grafick?? prvky */

function addListenerRozklik(el) {
    // p??id??v?? naslouch??tko pro rozklik??v??n?? odkazu
    // console.log("click all right");
    el.addEventListener("click", function() {

        let hypo = el.parentElement.firstChild.nodeValue.trim();
        normahypo = traceHypothesis(hypo);
        let dovetek = "";
        if (normahypo == false) dovetek = '<div class="error">v syst??mu nebyla nalezena norma s dan??m konsekventem</div>';
        else dovetek = normahypo.printObsah();
        // myspan =
        el.parentElement.querySelector('span.explanation').innerHTML = dovetek;
        aktualizujOdkazy();
    }, {once : true});
}



function aktualizujOdkazy() {
    var elements = obrazovka.getElementsByTagName('a');
    // console.log(elements);
    for(let i = 0, len = elements.length; i < len; i++) {
        let el = elements[i];
        addListenerRozklik(el);
    }
}

function infoBox(text) {
    return '<div data-alert class="callout info>"><p><i class="fi-info"></i> '+text+'</p></div>';
}

function normView(normin, long = false, prepinac = false) {
    let output="";
    output += '<div data-alert class="callout info>"><h2>Zadan?? dispozice</h2><p><strong>'+normin.vzorec.dispozice+'</strong></p></div>';

    normaprop2 = complexifyNorm(normin);
    normaprop3 = reduceNorm(normaprop2);

    if (long) {
        output += "<h2>Vstupn?? podoba</h2>";
        output += infoBox('<strong>Vstupn?? podobou</strong> m??me na mysli v??pis p??edpoklad?? s dan??m n??sledkem v souboru v??ech norem v syst??mu');

        output += normaprop2.printObsah();
        console.log(normaprop2);

        console.log("p??ed??l!")

        output += "<hr/><h2>Pokr??cen?? podoba</h2>";
        output += infoBox("<strong>Pokr??cenou podobou</strong> m??me na mysli, ??e se v normativn??m komplexu nahrad?? v??echny dispozice spojen?? jednoduch??mi ekvivalencemi s navazuj??c?? normou p????mo hypot??zou t??to navazuj??c?? normy, ????m?? se cel?? norma zjednodu????.");

        //console.log(normaprop3);
        console.log(normaprop3);
        customLog("vstup",normaprop3);

        output += normaprop3.printObsah();
    }
    output += "<hr/><h2>Zjednodu??en?? podoba</h2>";
    output += infoBox("<strong>Zjednodu??enou podobou</strong> m??me na mysli, ??e se v??echny negace p??evedou na atom??rn?? ??leny v??razu a pospojuj?? se p????padn?? v????ty konjunkc?? a disjunkc??.");


    normaprop4 = simplifyNC(normaprop3);

    if (prepinac) output += normaprop4.printPrepinac();
    else output += normaprop4.printObsah();

    return output;
}

function addMySelect() {

    myselect = document.getElementById("selectNumber");

    for(let i = 0, len = seznam_dispozic.length; i < len; i++) {

        let opt = seznam_dispozic[i];
        let el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        myselect.appendChild(el);
    }

    myselect.oninput = function(ev) {

        dispozice = ev.target.value;
        let obrazovka2 = document.getElementById("obrazovkaposelectu");

        if (dispozice != "") {

            // norma = joinAntecedents(childrenOfDispozice(dispozice), dispozice);
            // normaprop = simplifyNorm(norma);

            let norma = new Norma("Vybran?? dispozice", dispozice+ ' <=> ' +dispozice);

            /*let cnorm = complexifyNorm(norma);
            console.log(cnorm); */

            obrazovka2.innerHTML = normView(norma, true);

            aktualizujOdkazy();

        }

        else {
            obrazovka2.innerHTML = "";
        }
        /*


        normaneg = simplifyNorm(normatest);

        // console.log(vzorec2text(podminky.vzorec.hypoteza));
        */



    }
}

function handleHash() {
    let mypages = ["home","vstupy", "baze", "cil", "brouzdani", "komplexy", "evaluate"];
    let mypage = location.hash.substr(1);
    if (mypages.includes(mypage)) {
        show_page(mypage);
    }
}

function aktualizujSpojenePojizdniky() {
    let list = document.getElementsByClassName("switch-input");

    /* synchronizace p??ep??na???? se stejn??m ID na str??nce evaluate */
    for (let item of list) {

        item.addEventListener('input', (event) => {
                // p??epneme tla????tka se stejn??m n??zvem
                let jmenovci = document.getElementsByName(event.currentTarget.name);
                for (let jmenovec of jmenovci) {
                    jmenovec.checked = event.currentTarget.checked;
                    }
            });
    }
}

/* Nasoucha??e ud??lostem pro cel?? dokument */

document.addEventListener("DOMContentLoaded", function(e) {

    handleHash();

    /* addMenu(); */

    /* sledov??n?? na jak?? jsme str??nce */
    window.addEventListener("hashchange", function() {
        handleHash();
        aktualizujOdkazy();
        });

    aktualizujSpojenePojizdniky();


    let tog = document.getElementById("toggle-rozbal");
    tog.addEventListener("click", function() {
        let elements = obrazovka.getElementsByClassName('rozbal');
        console.log(elements);
        for(let i = 0, len = elements.length; i < len; i++) {
            let el = elements[i];
            el.style.display= el.style.display === "none" ? "inline" : "none";
            }
    aktualizujOdkazy();
//        odkazy.style.display = odkazy.style.display === "none" ? "inline" : "none";
    });
    aktualizujOdkazy();

});

window.addEventListener("load", function(e) {
    aktualizujOdkazy();
});

/* Normativn?? komplexy */

function NormativeComplex(myoznaceni, myhypoteza, mydispozice, myekvivalence) {
    // konstruktor t????dy pro normativn?? komplex (??et??zec vypl??v??n??)

    this.oznaceni = myoznaceni;
    // console.log(this.obsah);
    this.vzorec = {"hypoteza": myhypoteza, "dispozice": mydispozice, "ekvivalence": myekvivalence};
    //myLog("v??stup",this.vzorec);


    this.printObsah = function(komplex) {
        komplex=komplex || false;
        let znak = "";
        if (komplex) {
            if (this.vzorec.ekvivalence) znak = "???";
            else znak = "???";
        }

        var vystup = "<h3>"+znak+" "+this.oznaceni+"</h3>\n\n";
        vystup+=naveti(this.vzorec);
        if (this.vzorec.hypoteza != null ) {
            vystup+= printJSONhypotezy(this.vzorec.hypoteza,false) ;
        }
        else vystup+='.</div>';
        vystup+="\n";
        return vystup;
    }

    this.printPrepinac = function(komplex) {
        komplex=komplex || false;
        let znak = "";
        if (komplex) {
            if (this.vzorec.ekvivalence) znak = "???";
            else znak = "???";
        }

        addOznaceni(this.oznaceni);
        console.log(obsazene_normy);

        let ind = (indexofset(obsazene_normy,'oznaceni',this.oznaceni)+1);

        var vystup = "<h3>"+znak+" "+this.oznaceni+" (d??le jen ???N"+ind+"???)</h3>"+validityButton("N"+ind, false)+"\n\n";



        vystup+=naveti(this.vzorec);
        if (this.vzorec.hypoteza != null ) {
            vystup+= printJSONhypotezy(this.vzorec.hypoteza,false,true,this.oznaceni) ;
        }
        else vystup+='.</div>';
        vystup+="\n";
        return vystup;
    }

    /*
    this.normObject = normObject;
         vrac?? objekt, kde v logick?? grafov?? struktu??e jsou dotazy */


}

function printObj(obj) {

    console.log("%c"+ json2yaml(JSON.stringify(obj,null,1)) ,"color:black;");
}

function myLog(text, obj) {

    switch (text) {
        case "vstup":
            color = "green";
            break;
        case "v??stup":
            color = "red";
            break;
        default:
            color = "black";
            break;
        }

    console.log("%c"+text.toUpperCase()+": \n" + JSON.stringify(obj, null, 2).replace(/[}{"\[\],]/g,"").replace(/\n+/g,"\n"),"color:"+color+";");
}

const seznam_povolenych_operaci = ["negace", "konjunkce", "disjunkce", "komplex"];
const seznam_narnich_operaci = ["konjunkce", "disjunkce"];

const rozbal = ' <a href="javascript:void(0)" class="rozbal"><i class="fi-fast-forward"></i></a><span class="explanation"></span></li>';

function complexifyNorm(normainput) {
    // funkci zad??me Normu, nap??. .vzorec.hypoteza = { konjunkce: A, B}, p??i??em??
    // funkce provede pro v??echny prvky substituci A -> {komplex: -hypoteza: A -normy: - X, Y}, p??i??em?? X, Y jsou Normy, kter?? maj?? danou hypot??zu jako konsekvent; v??slednou strukturu naz??v??me ??et??zec vypl??v??n??; toto prov??d?? tak dlouho, dokud nejsou v??echny normy nahrazeny komplexem, pokud to lze; nicm??n?? ka??d?? norma, kter?? se vyskytuje jako hypot??za v komplexu se rozvine pouze jednou a na dal????ch m??stech se ji?? na komplex nerozv??d??, aby nebyly ve struktu??e zbyduplicity; funkci m????eme tak?? zadat slo??eninu (hypot??zu)

    // myLog("vstup",normainput);

    if ( (normainput instanceof Norma) == true || (normainput instanceof NormativeComplex) == true ) // vstupem je norma
    {
        // console.log("Vstupem je norma, typ "+normainput.constructor.name+".");
        // pokud je vstupem norma, vr??t??me tut???? normu s upravenou hypot??zou
        let normaoutput = new NormativeComplex(normainput.oznaceni, complexifyNorm(normainput.vzorec.hypoteza), normainput.vzorec.dispozice, normainput.vzorec.ekvivalence);
        // myLog("v??stup",normaoutput);
        return normaoutput;
    }
    else { // vstupem je slo??enina
        //console.log("Vstupem je slo??enina.");
        let hypoteza = normainput;

        // nyn?? mohou nastat 2 p????pady: 1. hypoteza je prost?? text, 2. hypot??za je slo??enina (v prvn?? ??rovni konjunkce, disjunkce, negace)

        let operace = Object.keys(hypoteza)[0];
        // v p????pad?? stringu je to 0, ale to je jedno
        // jinak je to konjunkce, disjunkce, negace

        if (typeof hypoteza == "string" ) {
        // nejprve se otestuje, zda v syst??mu v??bec m??me n??jak?? normy, jich?? je hypot??za konsekventem

            let deti = childrenOfDispozice(hypoteza);
            //console.log(deti);
            //console.log(deti.length);

            if ( deti.length == 0 )
            {
                // myLog("v??stup",hypoteza);
                return hypoteza;
            }

            else {
                let vysledek = {};
                //myLog("v??stup",deti);
                vysledek.komplex = deti.map( x => complexifyNorm(x));
                //myLog("v??stup",vysledek);
                return vysledek;
            }
        }

        else if (typeof hypoteza == "object" && seznam_povolenych_operaci.includes(operace) ) {

            let child = hypoteza[operace];

            //myLog("d??t??",child);

            if (seznam_narnich_operaci.includes(operace) ) {

                if (!Array.isArray(child) ) {
                console.error("Chyba ve form??tov??n?? vstupn??ho objektu. Objekt nen?? typu Pole.");}

                // m?? k dispozici pole, sta???? na ka??d?? jeho prvek aplikovat obdobnou funkci

                let vysledek = {};
                vysledek[operace] = child.map( x => complexifyNorm(x) );
                //myLog("v??stup",vysledek);
                return vysledek;
            }
            else if (operace == "negace") {
                let vysledek = {};
                vysledek[operace] = complexifyNorm(child) ;
                //myLog("v??stup",vysledek);
                return vysledek;
            }
        }
    }
}

function customLog(popis, objekt) {
    console.log("----------------------");
    console.log(popis);
    console.log(typeof objekt);
    printObj(objekt);
    console.log("----------------------");
}

function isSlozenina(normain) {
    if (normain.hasOwnProperty('konjunkce') || normain.hasOwnProperty('disjunkce') || normain.hasOwnProperty('negace') ) {
        return Object.keys(normain)[0];
    }
    else {
        return false;
    }
}

function reduceNorm(normain) {
    // na zadan?? norm?? nebo slo??enin?? aplikuje operaci redukce, tedy nahrazen?? ekvivalenc?? p????mo hypot??zami

    // tedy vstupem je complex { hypoteza typu komplex, dispozice}, tedy pod??v??m se na hypot??zu, pokud je u n?? ekvivalence true, tak m????u nahradit, jinak aplikuju na hypot??zu tut???? funkci a vr??t??m v??stup


    // mohou nastat n??sleduj??c?? p????pady
    // 1. je to instance komplexu
    // 2. je to slo??enina
    // 3. je to vno??en?? komplex - pak provedeme redukci
    // 4. je to liter??l (string)

    //console.log(normain);

    // ad 1.
    if ( (normain instanceof NormativeComplex) == true ) {
        //console.log("PRAVDA");
        let normaout = new NormativeComplex(normain.oznaceni,
                            reduceNorm(normain.vzorec.hypoteza),
                            normain.vzorec.dispozice,
                            normain.vzorec.ekvivalence);
        return normaout;
        }

    // ad 2.
    else if ( (operace = isSlozenina(normain)) ) {
        let vysledek = {};
        let child = normain[operace];
        if (seznam_narnich_operaci.includes(operace)) {
            vysledek[operace] = child.map( x => reduceNorm(x) );
            }
        else if (operace == 'negace') {
            vysledek[operace] = reduceNorm(child);
            }
        return vysledek;
    }

    // ad 3.
    else if ( normain.hasOwnProperty('komplex') ) {
        let child = normain['komplex'];
        if (child.length == 1 && (child[0] instanceof NormativeComplex) == true && child[0].vzorec.ekvivalence == true ) {
            // provedeme redukci
            return reduceNorm(child[0].vzorec.hypoteza);
        }
        else {
            let vysledek = {};
            vysledek['komplex'] = child.map( x => reduceNorm(x) );
            return vysledek;}
    }

    else if ( (typeof normain) == 'string' ) {
        return normain;
    }

    else {
        return false;
    }

}

function incrementLastEl (_array) {
   _array[_array.length - 1]++;
}

const obsazene_normy = new Set();

function vzorec2citelny(vzorec) {
    return vzorec.replace(/[&]{2}/g,'&').replace(/[|]{2}/g,'|').replace(/N\d+[-]/g,'').replace(/[!][(]/g,'??(');
}

function prehled_obsazenych_norem() {
    let i=0;
    let vystup = "<h2>P??ehled struktury norem a normativn??ch zdroj??</h2>";
    obsazene_normy.forEach( el => {

        let oznaceni = el.oznaceni;
        i++;
        vystup += "<h3>Norma N"+i+": "+oznaceni+"</h3>";
        vystup += '<p class="vzorec">'+oznaceni+': '+vzorec2citelny(el.vzorec)+',</p>';

        vystup += "<p>kde ";

        for (let zkr in zkratky) {
            if (oznaceni.indexOf(zkr)>=0) {
                vystup += '<strong>'+zkr+'</strong> ozna??uje '+zkratky[zkr];
            }
        }
        vystup+=".</p>";

        });

    return vystup;
}

function indexofset(myset, field, value) {
    // returns the member
    return Array.from(myset).map( el => el[field] ).indexOf(value);
}

/* credit https://stackoverflow.com/questions/28790584/javascript-increment-last-array-element */



function rozpadNCdopromennych(normain,ind,...level ) {
    if ((typeof level[0])=='undefined') level = [];

    var operace2 = isSlozenina(normain);

    if ( operace2 != false ) {
        let vysledek = {};
        let children = normain[operace2];
        if (seznam_narnich_operaci.includes(operace2)) {
            level.push(0);
            let vystup = [];
            children.forEach( child => {
                //myLog("vstup",operace2);

                incrementLastEl(level);
                vystup.push(rozpadNCdopromennych(child,ind,...level));
                });

            vysledek[operace2] = vystup;
            }
        else if (operace2 == 'negace') {
            vysledek[operace2] = rozpadNCdopromennych(children,ind,...level);
            }
        //myLog("vstup", normain);
        //myLog("v??stup",vysledek);

        return vysledek;
    }

    else if ( normain.hasOwnProperty('komplex') ) {
        // pp.: tabulka evaluovan??ch vazeb, kter?? svazuje hypot??zu konsekventn?? normy a p????slu??nou v??slednou logickou hodnotu evaluovan?? antecendentn?? normy
        //   N1.3   N2

        let children = normain['komplex'];

        children.forEach( child =>  {
            let ind2 = (indexofset(obsazene_normy,'oznaceni',child.oznaceni)+1);
            tabulka_vazeb.push([normID(ind,...level),ind2]);
            formLogic(child);
        });


        return rozpadNCdopromennych("dummy",ind,...level);
    }

    else if ( (typeof normain) == 'string') {
        let vystup = normID(ind,...level);
        //myLog("vstup", normain);
        //myLog("v??stup",vystup);

        return vystup;
    }

    else {
        //myLog("v??stup", "PROBLEM");
        //myLog("v??stup", normain);
        return false;}
}

var tabulka_vazeb = [];

function vzorecEvaluateNorm(vzorec) {
    vzorec = vzorec.replace(/(N\d+\-(H|(\d\.)*(\d)))/g, 'document.getElementById("$1").checked');
    return vzorec;
}

function aktualizujButton(ind) {
    // funkce aktualizuje button normy id, zajist?? odpov??daj??c?? aktualizaci provazby na navazuj??c?? normu a d??le aktualizuje Button rekurz?? t??to navazuj??c?? normy, pokud takov?? existuje
    console.log(ind);
    /* kontrola vstupn??ch parametr?? */

    /*
    if (!Number.isInteger(ind) ||
        ind < 1 ||
        ind > (Array.from(obsazene_normy).length) )
        console.error("Id normy nespl??uje po??adovan?? parametry.");
        */
    /* najdeme dan?? button */

    let button = document.getElementById("BN"+ind);
    let vzorec = vzorecEvaluateNorm(Array.from(obsazene_normy)[ind-1].vzorec);

    let hodnota_chain = eval(vzorec);
    //console.log(vzorec);
    //console.log(hodnota_chain);

    let hodnota_button = false;
    if (button.classList.contains("success")) hodnota_button=true;

    if (hodnota_button!=hodnota_chain) {
        toggleButton(button);
        // provedeme p????slu??n?? zm??ny p??ep??na??e navazuj??c?? normy na vazebn??m m??st??, pokud je to pot??ebn??

        if (hodnota_button == false) { // p??vodn?? hodnota byla false, nyn?? je nov?? true, pokud je button true, mus?? b??t nav??zan?? pole rovn???? true (jde o implikaci, kter?? nep??ipou??t?? 1 => 0).
            let vysl = [];
            let nutnost_aktualizace = new Set();
            tabulka_vazeb.forEach( vazba => {
                if (vazba[1]==ind) {
                    let pojizdnik = document.getElementById(vazba[0].replace(/[/]/g,'-'));
                    pojizdnik.checked = true;
                    nutnost_aktualizace.add(vazba[0].replace(/N(\d+)[/].+/g,'$1'));
                    console.log(vazba[0]);
                    }
                });
            // nyn?? aktualizujeme i p????slu??n?? button
            nutnost_aktualizace.forEach( number => aktualizujButton(number) );
            }
        }
    }

function addOznaceni(myoznaceni) {

    if (!Array.from(obsazene_normy).map( x => x.oznaceni).includes(myoznaceni)) {
        obsazene_normy.add({oznaceni: myoznaceni});
    }
}

function formLogic(normain) {
    // na zadan??m normativn??m komplexu vytvo???? ??et??zce s logick??mi objekty, kter?? lze vyhodnotit pomoc?? funkc?? eval; v??stupem je tedy tabulka evaluovan??ch v??raz??
    // N1   ??et??zec k evaluaci
    // N2   ??et??zec k evaluaci
    // a d??le tabulka evaluovan??ch vazeb, kter?? svazuje hypot??zu konsekventn?? normy a p????slu??nou v??slednou logickou hodnotu evaluovan?? antecendentn?? normy
    //   N1.3   N2

    if ( (normain instanceof NormativeComplex) == true ) {

        // najdeme ????slo normy
        let ind = (indexofset(obsazene_normy,'oznaceni',normain.oznaceni)+1);

        // vytvo????me objekt - vlastn?? stejn?? jako print, akor??t komplexy ulo????me vazbu a zapomeneme a provedeme substituci
        let logickyObjekt = rozpadNCdopromennych(normain.vzorec.hypoteza, ind);
        myLog("v??stup", logickyObjekt);
        let vzorec_citelny = vzorec2text(logickyObjekt);

        vzorec = vzorec_citelny.replace(/([&|])/g,' $1$1 ').replace(/[/]/g,'-').replace(/NOT/g,' !').replace(/\s+/g,' ');

        // ulo????me vzorec do na???? tabulky

        obsazene_normy.forEach(
            el => {
                if (el.oznaceni == normain.oznaceni)
                    el.vzorec = vzorec;
                });

        /* V1

        vzorec = vzorecEvaluateNorm(vzorec);

        let list = document.getElementsByClassName("switch-input");

        for (let item of list) {
             item.addEventListener('input', (event) => {
                 // aktualizujeme logickou hodnotu buttonku
                 console.log("Jsem tu");
                 let button = document.getElementById("BN"+ind);
                 let hodnota_chain = eval(vzorec);

                 let hodnota_button = false;
                 if (button.classList.contains("success")) hodnota_button=true;

                 if (hodnota_button!=hodnota_chain) {
                     toggleButton(button);
                     }
                 });
             }

                */

        /* V2 synchronizace p??ep??na???? se stejn??m ID na str??nce evaluate */
        let list = document.getElementsByClassName('switch-input N'+ind);

        for (let item of list) {
            item.addEventListener('input', event => aktualizujButton(ind) );
            }
        return vzorec_citelny;
    }
    else console.error("Vstup nen?? normativn?? komplex.");
}

function textAreaInput() {
    let vystup = "<h1>Zad??n?? vstupn??ch dat</h1>";

    vystup += 'Zadejte pros??m do n????e uveden??ho pole vstupn?? data - soubor norem, kter?? chcete modelovat. <div id="resultreport"></div>';

    vystup += '<div class="float-right" style="width:150px"><button id="aktualizacekodu" type="button" class="button success" style="width:140px"><strong><i class="fi-refresh"></i> Aktualizovat</strong></button></div>';


    vystup += '<textarea id="textareabox" rows="30" name="textarea1" placeholder="Start here..."></textarea>';

    return vystup;

}

function resetInput() {
    // vyma??e ve??ker?? vstupy v r??mci prom??nn?? myinput
    zkratky = undefined;
    hlavni_dispozice = undefined;
    seznam_dispozic = undefined;

    var NormObjects = undefined;
    // Pole se seznamem v??ech objekt?? typu Norma
    for(var key in window) {
        var value = window[key];
        if (value instanceof Norma) {
            // foo instance found in the global scope, named by key
            // console.log(JSON.stringify(value));

            value=undefined;
        }
    }
}

mynewinput = "";

function poslechAktualizaciTextArea() {
    let button = document.getElementById("aktualizacekodu");
    button.addEventListener("click", event => {
        resetInput();
        let success = true;
        try {
            mynewinput = document.getElementById("textareabox").value;
            window.eval(mynewinput);
            }
        catch (exception_var)  {
            document.getElementById('resultreport').innerHTML='<div class="callout alert"><strong>Chyba!</strong> Aktualizace k??du prob??hla ne??sp????n??: '+ exception_var+'</div>';
            success = false;
        }
        if (success) {
            document.getElementById('resultreport').innerHTML='<div class="callout success"><strong>??sp??ch!</strong> Aktualizace k??du prob??hla ??sp????n??.</div>';
        }
    });
}
