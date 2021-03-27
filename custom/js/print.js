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
