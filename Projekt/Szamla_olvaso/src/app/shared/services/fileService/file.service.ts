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
    let eleje = false;
    let szallitoAdatok = "";
    let fizEgysor = false;
    let szallitoadatokB = true;
    let szallitoadatokString = "";

    let indexek: { word: string; index: number; }[];
    darabok.forEach(element => {
      let vizsgal = element.toLowerCase();
      if (bill.szamlaszam == "" && szallitoadatokB && vizsgal.indexOf("számla") == -1 && vizsgal.indexOf("szállító") == -1 && vizsgal.indexOf("vevó") == -1)
        bill.szamlaszam = element
      if (fizEgysor) {
        fizEgysor = false;
        let fizDarabok = element.replaceAll(' ', '');
        const match = fizDarabok.match(/\d{4}\.\d{2}\.\d{2}/g);
        const match2 = fizDarabok.match(/[^\d.]+/g);
        let atutalas = false;
        indexek.forEach((item, i) => {
          let index = 4 - i - 2;
          if (atutalas) {
            index = index + 1;
          }
          if (index < 0)
            index = 0
          if (item.word == "mód") {
            atutalas = true;
            bill.fizMod = match2![0]
          }
          if (item.word == "teljesít")
            bill.fizTeljesites = match![index]
          if (item.word == "esedékesség")
            bill.fizHatarido = match![index]
          if (item.word == "kelt")
            bill.fizKelt = match![index]
        });
      }
      if (vizsgal.indexOf("fizetés") != -1 && vizsgal.indexOf("mód") != -1 && bill.fizMod == "") {
        eleje = false;
        if (vizsgal.indexOf("teljesít") != -1 && vizsgal.indexOf("kelt") != -1 && (vizsgal.indexOf("esedékesség") != -1 || vizsgal.indexOf("határidő") != -1)) {
          fizEgysor = true;
          let segedVizsgal = vizsgal.replaceAll(' ', '');
          let kelt = segedVizsgal.indexOf("kelt");
          let telj = segedVizsgal.indexOf("teljesít");
          let hat = segedVizsgal.indexOf("esedékesség");
          let mod = segedVizsgal.indexOf("mód");
          indexek = [
            { word: "kelt", index: kelt },
            { word: "teljesít", index: telj },
            { word: "esedékesség", index: hat },
            { word: "mód", index: mod }
          ];
          indexek.sort((a, b) => b.index - a.index);
        } else {
          let modDarabok = element.split(" ");
          let megvan = false;
          let index = 0;
          while (index < modDarabok.length) {
            if (megvan) {
              bill.fizMod = modDarabok[index];
              index = modDarabok.length;
            }
            if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("mód") != -1) {
              megvan = true;
            }
            index++;
          }
        }

      }
      if (vizsgal.indexOf("kelt") != -1 && bill.fizKelt == "") {
        let modDarabok = element.split(" ");
        let megvan = false;
        let index = 0;
        while (index < modDarabok.length) {
          if (megvan) {
            bill.fizKelt = modDarabok[index];
            index = modDarabok.length;
          }
          if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("kelt") != -1) {
            megvan = true;
          }

          index++;
        }
      }
      if (vizsgal.indexOf("teljesít") != -1 && bill.fizTeljesites == "") {
        let modDarabok = element.split(" ");
        let megvan = false;
        let index = 0;
        while (index < modDarabok.length) {
          if (megvan) {
            bill.fizTeljesites = modDarabok[index];
            index = modDarabok.length;
          }
          if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("teljesít") != -1) {
            megvan = true;
          }

          index++;
        }
      }

      if (vizsgal.indexOf("sorszám") != -1 && bill.szamlaszam == "") {
        bill.szamlaszam = element.substring(vizsgal.indexOf("sorszám") + 8).trim();
        szallitoadatokB = false;
      } else if (vizsgal.indexOf("számlaszám") != -1 && bill.szamlaszam == "") {
        bill.szamlaszam = element.substring(vizsgal.indexOf("számlaszám") + 11).trim();
      }
      else if (eleje || vizsgal.indexOf(user.companyName.toLowerCase()) != -1) {
        var eredmeny = this.szallitoAdatokFeld(user, element, vizsgal);
        szallitoAdatok += eredmeny + "\n";
        eleje = true;
        szallitoadatokB = false;
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

      bill = this.szallitoAdatokFeld2(user, element, vizsgal, bill);

      if (bill.szallitoNev === "") {
        if (bill.szallitoAdo !== "" || bill.szallitoCim !== "" || bill.szallitoIrsz !== 0 || bill.szallitoTelepules !== "") {
          bill.szallitoNev = szallitoadatokString.split('\n')[szallitoadatokString.split('\n').length - 2];
        } else {
          szallitoadatokString += element + '\n';
        }
      }
      bill = this.fizmod(vizsgal, bill);
      bill = this.fizIdo(vizsgal, bill);
    });
    let szallitoDarabok = szallitoAdatok.split('\n');
    if (bill.szallitoNev === '' || bill.szallitoNev.toLocaleLowerCase().includes(user.companyName.toLocaleLowerCase())) {
      bill.szallitoNev = szallitoDarabok[0];
    }
    szallitoDarabok.forEach(element => {
      let vizsgal = element.toLowerCase();
      if (vizsgal.indexOf("adószám") != -1 && bill.szallitoAdo == "" && vizsgal.indexOf("eu") == -1 && vizsgal.indexOf("hu") == -1) {
        bill.szallitoAdo = element.substring(element.search(/\d/), element.length).trim().split(' ')[0];
      }
      if (bill.szallitoIrsz != 0 && bill.szallitoCim == "") {
        bill.szallitoCim = element;
      }
      if (bill.szallitoIrsz == 0 && /\d/.test(element.charAt(0)) && /\d/.test(element.charAt(1)) && /\d/.test(element.charAt(2)) && /\d/.test(element.charAt(3))) {
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
    })
    bill = this.penzFeld(bill);
    bill = this.fizIdoNotFound(bill);
    this.addFiles(bill)

    return bill;
  }

  szallitoAdatokFeld(user: Users, szoveg: string, vizsgal: string): string {
    let returnString = "";
    var meddig = szoveg.length;
    let siteRegex = /\d\d\d\d\s+[A-Za-z]+, ([A-Za-z0-9]+( [A-Za-z0-9]+)+)\./i;
    if (vizsgal.indexOf(user.companyName.toLowerCase()) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.indexOf(user.companyName.toLowerCase());
    }
    if (vizsgal.indexOf(user.taxNumber) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.indexOf(user.taxNumber.toLowerCase());
      let adoszamhely = vizsgal.lastIndexOf("adoszam");
      if (adoszamhely != -1 && meddig - adoszamhely - 7 < 3) {
        meddig = adoszamhely;
      }
    }
    if (vizsgal.lastIndexOf(user.country.toLowerCase()) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.country.toLowerCase());
      if (meddig < 2) {
        meddig = szoveg.length;
      }
    }
    if (vizsgal.lastIndexOf(user.site.split(' ')[0].toLowerCase()) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.site.split(' ')[0].toLowerCase());
      if (meddig < 6) {
        meddig = szoveg.length;
      }
    }
    if (vizsgal.lastIndexOf(user.zipCode.toString()) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.zipCode.toString());
      if (meddig < 2) {
        meddig = szoveg.length;
      }
    }
    if (vizsgal.lastIndexOf(user.city.toLowerCase()) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.lastIndexOf(user.city.toLowerCase());
      if (meddig < 6) {
        meddig = szoveg.length;
      }
    }

    if (returnString === "")
      returnString += szoveg.substring(0, meddig);
    return returnString;
  }

  szallitoAdatokFeld2(user: Users, szoveg: string, vizsgal: string, returnObject: Bills): Bills {
    vizsgal = vizsgal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

      // Irányítószám Város, Irányítószám Város, Cím
      const irszVarosSiteRegex = /\d\d\d8\s+[A-Za-z]+/i;
      const fullSiteRegex = /\d\d\d\d\s+[A-Za-z]+, ([A-Za-z0-9]+( [A-Za-z0-9]+)+)\./i;
      if (fullSiteRegex.test(vizsgal)) {
        let irszam = szoveg.match(/\d{4}\s/g);
        let varosFromTo = this.fromToString(vizsgal.split(irszam + "")[1].match(/[A-Za-z]+,/g)![0], vizsgal);
        let cim = szoveg.split(szoveg.substring(varosFromTo[0], varosFromTo[1]) + "")[1].trim();
        if (!cim.includes(user.site)) {
          returnObject.szallitoIrsz = irszam![0].replaceAll(" ", "").trim() as unknown as number;
          returnObject.szallitoTelepules = szoveg.substring(varosFromTo[0], varosFromTo[1]).replaceAll(" ", "").replaceAll(",", "").trim();
          returnObject.szallitoCim = cim;
        }
      } else if (irszVarosSiteRegex.test(szoveg)) {
        let irszam = szoveg.match(/\d{4}\s/g);
        let varosFromTo = this.fromToString(szoveg.split(irszam + "")[1].match(/[A-Za-z]/g)![0], vizsgal);
        returnObject.szallitoCim = irszam![0].replaceAll(" ", "").trim();
        returnObject.szallitoTelepules = szoveg.substring(varosFromTo[0], varosFromTo[1]).replaceAll(" ", "").replaceAll(",", "").trim();
      }

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

    if (returnObject.brutto === returnObject.netto){
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

    const dateRegex = /\d\d\d\d\.\d\d\.\d\d\./;
    if (dateRegex.test(vizsgal.replace(/\s+/g, ""))) {
      let dates = vizsgal.match(dateRegex);
      if (dates) {
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

    return returnObject;
  }

  //Hogyha valamelyik fizetési idő nem lett felismerve, akkor behelyettesíti azokat, megformázza őket
  fizIdoNotFound(returnObject: Bills): Bills {
    if (returnObject.fizTeljesites) {
      returnObject.fizTeljesites = returnObject.fizTeljesites.replaceAll(',', '.').trim();
      if (returnObject.fizTeljesites[returnObject.fizTeljesites.length-1] !== '.') {
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
      if (returnObject.fizHatarido[returnObject.fizHatarido.length-1] !== '.') {
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
      if (returnObject.fizKelt[returnObject.fizKelt.length-1] !== '.') {
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
