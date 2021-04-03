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


/* Textové zpracování norem */

function hloubka(retezec) {
    // vrací pole stejné délky jako je řetězec, které udává hloubku vnoření (aktuální násobnost) závorek na dané pozici řetězce

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
            case ")": // odlišné pořadí
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
    // všechny části výrazu ve hloubce větší než 0 nahrazuje písmenem "z"
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
    // funkce zkontroluje, zda je počet závorek balancovaný
    // funkce po úpravě převzata; kredit: Rohan Paul citace: https://rohan-paul.github.io/javascript/2018/05/25/Parenthesis-Matching-Problem-in-JavaScript/
    ((thisChar === '(' && uptoPrevChar++ || thisChar === ')' && uptoPrevChar--));

    return uptoPrevChar;
}, 0) === 0 }

function odzavorkuj(vyraz) {
    // funkce odstraňující závorky ze začátku a konce (libovolný počet) řetězce

    var retezec = '';

    if (isBalanced(vyraz) == true)

    // dokud bude mít operace nějaký efekt, budeme postupně odebírat další a další vnější závorku
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
            // cond = false znamená, že není žádný mezikus v hloubce 0

            if (puvodni.charAt(0) == "(" && puvodni.charAt(puvodni.length-1 ) == ")" && cond == false ) {
                //console.log("Zkracujeme!");
                novy = puvodni.substring(1,puvodni.length-1).trim();
            }
        }
        while ( novy != puvodni );

    }
    else {
        console.error("Nesprávný počet závorek v řetězci vyhodnocovaném funkcí odzavorkuj(). Funkce odzávorkování nebude aktivována. Zadaný řetězec:\n \n "+ vyraz);
    }

    return novy;
}

function zpracujNormuNaJSON(vyraz) {
    // přijímá řetězec obsahující funkcní vzorec normy a vrací objekt obsahující strukturní vzorec { hypoteza: XX, dispozice: YY}
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
    // přijímá řetězec obsahující funkcní vzorec hypotézy a vrací objekt obsahující strukturní vzorec s poli označenými "konjunkce" a "disjunkce"
    // např. vstup: ((V1&(V2 | V3 ) & V4 & ( V5 | V6) ))
    // výstup: { "konjunkce": [ "V1", { "disjunkce": [ "V2", "V3" ] }, "V4", { "disjunkce": [ "V5", "V6" ] } ] }

    // dále přidáme negaci NOT(X) se propíše na { "negace" : X}

    // vyloučíme vnější závorky na začátku a na konci, pokud jsou

   vyraz = odzavorkuj(vyraz);

   // nejprve musíme ošetřit, že tam může být negace
   // console.log(vyraz);

   // console.log(vyraz.substring(0,3));


   let anditko = false;
   let oritko = false;
   zaslepeny = zaslep_vnorene_zavorky(vyraz);

   if ( zaslepeny.match(/[&]/gi) != null ) anditko = true;
   if ( zaslepeny.match(/[|]/gi) != null ) oritko = true;


   // hledáme symboly &, |
    if ( anditko == true && oritko == true ) console.error("Zadaný výraz je chybný, protože obsahuje na stejné úrovni konjunkci a disjnukci, nicméně program vyžaduje explicitní uzávorkování. Zadaný řetězec:\n \n "+ vyraz);

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
   // hledáme negaci
   else if ( vyraz.substring(0,3) == "NOT" ) {
       // console.log("Nalezena negace!");
       return { "negace" : funkcniVzorecNaJSON(vyraz.substring(3,vyraz.length))};
   }
   else if ( anditko == false && oritko == false ) return vyraz;



}

/* Základní syntaxe norem */

function labelOperace(prop) {
    // podle druhu operace vrací český ekvivalent slova
    if (prop == 'konjunkce') return 'současně';
    if (prop == 'disjunkce') return 'alternativně';
    if (prop == 'negace') return 'není pravda, že';
}

function switchOperace(prop) {
    // podle druhu operace vrací český ekvivalent slova
    if (prop == 'konjunkce') return 'disjunkce';
    if (prop == 'disjunkce') return 'konjunkce';
}

