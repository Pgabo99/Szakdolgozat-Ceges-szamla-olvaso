import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Bills } from '../../classes/Bill';
import { Users } from '../../classes/Users';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private angularFirestore: AngularFirestore, private router: Router, private dialog: MatDialog) { }

  //File feltöltése
  addFiles(bill: Bills) {
    return this.angularFirestore.collection<Bills>('Files').add(bill);
  }

  //File lekérése
  getFileByName(fileName: string, email: string) {
    return this.angularFirestore.collection<Bills>('/Files', ref => ref.where('fajlNev', '==', fileName).where('email', '==', email)).valueChanges();
  }

  //File lekérése
  getFileByEmail(email: string) {
    return this.angularFirestore.collection<Bills>('/Files', ref => ref.where('email', '==', email)).valueChanges();
  }

  //File adatainak frissítése
  updateFile(file: Bills) {
    return this.angularFirestore.collection('Files', (ref) => ref.where('fajlNev', '==', file.fajlNev).where('email', '==', file.email)).get().subscribe(
      (querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          doc.ref.update(file);
        });
      }
    );
  }

  //Fajl feldolgozasa
  processingText(szoveg: string, user: Users, fileName: string): Bills {
    let bill: Bills = {
      email: user.email,
      fajlNev: fileName,
      szamlaszam: "",
      szallitoNev: '',
      szallitoAdo: '',
      szallitoIrsz: 0,
      szallitoTelepules: '',
      szallitoCim: '',
      fizKelt: '',
      fizTeljesites: '',
      fizHatarido: '',
      fizMod: '',
      netto: "",
      brutto: "",
      afa: "",
    }

    let darabok = szoveg.split("\n");
    let fizetesB = false;

    const szamlaszamKulcs = ["szállító", "vevó", "vevő", "sorszám", "számlaszám", "számla"];
    let szallitoadatokB = true;
    let szallitoAdatok = "";

    darabok.forEach(element => {
      let vizsgal = element.toLowerCase();

      //Számlaszám felismerése
      if (bill.szamlaszam === "" && szallitoadatokB && szamlaszamKulcs.some(kulcsszo => vizsgal.includes(kulcsszo))) {
        const regex = new RegExp(szamlaszamKulcs.join('|'), 'gi');
        bill.szamlaszam = element.replace(regex, '').trim().replace(/^[\s,:-]+/, '');
      }

      //Fizetési adatok (a szállítási adatok felismerése miatt fontos itt megvizsgálni) 
      if (vizsgal.includes("fizetés") && vizsgal.includes("mód") && bill.fizMod === "") {
        fizetesB = false;
      }

      if (vizsgal.indexOf("összes") != -1 || vizsgal.indexOf("Összes") != -1 || vizsgal.indexOf("értékesítés") != -1 || vizsgal.indexOf("érték") != -1) {
        let result = element.replaceAll(" ", "").replaceAll("-", "").replace(/^[^0-9]+/, "");

        if (vizsgal.indexOf("27") != -1) {
          result = element.replaceAll(" ", "").replaceAll("-", "").replace(/[^0-9]+/, "").replace(/^[^0-9]+/, "");
        }
        let resultFt = result.split("Ft").filter(item => item !== "");
        if (resultFt.length > 2) {
          bill.brutto = resultFt[resultFt.length - 1];
          bill.afa = resultFt[resultFt.length - 2]
          bill.netto = resultFt[resultFt.length - 3]
        }
        else {
          let result = element.replace(/^[^0-9]+/, "").replaceAll("-", "");
          let resultFt = result.split(" ").filter(item => item !== "" && item.toLowerCase() != "ft");
          let resultFt2: string[] = ["", "", ""];
          let index = 0;
          while (index < resultFt.length) {
            if (resultFt2[0].length < 3)
              resultFt2[0] += resultFt[index]
            else if (resultFt2[1].length < 3)
              resultFt2[1] += resultFt[index]
            else {
              resultFt2[2] += resultFt[index]
            }
            index++;
          }
          bill.brutto = resultFt2[0];
          bill.afa = resultFt2[1]
          bill.netto = resultFt2[2]
        }
      }
      if (vizsgal.indexOf("fizetendő") != -1 || (vizsgal.indexOf("végösszeg") != -1) && bill.brutto == "") {
        let result = element.replaceAll(" ", "").replace(/^[^0-9]+/, "").replaceAll("Ft", "");
        bill.brutto = result;
      }

      //Szállító adatok felismerése
      if (fizetesB || vizsgal.includes(user.companyName.toLowerCase())) {
        szallitoAdatok += this.szallitoAdatokFeld(user, element, vizsgal) + "\n";
        fizetesB = true;
        szallitoadatokB = false;
      }

      bill = this.szallitoAdatokFeldRegex(user, element, bill);

      if (bill.szallitoAdo === "" && bill.szallitoCim === "" && bill.szallitoIrsz === 0 && bill.szallitoTelepules === "") {
        bill.szallitoNev = element;
      }

      bill = this.fizmod(vizsgal, bill);
      if (bill.fizHatarido === '' || bill.fizTeljesites === '' || bill.fizKelt === '') {
        bill = this.fizIdo(vizsgal, bill);
      }
    });

    let szallitoDarabok = szallitoAdatok.split('\n');
    if (bill.szallitoNev === '' || bill.szallitoNev.toLowerCase().includes(user.companyName.toLowerCase())) {
      bill.szallitoNev = szallitoDarabok[0];
    }

    // A szallitoAdatokFeld() függvény által kapott szállító adatok feldolgozása
    szallitoDarabok.forEach(element => {
      let vizsgal = element.toLowerCase();

      if (vizsgal.includes("adószám") && bill.szallitoAdo === "" && !vizsgal.includes("eu") && !vizsgal.includes("hu")) {
        bill.szallitoAdo = element.substring(element.search(/\d/), element.length).trim().split(' ')[0];
      }

      if (bill.szallitoIrsz !== 0 && bill.szallitoCim === "") {
        bill.szallitoCim = element;
      }

      //Cím felismerése
      if (bill.szallitoIrsz === 0 && /^\d{4}/.test(element)) {
        bill.szallitoIrsz = element.substring(0, 4) as unknown as number;
        if (element.trim().length != 4) {
          let cimDarabok = element.split(' ');
          if (cimDarabok[1].trim().endsWith(','))
            bill.szallitoTelepules = cimDarabok[1].slice(0, -1).trim();
          else
            bill.szallitoTelepules = cimDarabok[1].trim();
          let index = 2;
          if (bill.szallitoCim === '') {
            while (index < cimDarabok.length) {
              bill.szallitoCim += cimDarabok[index] + ' '
              index++;
            }
            bill.szallitoCim = bill.szallitoCim.trim();
          }
        }
      }
    });

    // Végső ellenőrzés, hogy ne tartalmazzon hibás adatokat a számla
    bill = this.szallitoMod(bill, user);
    bill = this.penzFeld(bill);
    bill = this.fizIdoNotFound(bill);
    this.addFiles(bill)

    return bill;
  }

  //Ha egysorban a vevő és szállító ugyanazon adatai vannak
  szallitoAdatokFeld(user: Users, szoveg: string, vizsgal: string): string {
    let returnString = "";
    var meddig = szoveg.length;

    if (vizsgal.indexOf(user.companyName.toLowerCase()) !== -1 && meddig === szoveg.length) {
      meddig = vizsgal.indexOf(user.companyName.toLowerCase());
    }

    if (vizsgal.indexOf(user.taxNumber) !== -1 && meddig === szoveg.length) {
      meddig = vizsgal.indexOf(user.taxNumber.toLowerCase());
      let adoszamhely = vizsgal.lastIndexOf("adoszam");
      if (adoszamhely !== -1 && meddig - adoszamhely - 7 < 3) {
        meddig = adoszamhely;
      }
    }

    if (vizsgal.lastIndexOf(user.country.toLowerCase()) !== -1 && meddig === szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.country.toLowerCase());
      if (meddig < 2) {
        meddig = szoveg.length;
      }
    }

    if (vizsgal.lastIndexOf(user.site.split(' ')[0].toLowerCase()) !== -1 && meddig === szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.site.split(' ')[0].toLowerCase());
      if (meddig < 6) {
        meddig = szoveg.length;
      }
    }

    if (vizsgal.lastIndexOf(user.zipCode.toString()) !== -1 && meddig === szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.zipCode.toString());
      if (meddig < 2) {
        meddig = szoveg.length;
      }
    }

    if (vizsgal.lastIndexOf(user.city.toLowerCase()) !== -1 && meddig === szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.city.toLowerCase());
      if (meddig < 6) {
        meddig = szoveg.length;
      }
    }

    if (returnString === "")
      returnString += szoveg.substring(0, meddig);
    return returnString;
  }

  szallitoAdatokFeldRegex(user: Users, szoveg: string, returnObject: Bills): Bills {
    let vizsgal = szoveg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Adószám
    const taxNumberRegex = /\b\d{8}-\d-\d{2}\b/;
    if (returnObject.szallitoAdo === '' && taxNumberRegex.test(szoveg.replace(/\s+/g, ""))) {
      let taxNumber = szoveg.match(taxNumberRegex);
      if (taxNumber && taxNumber[0].replaceAll(" ", "").trim() !== user.taxNumber) {
        returnObject.szallitoAdo = taxNumber[0].replaceAll(" ", "").trim();
      }
    }

    if (!returnObject.szallitoCim) {
      // Cím, ha már megvan az irányítószám és a város
      if (returnObject.szallitoIrsz !== 0 && returnObject.szallitoTelepules !== '') {
        let cim = szoveg;
        if (cim.trim() !== user.site) {
          returnObject.szallitoCim = cim.trim();
        }
      }

      // Irányítószám Város/ Irányítószám Város, Cím
      const irszVarosSiteRegex = /\d\d\d\d\s+[A-Za-z\- ]+/i;
      const fullSiteRegex = /\d\d\d\d\s+[A-Za-z\- ]+, ([A-Za-z\- ]+( [A-Za-z0-9\- ]+)+)\./i;
      if (fullSiteRegex.test(vizsgal)) {
        const siteMatch = vizsgal.match(fullSiteRegex)![0];
        const irszam = siteMatch.match(/\d{4}\s/g);
        const varosFromTo = this.fromToString(vizsgal.split(irszam + "")[1].match(/[A-Za-z\- ]+,/g)![0], vizsgal);
        const cim = szoveg.split(szoveg.substring(varosFromTo[0], varosFromTo[1]) + "")[1].trim();

        // Nem egyezik meg a vevő/felhasználó címével
        if (!cim.includes(user.site)) {
          returnObject.szallitoIrsz = irszam![0].replaceAll(" ", "").trim() as unknown as number;
          returnObject.szallitoTelepules = szoveg.substring(varosFromTo[0], varosFromTo[1]).replaceAll(" ", "").replaceAll(",", "").trim();
          returnObject.szallitoCim = cim;
        }
      } else if (irszVarosSiteRegex.test(szoveg)) {
        const siteMatch = szoveg.match(irszVarosSiteRegex) + "";
        const irszam = siteMatch.match(/\d{4}\s/g);
        const varosFromTo = this.fromToString(szoveg.split(irszam + "")[1].match(/[A-Za-z\- ]/g)![0], vizsgal);
        const varos = szoveg.substring(varosFromTo[0], varosFromTo[1]).replaceAll(" ", "").replaceAll(",", "").trim();

        //A legrövidebb település név az minimum 2 betűs, ha ennél kisebb, akkor nem helyes a találat
        if (varos.length > 1) {
          returnObject.szallitoIrsz = irszam![0].replaceAll(" ", "").trim() as unknown as number;
          returnObject.szallitoTelepules = szoveg.substring(varosFromTo[0], varosFromTo[1]).replaceAll(" ", "").replaceAll(",", "").trim();
        }
      }
    }

    return returnObject;
  }

  //Megnézi, hogy a szállító neve, címében van-e a vevőhöz tartozó adat, ha van, akkor azt törli (csak a szöveg végéről szedi le ezeket)
  szallitoMod(returnObject: Bills, user: Users): Bills {
    const userValues = Object.values(user);
    const filteredValues = userValues.filter(value =>
      value !== "" && value !== null && value !== undefined &&
      !(Array.isArray(value) && value.length === 0) && typeof value !== "object");

    const userAdatai = filteredValues.join(' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll('.', '').split(' ');

    const szallitoNev = returnObject.szallitoNev.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
    let lastIndex = szallitoNev.length - 1;

    while (lastIndex >= 0) {
      if (userAdatai.some(kulcsszo => szallitoNev[lastIndex].includes(kulcsszo))) {
        returnObject.szallitoNev = returnObject.szallitoNev.substring(0, returnObject.szallitoNev.lastIndexOf(' '));
      } else {
        lastIndex = -1;
      }
      lastIndex--;
    }

    const szallitoCim = returnObject.szallitoCim.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
    lastIndex = szallitoCim.length - 1;
    while (lastIndex >= 0) {
      if (userAdatai.some(kulcsszo => szallitoCim[lastIndex].includes(kulcsszo))) {
        returnObject.szallitoCim = returnObject.szallitoCim.substring(0, returnObject.szallitoCim.lastIndexOf(' '));
      } else {
        lastIndex = -1;
      }
      lastIndex--;
    }

    return returnObject;
  }

  //A bruttó, nettó, áfa értékek vizsgálata, formázása, ha valamelyik nem lett felismerve, akkor azt behelyettesíti
  penzFeld(returnObject: Bills): Bills {
    returnObject.brutto = returnObject.brutto.replaceAll('.00', '').replaceAll(',00', '').replace(/\D/g, '').toString();
    returnObject.netto = returnObject.netto.replaceAll('.00', '').replaceAll(',00', '').replace(/\D/g, '').toString();
    returnObject.afa = returnObject.afa.replaceAll('.00', '').replaceAll(',00', '').replace(/\D/g, '').toString();
    if (returnObject.netto !== '') {
      if (returnObject.afa === '') {
        returnObject.afa = Math.round(parseInt(returnObject.netto, 10) * 0.27).toString();
      }
      if (returnObject.brutto === '') {
        returnObject.brutto = Math.round(parseInt(returnObject.netto, 10) * 1.27).toString();
      }
    }
    if (returnObject.brutto !== '') {
      if (returnObject.netto === '') {
        returnObject.netto = Math.round(parseInt(returnObject.brutto, 10) / 1.27).toString();
      }
      if (returnObject.afa === '') {
        returnObject.afa = Math.round(parseInt(returnObject.brutto, 10) - (parseInt(returnObject.brutto, 10) / 1.27)).toString();
      }
    }

    if (returnObject.afa !== '') {
      if (returnObject.netto === '') {
        returnObject.netto = Math.round(parseInt(returnObject.afa, 10) / 0.27).toString();
      }
      if (returnObject.brutto === '') {
        returnObject.afa = Math.round(parseInt(returnObject.netto, 10) + parseInt(returnObject.afa, 10)).toString();
      }
    }

    if (returnObject.brutto === returnObject.netto) {
      if (returnObject.afa === Math.round(parseInt(returnObject.brutto, 10) - (parseInt(returnObject.brutto, 10) / 1.27)).toString()) {
        returnObject.netto = Math.round(parseInt(returnObject.brutto, 10) / 1.27).toString();
      } else if (returnObject.afa === Math.round(parseInt(returnObject.netto, 10) * 0.27).toString()) {
        returnObject.brutto = Math.round(parseInt(returnObject.netto, 10) * 1.27).toString();
      }
    }

    return returnObject;
  }

  //Mettől meddig tartalmazza a keresett stringet
  fromToString(keres: string, vizsgal: string): number[] {
    let returnArray = [0, 0];
    returnArray[0] = vizsgal.indexOf(keres);
    returnArray[1] = returnArray[0] + keres.length;
    return returnArray;
  }

  //Fizetési módok felismerése
  fizmod(vizsgal: string, returnObject: Bills): Bills {
    vizsgal = vizsgal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (vizsgal.includes('keszpenz')) {
      returnObject.fizMod = 'Készpénz';
    }
    if (vizsgal.includes('atutalas')) {
      returnObject.fizMod = 'Átutalás';
    }
    if (vizsgal.includes('bankkartya')) {
      returnObject.fizMod = 'Bankkártya';
    }
    if (vizsgal.includes('csekk')) {
      returnObject.fizMod = 'Csekk';
    }
    if (vizsgal.includes('utanvet')) {
      returnObject.fizMod = 'Utánvét';
    }
    return returnObject;
  }

  //Ha a fizetési idő egysorban van
  fizIdo(vizsgal: string, returnObject: Bills): Bills {
    vizsgal = vizsgal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(' ', '').replaceAll(',', '.');

    const dateRegex = /\d\d\d\d\.\d\d\.\d\d\./g;
    if (dateRegex.test(vizsgal.replace(/\s+/g, ""))) {
      let dates = vizsgal.match(dateRegex);
      if (dates) {
        if (dates.length === 2) {
          if (dates[0]) {
            returnObject.fizKelt = dates[0];
          }

          if (dates[1]) {
            returnObject.fizTeljesites = dates[1];
            returnObject.fizHatarido = dates[1];
          }
        } else {
          if (dates[0]) {
            returnObject.fizTeljesites = dates[0];
          }
          if (dates[1]) {
            returnObject.fizKelt = dates[1];
          }
          if (dates[2]) {
            returnObject.fizHatarido = dates[2];
          }
        }
      }
    }

    return returnObject;
  }

  //Hogyha valamelyik fizetési idő nem lett felismerve, akkor behelyettesíti azokat, megformázza őket
  fizIdoNotFound(returnObject: Bills): Bills {
    if (returnObject.fizTeljesites) {
      returnObject.fizTeljesites = returnObject.fizTeljesites.replaceAll(',', '.').trim();
      if (returnObject.fizTeljesites[returnObject.fizTeljesites.length - 1] !== '.') {
        returnObject.fizTeljesites += '.'
      }
      if (!returnObject.fizHatarido) {
        returnObject.fizHatarido = returnObject.fizTeljesites;
      }
      if (!returnObject.fizKelt) {
        returnObject.fizKelt = returnObject.fizTeljesites;
      }
    }

    if (returnObject.fizHatarido) {
      returnObject.fizHatarido = returnObject.fizHatarido.replaceAll(',', '.').trim();
      if (returnObject.fizHatarido[returnObject.fizHatarido.length - 1] !== '.') {
        returnObject.fizHatarido += '.'
      }
      if (!returnObject.fizTeljesites) {
        returnObject.fizTeljesites = returnObject.fizHatarido;
      }
      if (!returnObject.fizKelt) {
        returnObject.fizKelt = returnObject.fizHatarido;
      }
    }

    if (returnObject.fizKelt) {
      returnObject.fizKelt = returnObject.fizKelt.replaceAll(',', '.').trim();
      if (returnObject.fizKelt[returnObject.fizKelt.length - 1] !== '.') {
        returnObject.fizKelt += '.'
      }
      if (!returnObject.fizTeljesites) {
        returnObject.fizTeljesites = returnObject.fizKelt;
      }
      if (!returnObject.fizHatarido) {
        returnObject.fizHatarido = returnObject.fizKelt;
      }
    }
    return returnObject;
  }
}
