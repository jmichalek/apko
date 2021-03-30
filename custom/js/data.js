/* DATOVÉ STRUKTURY */

let InfZ = "zákon č. 106/1999 Sb., o svobodném přístupu k informacím";

let ZUI = "zákon č. 412/2005 Sb., o ochraně utajovaných informací a o bezpečnostní způsobilosti";

let NVSUT = "nařízení vlády č. 522/2005 Sb., kterým se stanoví seznam utajovaných informací";

let seznam_dispozic = [
    "poskytnutí požadované informace by bylo podle platového nálezu nepřiměřené",
    "informace je označena za utajovanou informaci v souladu s právními předpisy",
    "informace je osobním údajem",
    "pro informaci je stanovena výjimka týkající se příjemců veřejných prostředků",
    "pro informaci je stanovena výjimka týkající se veřejně činných osob",
];

let ustanoveni = {
    zakon: InfZ,
    cislo: "§ 7 věta prvá",
    ustanoveni: "Je-li požadovaná informace v souladu s právními předpisy označena za utajovanou informaci, k níž žadatel nemá oprávněný přístup, povinný subjekt ji neposkytne.",
    norma:
        - "InfZ § 7/I"
};

var norma1 = new Norma("InfZ § 7/I",
    "informace je označena za utajovanou informaci & žadatel nemá oprávněný přístup k informaci & informace je označena za utajovanou informaci v souladu s právními předpisy => povinný subjekt neposkytne informaci");

// var norma2 = new Norma("Zkouška",
//     " ((V1&(V2 | NOT(V3) ) & V4 & ( V5 | V6) )) => Dispozice ");

var norma3 = new Norma("§ 2 ZUI",
    "(vyzrazení nebo zneužití informace může způsobit újmu zájmu České republiky | vyzrazení nebo zneužití informace může být pro zájem České republiky nevýhodné) & informace je druhu, který je uveden v seznamu utajovaných informací podle " + NVSUT + " <=> informace je označena za utajovanou informaci v souladu s právními předpisy");

var norma4 = new Norma("§ 3 ZUI",
    "vyzrazení nebo zneužití informace může způsobit poškození nebo ohrožení zájmu České republiky <=> vyzrazení nebo zneužití informace může způsobit újmu zájmu České republiky");

var hlnorma = new Norma("§ 12 InfZ",
    "není stanoveno, že zákon se poskytování informace nevztahuje &     informace se vztahuje k působnosti povinného subjektu & není stanoveno, že povinnost poskytovat informace se dané informace netýká & není stanoveno, že povinný subjekt informaci neposkytne & (povinný subjekt má úplnou povinnost poskytovat informace | je dána částečná informační povinnost povinného subjektu ve vztahu k požadované informaci ) & (není stanoveno, že povinný subjekt může požadovanou informaci odepřít | ( povinný subjekt informaci může odepřít & na odepření informace je legitimní zájem s ohledem na čl. 17 Listiny práv a svobod & nutnost ochrany informace s ohledem na legitimní zájem a na konkrétní okolnosti převažuje nad právem na informace ) ) <=> hmotněprávní důvody poskytnutí informace povinným subjektem jsou dány");

var norma5 = new Norma("§ 8a odst. 1 InfZ",
    "(informace se týká osobnosti, projevů osobní povahy nebo soukromí fyzické osoby | informace je osobním údajem) & poskytnutí informace by bylo v rozporu se právním právním předpisem, který upravuje její ochranu & NOT(pro informaci je stanovena výjimka týkající se příjemců veřejných prostředků |  pro informaci je stanovena výjimka týkající se veřejně činných osob) => povinný subjekt neposkytne informaci");

var norma6 = new Norma("čl. 4 bod 1 nařízení GDPR I.",
    "informace je o fyzické osobě & (fyzická osoba je identifikovaná | fyzická osoba je identifikovatelná) <=> informace je osobním údajem");

var norma7 = new Norma("čl. 4 bod 1 nařízení GDPR II.",
    "fyzickou osobu lze přímo či nepřímo identifikovat, zejména odkazem na určitý identifikátor, například jméno, identifikační číslo, lokační údaje, síťový identifikátor nebo na jeden či více zvláštních prvků fyzické, fyziologické, genetické, psychické, ekonomické, kulturní nebo společenské identity této fyzické osoby <=> fyzická osoba je identifikovatelná");

var norma8 = new Norma("§ 8b odst. 1, 3 InfZ",
    "informace je základním osobním údajem o osobě & povinný subjekt poskytl příjemci veřejné prostředky & NOT( na informaci se výjimka týkající se příjemců veřejných prostředků nevztahuje) <=> pro informaci je stanovena výjimka týkající se příjemců veřejných prostředků");

var norma9 = new Norma("§ 8b odst. 2 InfZ",
    "informace se týká jen poskytování veřejných prostředků podle zákonů v oblasti sociální, poskytování zdravotních služeb, hmotného zabezpečení v nezaměstnanosti, státní podpory stavebního spoření nebo státní pomoci při obnově území => na informaci se výjimka týkající se příjemců veřejných prostředků nevztahuje");

var norma10 = new Norma("§ 8b odst. 3 InfZ",
    "informace je jménem, příjmením, rokem narození, obcí, kde má fyzická osoba trvalý pobyt nebo výše, účel či podmínka poskytnutých veřejných prostředků fyzické osobě <=> informace je základním osobním údajem o osobě");

var norma11 = new Norma("§ 2 ZFK písm. g)",
    "povinný subjekt poskytl příjemci veřejné finance, věci, majetková práva nebo jinou majetkovou hodnotu & majetková hodnota patřila před poskytnutím státu nebo jiné právnické osobě, která je orgánem veřejné správy ve smyslu zákona o finanční kontrole <=> povinný subjekt poskytl příjemci veřejné prostředky");