function signOperace(prop) {
    // podle druhu operace vrací český ekvivalent slova
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
        else { spojeni = " <strong>právě tehdy, pokud</strong>"; }

        return '<div>'+ capitalize(vzorec.dispozice) + spojeni + '</div>';
    }
    else return '<div>' + capitalize(vzorec.dispozice) + '</div>';
}

function Norma(myOznaceni, myObsah) {
    // konstruktor třídy pro normu, který je schopen výchozí metodou hezky tisknout obsah dané normy
    this.obsah = myObsah;
    this.oznaceni = myOznaceni;
    // console.log(this.obsah);
    this.vzorec = zpracujNormuNaJSON(this.obsah);
    this.printObsah = function(komplex) {
        komplex=komplex || false;

        let znak = "";
        if (komplex) znak = "⇑";
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
    let id = str    .replace("§ ","par")
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
    let ind = (indexofset(obsazene_normy,oznaceni)+1);
    nid = normID(ind,...mylevel);

    return '<div class="float-right" style="width:150px">\
    <div class="switch tiny" style="display:inline">\
  <input class="switch-input" id="'+nid.replace(/[/]/g,"-")+'" type="checkbox"\
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
            vystup += '<button type="button" id="B'+name+'" class="success button" style="width:140px"><strong><i class="fi-check"></i> platí</strong></button>';
            break;
        default:
            vystup += '<button type="button" id="B'+name+'" class="button" style="width:140px"><strong><i class="fi-x"></i> neplatí</strong></button>'
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
            button.innerHTML = '<strong><i class="fi-x"></i> neplatí</strong>';
            break;
        default:
            button.classList.add("success");
            button.innerHTML = '<strong><i class="fi-check"></i> platí</strong>';
    }
}


