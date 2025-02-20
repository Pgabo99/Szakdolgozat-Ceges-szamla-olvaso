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
      szallitoEgybe: '',
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
      let vizsgal = element.toLowerCase();
      if (seged.szamlaszam == "" && legelejeB && vizsgal.indexOf("számla") == -1)
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
      if (vizsgal.indexOf("fizetés") != -1 && vizsgal.indexOf("mód") != -1 && seged.fizMod == "") {
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
              seged.fizMod = modDarabok[index];
              index = modDarabok.length;
            }
            if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("mód") != -1) {
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
      if (vizsgal.indexOf("teljesít") != -1 && seged.fizTeljesites == "") {
        let modDarabok = element.split(" ");
        let megvan = false;
        let index = 0;
        while (index < modDarabok.length) {
          if (megvan) {
            seged.fizTeljesites = modDarabok[index];
            index = modDarabok.length;
          }
          if (index != modDarabok.length && modDarabok[index].toLowerCase().indexOf("teljesít") != -1) {
            megvan = true;
          }

          index++;
        }
      }

      if (vizsgal.indexOf("sorszám") != -1 && seged.szamlaszam == "") {
        seged.szamlaszam = element.substring(vizsgal.indexOf("sorszám") + 8).trim();
        legelejeB = false;
      } else if (vizsgal.indexOf("számlaszám") != -1 && seged.szamlaszam == "") {
        seged.szamlaszam = element.substring(vizsgal.indexOf("számlaszám") + 11).trim();
      }
      else if (eleje || vizsgal.indexOf(user.companyName.toLowerCase()) != -1) {
        var eredmeny = this.szallitoAdatokFeld(user, element, vizsgal);
        szallitoAdatok += eredmeny + "\n";
        eleje = true;
        legelejeB = false;
      }
      if (vizsgal.indexOf("összes") != -1 || vizsgal.indexOf("Összes") != -1 || vizsgal.indexOf("értékesítés") != -1) {
        let result = element.replaceAll(" ", "").replaceAll("-", "").replace(/^[^0-9]+/, "");
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
          seged.brutto = resultFt2[0];
          seged.afa = resultFt2[1]
          seged.netto = resultFt2[2]
        }
      }
      if (vizsgal.indexOf("fizetendő") != -1 || (vizsgal.indexOf("végösszeg") != -1) && seged.brutto == "") {
        let result = element.replaceAll(" ", "").replace(/^[^0-9]+/, "").replaceAll("Ft", "");
        seged.brutto = result;
      }
      if (vizsgal.indexOf('megnevezés') != -1 || vizsgal.indexOf('kód') != -1 || vizsgal.indexOf('mennyiség') != -1 || vizsgal.indexOf('bruttó') != -1) {
        tartalomBool = true;
      }
      if (tartalomBool)
        seged.tartalom += element + '\n';

    });
    let szallitoDarabok = szallitoAdatok.split('\n');
    seged.szallitoNev = szallitoDarabok[0];
    szallitoDarabok.forEach(element => {
      let vizsgal = element.toLowerCase();
      if (vizsgal.indexOf("adószám") != -1 && seged.szallitoAdo == "" && vizsgal.indexOf("eu") == -1 && vizsgal.indexOf("hu") == -1) {
        seged.szallitoAdo = element.substring(element.search(/\d/), element.length).trim().split(' ')[0];
      }
      if (seged.szallitoIrsz != 0 && seged.szallitoCim == "") {
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
          while (index < cimDarabok.length) {
            seged.szallitoCim += cimDarabok[index] + ' '
            index++;
          }
          seged.szallitoCim = seged.szallitoCim.trim();
        }
      }

    })
    seged.szallitoEgybe = szallitoAdatok;
    console.log(seged)
    this.addFiles(seged)

    return seged;
  }

  szallitoAdatokFeld(user: Users, szoveg: string, vizsgal: string): string {
    let returnsString = "";
    var meddig = szoveg.length;
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

    returnsString += szoveg.substring(0, meddig);
    return returnsString;
  }
}