var norma12 = new Norma("§ 2 ZFK písm. a)",
    "majetková hodnota patřila před poskytnutím státu nebo státní příspěvkové organizaci, státnímu fondu, územnímu samosprávnému celku, městské části hlavního města Prahy, příspěvkové organizaci územního samosprávného celku nebo městské části hlavního města Prahy nebo jiné právnické osobě zřízené k plnění úkolů veřejné správy zvláštním právním předpisem nebo právnické osobě zřízené na základě zvláštního právního předpisu, která hospodaří s veřejnými prostředky => majetková hodnota patřila před poskytnutím státu nebo jiné právnické osobě, která je orgánem veřejné správy ve smyslu zákona o finanční kontrole");

var norma13 = new Norma("Platový nález/II. (bod 33 nálezu Ústavního soudu ze dne 3. 4. 2018, sp. zn. IV. ÚS 1200/16, bod 125 nálezu ÚS ze dne 17. 10. 2017, sp. zn. IV. ÚS 1378/16)",
    "byl proveden test proporcionality předvídaný platovým nálezem & poskytnutí požadované informace by bylo podle platového nálezu nepřiměřené => na informaci se výjimka týkající se příjemců veřejných prostředků nevztahuje");

var norma14 = new Norma("Platový nález/III. (bod 33 nálezu Ústavního soudu ze dne 3. 4. 2018, sp. zn. IV. ÚS 1200/16, bod 125 nálezu ÚS ze dne 17. 10. 2017, sp. zn. IV. ÚS 1378/16)", "NOT(poskytnutí informací je klíčové pro výkon práva žadatele na svobodu projevu & účelem vyžádání informace je přispět k diskusi o věcech veřejného zájmu & informace samotná se týká veřejného zájmu & žadatel o informaci plní úkoly či poslání dozoru veřejnosti či roli tzv. společenského hlídacího psa) <=> poskytnutí požadované informace by bylo podle platového nálezu nepřiměřené");

var norma15 = new Norma("§ 8a odst. 2 InfZ",
    "informace je osobním údajem & subjektem údajů je veřejně činná osoba, funkcionář nebo zaměstnanec veřejné správy & osobní údaj vypovídá o veřejné nebo úřední činnosti nebo o funkčním nebo pracovním zařazení subjektu údajů <=> pro informaci je stanovena výjimka týkající se veřejně činných osob");

var norma16 = new Norma("§ 12 InfZ",
        "NOT(zákon se poskytování informace nevztahuje) & informace se vztahuje k působnosti povinného subjektu & NOT (povinnost poskytovat informace se informace netýká) & NOT(povinný subjekt informaci neposkytne) & (povinný subjekt má úplnou povinnost poskytovat informace | je dána částečná informační povinnost povinného subjektu ve vztahu k informaci) & (NOT(povinný subjekt informaci může odepřít) | (povinný subjekt informaci může odepřít & na odepření informace je legitimní zájem s ohledem na čl. 17 Listiny práv a svobod & nutnost ochrany informace s ohledem na legitimní zájem s ohledem na konkrétní okolnosti převažuje nad právem na informace )) <=> jsou dány hmotněprávní důvody poskytnutí informace povinným subjektem");



/* STRÁNKY */

var puvodni_obrazovka = document.getElementById("obrazovka").innerHTML;

function show_page(mypage) {

  var obrazovka = document.getElementById("obrazovka");

  switch (mypage) {

      /* stránka BÁZE */
      case "baze":
          if (typeof NormObjects === 'undefined') NormObjects = createNormField();
          obrazovka.innerHTML = "<h1>Báze znalostí</h1>";
          for(let i = 0; i < NormObjects.length; i++) {
             obrazovka.innerHTML += NormObjects[i].printObsah();
             }
          break;

      /* stránka KOMPLEXY */
      case "komplexy":

          obrazovka.innerHTML = "<h1>Normativní komplexy</h1>";

        // normaprop = complexifyNorm(norma5);

        //  obrazovka.innerHTML += normaprop.printObsah();

          obrazovka.innerHTML += normView(norma5);
          break;

      case "cil":
          obrazovka.innerHTML = "<h1>Cílová dispozice</h1>";
          obrazovka.innerHTML+= '<form id="myForm"> \
            <select id="selectNumber"> \
                <option value="">Vyberte požadovanou dispozici</option> \
            </select> \
            </form> \
            <div id="obrazovkaposelectu"></div>';
          addMySelect();
          break;

      case "brouzdani":

          obrazovka.innerHTML = "<h1>Brouzdání v hlavní normě</h1>";

          let dispozice = "povinný subjekt neposkytne informaci";
          norma = joinAntecedents(childrenOfDispozice(dispozice), dispozice);
          normaprop = simplifyNorm(norma);


          // console.log(vzorec2text(podminky.vzorec.hypoteza));
          obrazovka.innerHTML += norma.printObsah();
          obrazovka.innerHTML += normaprop.printObsah();

          break;

      case "evaluate":
          obrazovka.innerHTML = "<h1>Vyhodnocení realizace hypotézy normy</h1>";

            // normaprop = complexifyNorm(norma5);

            //  obrazovka.innerHTML += normaprop.printObsah();

          obrazovka.innerHTML += normView(norma5, false, true);

          obrazovka.innerHTML += prehled_obsazenych_norem();

          break;

      default:
       obrazovka.innerHTML =  puvodni_obrazovka;

  }
  aktualizujOdkazy();
}