function printJSONhypotezy(slozenina,baleni,prepinac = false,oznaceni = "" ,...level ) {
    if ((typeof level[0])=='undefined') level = [];
    // podle zadaného JSONu normy vytiskne hezký výstup v položkovém seznamu
    // balení je logická hodnota true/false, zda se má tisknout rozklik, výchozí hodnota je, že nikoliv
    // přepínač je zda má být aktivován mód s přepínači
    baleni = baleni || false;

    //    prepinac = prepinac || false;

    if (slozenina.hasOwnProperty('konjunkce') || slozenina.hasOwnProperty('disjunkce') ) {
        let pole = slozenina[Object.keys(slozenina)[0]];
        if (! Array.isArray(pole)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");
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
        // vypsání příslušného komlexu
        let pole = slozenina['komplex'];
        if (! Array.isArray(pole)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");

        let vystup = pole[0]["vzorec"]["dispozice"];
        if (prepinac === true) vystup+= addPrepinac(vystup,oznaceni,...level);

        vystup+= "<blockquote>";

        // prvky tohoto pole jsou další normativní komplexy
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
    // podle zadaného JSONu podmínek vytiskne standardizovaný textový výstup
    if (slozenina.hasOwnProperty('konjunkce') || slozenina.hasOwnProperty('disjunkce') ) {
        var pole = slozenina[Object.keys(slozenina)[0]];
        if (! Array.isArray(pole)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");

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

/* Trasování norem */

function createNormField() {
    // vytvoří na zavolání pole se seznamem všech objektů třídy Norma
    /* Následujících pár řádků z https://stackoverflow.com/questions/2602800/how-to-get-all-objects-of-a-given-type-in-javascript */

    var NormObjects = [];
    // Pole se seznamem všech objektů typu Norma
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
    // funkci se zadává dispozice a vrací pole s normami, jejichž konsekventy odpovídají testované dispozici; pokud takové nejsou, vrací prázdné pole
    var ResNormObjects = [];

    if (typeof NormObjects === 'undefined') NormObjects = createNormField();

    for(let i = 0; i < NormObjects.length; i++) {
        // console.log(NormObjects[i].vzorec.dispozice);
        if ( NormObjects[i].vzorec.dispozice == testovanaDispozice )
            ResNormObjects.push(NormObjects[i]);
    }
    // console.log("Testování dětí");
    // console.log(ResNormObjects);
    return ResNormObjects;

}

function joinAntecedents(pole, dispozice){
    // funkce dostává pole se seznamem norem a dispozicí a vrací normu vzniklou souborem všech podmínek; pokud se používá ve spojení s childrenOfDispozice, je třeba pamatovat na to, že prezentace výsledku jako alternativy není informačně ekvivalentní, ale jde pouze implikace; proto je vhodnější to řešit přes komplexy

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

/* Zjednodušující operace na normách */

function propagateNegation(tvar) {
    // funkce přebírá tvar typu {negace: dijunkce: A, B} a negaci převede na nejnižší stupeň dolů, tj. na {konjunkce: negace A a negace B}, kde A a B mohou stále být složené výroky
    if (tvar.hasOwnProperty("negace")) {
        let child = tvar[Object.keys(tvar)[0]];

        if (child.hasOwnProperty("konjunkce") || child.hasOwnProperty("disjunkce")) {
            let operator = Object.keys(child)[0];
            let pole = child[operator];
            if (! Array.isArray(pole)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");
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
            return child["negace"]; // dvakrát negace je identita
        }
        else return {negace: child};
    }
    else return tvar;

}

function propagateOperation(tvar, operator) {
    // funkce přebírá tvar typu {disjunkce: A, disjunkce(B,C) } převádí ho na tvar (disjunkce: A, B, C); pokud tam toto řetězení není, vrací false
    if (operator != "konjunkce" && operator != "disjunkce") console.error("Zadána chybná operace");

    if (tvar.hasOwnProperty(operator)) {
        let child = tvar[operator];
        // console.log(child);
        if (! Array.isArray(child)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");

        let novePole = [];

        child.forEach(el => {

            if (el.hasOwnProperty(operator)) {
                novePole = novePole.concat(el[operator]);
                // console.log(novePole);
            }
            else {
                // převezmeme bez změny
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
    // funkce přebírá část stromového tvaru, který zjednoduší tak, aby formule typu X AND (Y AND Z) byla převedena na https://en.wikipedia.org/wiki/Conjunctive_normal_form
    // konjunktivní normální forma např. jako u t.č. podvodu, tedy současné naplnění několika znaků, přičemž některé z nich mohou připouštět alternativy
    // https://en.wikipedia.org/wiki/Negation_normal_form
    // jde v pořadí o následující operace:
    // propsání negace
    // odstranění dvojité negace
    // distribuční zákon pro stejné
    // distribuční zákon pro jiné

    // for each node
    //

    /* následující řádky inspirovány z  https://stackoverflow.com/questions/722668/traverse-all-the-nodes-of-a-json-object-tree-with-javascript/722732 */


    if ( slozenina.hasOwnProperty('negace') ) return propagateNegation(slozenina);

    else if ( slozenina.hasOwnProperty('konjunkce') || slozenina.hasOwnProperty('disjunkce') ) {
        let operator = Object.keys(slozenina)[0];
        let pole = slozenina[operator];

        if (! Array.isArray(pole)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");
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

    else return slozenina;


}

function logicalSimplifyOperation(slozenina, operator) {
    // provede operaci propagateOperation na všech součástkách

    test = propagateOperation(slozenina, operator);

    // console.log(test);

    // máme tam daný operátor
    if ( test != false )
    {
        return propagateOperation(slozenina, operator);
    }

    // nebo tam můžeme mít opačný operátor, potom je potřeba funkci rekurzivně uplatnit na všechny prvky pole
    else if ( slozenina.hasOwnProperty(switchOperace(operator))) {
        let pole = slozenina[switchOperace(operator)];

        if (! Array.isArray(pole)) console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");
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
    if (typeof normainput == false) console.error("Zadaný vstup není normou");
    let slozenina = normainput.vzorec.hypoteza;

    let zjednodusena =logicalSimplifyOperation(logicalSimplifyOperation(logicalSimplifyNegation(slozenina), "konjunkce"), "disjunkce");

    // console.log(zjednodusena);

    normaoutput = new Norma(normainput.oznaceni + " (základní tvar)",
                vzorec2text(zjednodusena) + " => " + normainput.vzorec.dispozice);
    return normaoutput;
}

function simplifyNC(normain) {
    /* dostanu zadaný normativní komplex a vrátím ho po provedení formálního zjednodušení, tj. v rámci jeho hlavní struktury budou provedeny potřebné substituce, nicméně toto se již nebude propisovat dovnitř */

    if ( (normain instanceof Norma) == true || (normain instanceof NormativeComplex) == true )  { // vstupem je norma

        let slozenina = normain.vzorec.hypoteza;

        let zjednodusena =logicalSimplifyOperation(logicalSimplifyOperation(logicalSimplifyNegation(slozenina), "konjunkce"), "disjunkce");

        normaoutput = new NormativeComplex(normain.oznaceni, zjednodusena, normain.vzorec.dispozice, normain.vzorec.ekvivalence);

        return normaoutput;


    }

    else console.error("Zadaný vstup není normou");

}


function traceHypothesis(dispozice) {
    // funkci zadáme dispozici a vrací dohledanou hypotézu
    let norma = joinAntecedents(childrenOfDispozice(dispozice), dispozice);
    if (norma == false) return false;
    return simplifyNorm(norma);
}

/* Rozklikávání a grafické prvky */

function addListenerRozklik(el) {
    // přidává naslouchátko pro rozklikávání odkazu
    // console.log("click all right");
    el.addEventListener("click", function() {

        let hypo = el.parentElement.firstChild.nodeValue.trim();
        normahypo = traceHypothesis(hypo);
        let dovetek = "";
        if (normahypo == false) dovetek = '<div class="error">v systému nebyla nalezena norma s daným konsekventem</div>';
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

function normView(norma5, long = false, prepinac = false) {
    let output="";
    output += '<div data-alert class="callout info>"><h2>Zadaná dispozice</h2><p><strong>'+norma5.vzorec.dispozice+'</strong></p></div>';

    normaprop2 = complexifyNorm(norma5);
    normaprop3 = reduceNorm(normaprop2);

    if (long) {
        output += "<h2>Vstupní podoba</h2>";
        output += infoBox('<strong>Vstupní podobou</strong> máme na mysli výpis předpokladů s daným následkem v souboru všech norem v systému');

        output += normaprop2.printObsah();
        console.log(normaprop2);

        console.log("předěl!")

        output += "<hr/><h2>Pokrácená podoba</h2>";
        output += infoBox("<strong>Pokrácenou podobou</strong> máme na mysli, že se v normativním komplexu nahradí všechny dispozice spojené jednoduchými ekvivalencemi s navazující normou přímo hypotézou této navazující normy, čímž se celá norma zjednoduší.");

        //console.log(normaprop3);
        console.log(normaprop3);
        customLog("vstup",normaprop3);

        output += normaprop3.printObsah();
    }
    output += "<hr/><h2>Zjednodušená podoba</h2>";
    output += infoBox("<strong>Zjednodušenou podobou</strong> máme na mysli, že se všechny negace převedou na atomární členy výrazu a pospojují se případné výčty konjunkcí a disjunkcí.");


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

            let norma = new Norma("Vybraná dispozice", dispozice+ ' <=> ' +dispozice);

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
    let mypages = ["home","baze", "cil", "brouzdani", "komplexy", "evaluate"];
    let mypage = location.hash.substr(1);
    if (mypages.includes(mypage)) {
        show_page(mypage);
    }
}


/* Nasouchače událostem pro celý dokument */

document.addEventListener("DOMContentLoaded", function(e) {

    handleHash();

    /* addMenu(); */

    /* sledování na jaké jsme stránce */
    window.addEventListener("hashchange", function() {
        handleHash();
        aktualizujOdkazy();
        });

    let list = document.getElementsByClassName("switch-input");

    /* synchronizace přepínačů se stejným ID na stránce evaluate */
    for (let item of list) {

        item.addEventListener('input', (event) => {
                // přepneme tlačítka se stejným názvem
                let jmenovci = document.getElementsByName(event.currentTarget.name);
                for (let jmenovec of jmenovci) {
                    jmenovec.checked = event.currentTarget.checked;
                    }
            });
    }

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

/* Normativní komplexy */

function NormativeComplex(myoznaceni, myhypoteza, mydispozice, myekvivalence) {
    // konstruktor třídy pro normativní komplex (řetězec vyplývání)

    this.oznaceni = myoznaceni;
    // console.log(this.obsah);
    this.vzorec = {"hypoteza": myhypoteza, "dispozice": mydispozice, "ekvivalence": myekvivalence};
    //myLog("výstup",this.vzorec);


    this.printObsah = function(komplex) {
        komplex=komplex || false;
        let znak = "";
        if (komplex) {
            if (this.vzorec.ekvivalence) znak = "⇕";
            else znak = "⇑";
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
            if (this.vzorec.ekvivalence) znak = "⇕";
            else znak = "⇑";
        }

        obsazene_normy.add(this.oznaceni);
        console.log(obsazene_normy);

        let ind = (indexofset(obsazene_normy,this.oznaceni)+1);

        var vystup = "<h3>"+znak+" "+this.oznaceni+" (dále jen „N"+ind+"“)</h3>"+validityButton("N"+ind, false)+"\n\n";



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
         vrací objekt, kde v logické grafové struktuře jsou dotazy */


}

function printObj(obj) {

    console.log("%c"+ json2yaml(JSON.stringify(obj,null,1)) ,"color:black;");
}

function myLog(text, obj) {

    switch (text) {
        case "vstup":
            color = "green";
            break;
        case "výstup":
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
    // funkci zadáme Normu, např. .vzorec.hypoteza = { konjunkce: A, B}, přičemž
    // funkce provede pro všechny prvky substituci A -> {komplex: -hypoteza: A -normy: - X, Y}, přičemž X, Y jsou Normy, které mají danou hypotézu jako konsekvent; výslednou strukturu nazýváme řetězec vyplývání; toto provádí tak dlouho, dokud nejsou všechny normy nahrazeny komplexem, pokud to lze; nicméně každá norma, která se vyskytuje jako hypotéza v komplexu se rozvine pouze jednou a na dalších místech se již na komplex nerozvádí, aby nebyly ve struktuře zbyduplicity; funkci můžeme také zadat složeninu (hypotézu)

    // myLog("vstup",normainput);

    if ( (normainput instanceof Norma) == true || (normainput instanceof NormativeComplex) == true ) // vstupem je norma
    {
        // console.log("Vstupem je norma, typ "+normainput.constructor.name+".");
        // pokud je vstupem norma, vrátíme tutéž normu s upravenou hypotézou
        let normaoutput = new NormativeComplex(normainput.oznaceni, complexifyNorm(normainput.vzorec.hypoteza), normainput.vzorec.dispozice, normainput.vzorec.ekvivalence);
        // myLog("výstup",normaoutput);
        return normaoutput;
    }
    else { // vstupem je složenina
        //console.log("Vstupem je složenina.");
        let hypoteza = normainput;

        // nyní mohou nastat 2 případy: 1. hypoteza je prostý text, 2. hypotéza je složenina (v první úrovni konjunkce, disjunkce, negace)

        let operace = Object.keys(hypoteza)[0];
        // v případě stringu je to 0, ale to je jedno
        // jinak je to konjunkce, disjunkce, negace

        if (typeof hypoteza == "string" ) {
        // nejprve se otestuje, zda v systému vůbec máme nějaké normy, jichž je hypotéza konsekventem

            let deti = childrenOfDispozice(hypoteza);
            //console.log(deti);
            //console.log(deti.length);

            if ( deti.length == 0 )
            {
                // myLog("výstup",hypoteza);
                return hypoteza;
            }

            else {
                let vysledek = {};
                //myLog("výstup",deti);
                vysledek.komplex = deti.map( x => complexifyNorm(x));
                //myLog("výstup",vysledek);
                return vysledek;
            }
        }

        else if (typeof hypoteza == "object" && seznam_povolenych_operaci.includes(operace) ) {

            let child = hypoteza[operace];

            //myLog("dítě",child);

            if (seznam_narnich_operaci.includes(operace) ) {

                if (!Array.isArray(child) ) {
                console.error("Chyba ve formátování vstupního objektu. Objekt není typu Pole.");}

                // má k dispozici pole, stačí na každý jeho prvek aplikovat obdobnou funkci

                let vysledek = {};
                vysledek[operace] = child.map( x => complexifyNorm(x) );
                //myLog("výstup",vysledek);
                return vysledek;
            }
            else if (operace == "negace") {
                let vysledek = {};
                vysledek[operace] = complexifyNorm(child) ;
                //myLog("výstup",vysledek);
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
    // na zadané normě nebo složenině aplikuje operaci redukce, tedy nahrazení ekvivalencí přímo hypotézami

    // tedy vstupem je complex { hypoteza typu komplex, dispozice}, tedy podívám se na hypotézu, pokud je u ní ekvivalence true, tak můžu nahradit, jinak aplikuju na hypotézu tutéž funkci a vrátím výstup


    // mohou nastat následující případy
    // 1. je to instance komplexu
    // 2. je to složenina
    // 3. je to vnořený komplex - pak provedeme redukci
    // 4. je to literál (string)

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

function prehled_obsazenych_norem() {
    let i=0;
    let vystup = "<h2>Přehled obsažených normativních zdrojů</h2><dl>";
    obsazene_normy.forEach( el => {
        i++;
        vystup += "<dt>N"+i+"</dt> <dd>"+el+"</dd>";
    }

    );
    return vystup+"</dl>";
}

function indexofset(myset, member) {
    let arr = Array.from(myset);
    return arr.indexOf(member);
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
        //myLog("výstup",vysledek);

        return vysledek;
    }

    else if ( normain.hasOwnProperty('komplex') ) {
        // pp.: tabulka evaluovaných vazeb, která svazuje hypotézu konsekventní normy a příslušnou výslednou logickou hodnotu evaluované antecendentní normy
        //   N1.3   N2

        let children = normain['komplex'];

        children.forEach( child =>  {
            let ind2 = (indexofset(obsazene_normy,child.oznaceni)+1);
            tabulka_vazeb.push([normID(ind,...level),ind2]);
        });

        return rozpadNCdopromennych("dummy",ind,...level);
    }

    else if ( (typeof normain) == 'string') {
        let vystup = normID(ind,...level);
        //myLog("vstup", normain);
        //myLog("výstup",vystup);

        return vystup;
    }

    else {
        //myLog("výstup", "PROBLEM");
        //myLog("výstup", normain);
        return false;}
}

var tabulka_vazeb = [];

function vzorecEvaluateNorm(vzorec) {
    vzorec = vzorec.replace(/(N\d+\-(H|(\d\.)*(\d)))/g, 'document.getElementById("$1").checked');
    return vzorec;
}

function formLogic(normain) {
    // na zadaném normativním komplexu vytvoří řetězce s logickými objekty, které lze vyhodnotit pomocí funkcí eval; výstupem je tedy tabulka evaluovaných výrazů
    // N1   řetězec k evaluaci
    // N2   řetězec k evaluaci
    // a dále tabulka evaluovaných vazeb, která svazuje hypotézu konsekventní normy a příslušnou výslednou logickou hodnotu evaluované antecendentní normy
    //   N1.3   N2

    if ( (normain instanceof NormativeComplex) == true ) {

        // najdeme číslo normy
        let ind = (indexofset(obsazene_normy,normain.oznaceni)+1);

        // vytvoříme objekt - vlastně stejně jako print, akorát komplexy uložíme vazbu a zapomeneme a provedeme substituci
        let logickyObjekt = rozpadNCdopromennych(normain.vzorec.hypoteza, ind);
        myLog("výstup", logickyObjekt);
        let vzorec = vzorec2text(logickyObjekt);
        vzorec = vzorec.replace(/([&|])/g,' $1$1 ').replace(/[/]/g,'-').replace(/NOT/g,' !').replace(/\s+/g,' ');
        vzorec = vzorecEvaluateNorm(vzorec);

        let list = document.getElementsByClassName("switch-input");

        /* synchronizace přepínačů se stejným ID na stránce evaluate */

        for (let item of list) {

            item.addEventListener('input', (event) => {
                    // aktualizujeme logickou hodnotu buttonku
                    let button = document.getElementById("BN"+ind);
                    let hodnota_chain = eval(vzorec);

                    let hodnota_button = false;
                    if (button.classList.contains("success")) hodnota_button=true;

                    if (hodnota_button!=hodnota_chain) {
                        toggleButton(button);
                        }
                    });
        }
    }
    else console.error("Vstup není normativní komplex.");
}
