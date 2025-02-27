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
  processingImage(szoveg: string, user: Users, fileName: string): Bills {
    console.log(szoveg);
    let seged: Bills = {
      email: user.email,
      fajlNev: fileName,
      szamlaszam: "",
      tipus: '',
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
      tartalom: ""
    }
    let darabok = szoveg.split("\n");
    let eleje = false;
    let szallitoAdatok = "";
    let fizEgysor = false;
    let tartalomBool = false;
    let legelejeB = true;

    let indexek: { word: string; index: number; }[];
    darabok.forEach(element => {
      let vizsgal = element.normalize("NFD").toLowerCase();
      if (seged.szamlaszam == "" && legelejeB && vizsgal.indexOf("szamla") == -1 && vizsgal.indexOf("szallito") == -1 && vizsgal.indexOf("vevo") == -1)
        seged.szamlaszam = element
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
            seged.fizMod = match2![0]
          }
          if (item.word == "teljesít")
            seged.fizTeljesites = match![index]
          if (item.word == "esedékesség")
            seged.fizHatarido = match![index]
          if (item.word == "kelt")
            seged.fizKelt = match![index]
        });
      }
      if (vizsgal.indexOf("fizetes") != -1 && vizsgal.indexOf("mod") != -1 && seged.fizMod == "") {
        eleje = false;
        if (vizsgal.indexOf("teljesot") != -1 && vizsgal.indexOf("kelt") != -1 && (vizsgal.indexOf("esedekesseg") != -1 || vizsgal.indexOf("hatarido") != -1)) {
          fizEgysor = true;
          let segedVizsgal = vizsgal.replaceAll(' ', '');
          let kelt = segedVizsgal.indexOf("kelt");
          let telj = segedVizsgal.indexOf("teljesot");
          let hat = segedVizsgal.indexOf("esedekesseg");
          let mod = segedVizsgal.indexOf("mod");
          indexek = [
            { word: "kelt", index: kelt },
            { word: "teljesit", index: telj },
            { word: "esedekesseg", index: hat },
            { word: "mod", index: mod }
          ];
          indexek.sort((a, b) => b.index - a.index);
        } else {
          let modDarabok = element.split(" ");
          let megvan = false;
          let index = 0;
          while (index < modDarabok.length) {
            if (megvan) {
              seged.fizMod = modDarabok[index];
              index = modDarabok.length;
            }
            if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("mod") != -1) {
              megvan = true;
            }
            index++;
          }
        }

      }
      if (vizsgal.indexOf("kelt") != -1 && seged.fizKelt == "") {
        let modDarabok = element.split(" ");
        let megvan = false;
        let index = 0;
        while (index < modDarabok.length) {
          if (megvan) {
            seged.fizKelt = modDarabok[index];
            index = modDarabok.length;
          }
          if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("kelt") != -1) {
            megvan = true;
          }

          index++;
        }
      }
      if (vizsgal.indexOf("teljesit") != -1 && seged.fizTeljesites == "") {
        let modDarabok = element.split(" ");
        let megvan = false;
        let index = 0;
        while (index < modDarabok.length) {
          if (megvan) {
            seged.fizTeljesites = modDarabok[index];
            index = modDarabok.length;
          }
          if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("teljesit") != -1) {
            megvan = true;
          }

          index++;
        }
      }

      if (vizsgal.indexOf("sorszam") != -1 && seged.szamlaszam == "") {
        seged.szamlaszam = element.substring(vizsgal.indexOf("sorszam") + 8).trim();
        legelejeB = false;
      } else if (vizsgal.indexOf("szamlaszam") != -1 && seged.szamlaszam == "") {
        seged.szamlaszam = element.substring(vizsgal.indexOf("szamlaszam") + 11).trim();
      }
      else if (eleje || vizsgal.indexOf(user.companyName.toLowerCase()) != -1) {
        var eredmeny = this.szallitoAdatokFeld(user, element, vizsgal);
        szallitoAdatok += eredmeny + "\n";
        eleje = true;
        legelejeB = false;
      }
      if (vizsgal.indexOf("osszes") != -1 || vizsgal.indexOf("Osszes") != -1 || vizsgal.indexOf("ertekesites") != -1 || vizsgal.indexOf("ertek") != -1) {
        let result = element.replaceAll(" ", "").replaceAll("-", "").replace(/^[^0-9]+/, "");

        console.log("itt" + vizsgal);
        if (vizsgal.indexOf("27") != -1) {
          result = element.replaceAll(" ", "").replaceAll("-", "").replace(/[^0-9]+/, "").replace(/^[^0-9]+/, "");
        }
        let resultFt = result.split("Ft").filter(item => item !== "");
        if (resultFt.length > 2) {
          seged.brutto = resultFt[resultFt.length - 1];
          seged.afa = resultFt[resultFt.length - 2]
          seged.netto = resultFt[resultFt.length - 3]
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
          // console.log("itteeeen"+resultFt2);
          // console.log("resultFt"+resultFt);
          // console.log("result"+result);
          seged.brutto = resultFt2[0];
          seged.afa = resultFt2[1]
          seged.netto = resultFt2[2]
        }
      }
      if (vizsgal.indexOf("fizetendo") != -1 || (vizsgal.indexOf("vegosszeg") != -1) && seged.brutto == "") {
        let result = element.replaceAll(" ", "").replace(/^[^0-9]+/, "").replaceAll("Ft", "");
        seged.brutto = result;
      }
      if (vizsgal.indexOf('megnevezes') != -1 || vizsgal.indexOf('kod') != -1 || vizsgal.indexOf('mennyiseg') != -1 || vizsgal.indexOf('brutto') != -1) {
        tartalomBool = true;
      }
      if (tartalomBool) {
        seged.tartalom += element + '\n';
      }
      
    });
    let szallitoDarabok = szallitoAdatok.split('\n');
    seged.szallitoNev = szallitoDarabok[0];
    szallitoDarabok.forEach(element => {
      let vizsgal = element.toLowerCase();
      if (vizsgal.indexOf("adoszam") != -1 && seged.szallitoAdo == "" && vizsgal.indexOf("eu") == -1 && vizsgal.indexOf("hu") == -1) {
        seged.szallitoAdo = element.substring(element.search(/\d/), element.length).trim().split(' ')[0];
      }
      if (seged.szallitoIrsz !== 0 && seged.szallitoCim === "") {
        seged.szallitoCim = element;
      }
      if (seged.szallitoIrsz == 0 && /\d/.test(element.charAt(0)) && /\d/.test(element.charAt(1)) && /\d/.test(element.charAt(2)) && /\d/.test(element.charAt(3))) {
        seged.szallitoIrsz = element.substring(0, 4) as unknown as number;
        if (element.trim().length != 4) {
          let cimDarabok = element.split(' ');
          if (cimDarabok[1].trim().endsWith(','))
            seged.szallitoTelepules = cimDarabok[1].slice(0, -1).trim();
          else
            seged.szallitoTelepules = cimDarabok[1].trim();
          let index = 2;
          if (seged.szallitoCim === '') {
            while (index < cimDarabok.length) {
              seged.szallitoCim += cimDarabok[index] + ' '
              index++;
            }
            seged.szallitoCim = seged.szallitoCim.trim();
          }
        }
      }
    })
    console.log(seged)
    this.addFiles(seged)

    return seged;
  }

  szallitoAdatokFeld(user: Users, szoveg: string, vizsgal: string): string {
    let returnString = "";
    var meddig = szoveg.length;
    let siteRegex = /\d\d\d\d\s+[A-Za-z]+, ([A-Za-z0-9]+( [A-Za-z0-9]+)+)\./i;
    console.log('Szálltóaadaatok: ' + szoveg);
    if (vizsgal.indexOf(user.companyName.toLowerCase()) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.indexOf(user.companyName.toLowerCase());
    }
    if (vizsgal.indexOf(user.taxNumber) != -1 && meddig == szoveg.length) {
      meddig = vizsgal.indexOf(user.taxNumber.toLowerCase());
      let adoszamhely = vizsgal.lastIndexOf("adószám");
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

    // if (siteRegex.test(szoveg)) {
    //   let irszam = szoveg.match(/\d{4}\s/g);
    //   let varos = szoveg.split(irszam + "")[1].match(/[A-Za-z]+,/g);
    //   let cim = szoveg.split(varos + "")[1];
    //   returnString += "Irányítószám: " + irszam![0].replaceAll(" ", "").trim() + '\n';
    //   returnString += "Város: " + varos![0].replaceAll(" ", "").replaceAll(",", "").trim() + '\n';
    //   returnString += "Cím: " + cim.trim() + '\n';
    //   console.log("returnString: " + returnString);
    // }

    if (returnString === "")
      returnString += szoveg.substring(0, meddig);
    return returnString;
  }

  szallitoAdatokFeld2(user: Users, szoveg: string, vizsgal: string, returnObject: Bills): Bills {
    console.log("NFD: "+vizsgal.normalize("NFD"));
    // Adószám
    const taxNumberRegex = /\d\d\d\d\s+[A-Za-z]+, ([A-Za-z0-9]+( [A-Za-z0-9]+)+)\./i;
    if (returnObject.szallitoAdo !== '' && taxNumberRegex.test(szoveg)) {
      let taxNumber = szoveg.match(taxNumberRegex);
      if (taxNumber && taxNumber[0].replaceAll(" ", "").trim() !== user.taxNumber) {
        returnObject.szallitoAdo = taxNumber[0].replaceAll(" ", "").trim();
      }
    }

    // Cím, ha már megvan az irányítószám és a város
    if (returnObject.szallitoIrsz && returnObject.szallitoTelepules && !returnObject.szallitoCim) {
      let cim = szoveg;
      if (cim !== user.site) {
        returnObject.szallitoCim = cim.trim();
      }
    }

    // Irányítószám Város, Irányítószám Város, Cím
    const irszVarosSiteRegex = /\d\d\d8\s+[A-Za-z]+/i;
    const fullSiteRegex = /\d\d\d\d\s+[A-Za-z]+, ([A-Za-z0-9]+( [A-Za-z0-9]+)+)\./i;
    if (fullSiteRegex.test(szoveg)) {
      let irszam = szoveg.match(/\d{4}\s/g);
      let varos = szoveg.split(irszam + "")[1].match(/[A-Za-z]+,/g);
      let cim = szoveg.split(varos + "")[1];
      if (cim.trim() !== user.site) {
        returnObject.szallitoCim = irszam![0].replaceAll(" ", "").trim();
        returnObject.szallitoTelepules = varos![0].replaceAll(" ", "").replaceAll(",", "").trim();
        returnObject.szallitoCim = cim.trim();
      }
    } else if (irszVarosSiteRegex.test(szoveg)) {
      let irszam = szoveg.match(/\d{4}\s/g);
      let varos = szoveg.split(irszam + "")[1].match(/[A-Za-z]+,/g);
      returnObject.szallitoCim = irszam![0].replaceAll(" ", "").trim();
      returnObject.szallitoTelepules = varos![0].replaceAll(" ", "").replaceAll(",", "").trim();
    }

    // Cím, ha már megvan az irányítószám és a város
    if (returnObject.szallitoIrsz && returnObject.szallitoTelepules && !returnObject.szallitoCim) {
      let cim = szoveg;
      if (cim.trim() !== user.site) {
        returnObject.szallitoCim = cim.trim();
      }
    }

    return returnObject;
  }
}
