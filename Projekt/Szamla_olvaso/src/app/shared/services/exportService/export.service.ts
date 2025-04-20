import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})

export class ExportService {

  constructor() { }

  /**
   * Létrehoz egy excel fájlt szamlak_datum.xlsx néven, és feltölti azt az inputban kapott adatokkal
   * @param data Tömb, adatok ami az excelben szerepelnek
   */
  exportToExcel(data: any[]): void {
    //Üres az input
    if (data.length === 0) {
      alert("Nincs mit exportálni.");
      return;
    }

    //Tartalom mező törlése a tömbből, ez csak ha tovább szeretnénk fejleszteni, akkor lesz fontos
    data.forEach(item => {
      if (Object.hasOwn(item, 'tartalom')) {
        delete item.tartalom;
      }
    });

    //Munkalap, fájl létrehozása, elnevezése és feltöltése adatokkal
    const excelFile: XLSX.WorkBook = XLSX.utils.book_new();
    const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const date = new Date();

    const fileName = `szamlak_${date.toLocaleDateString().replaceAll('. ', '_')}.xlsx`;
    const sheetName = `${date.toLocaleDateString().replaceAll('. ', '_')}`;
    XLSX.utils.book_append_sheet(excelFile, workSheet, sheetName);
    XLSX.writeFile(excelFile, fileName);
  }

  /**
   * Létrehoz egy szöveges fájlt szamlak_datum.txt néven, és feltölti azt az inputban kapott adatokkal ;-vel elválasztva
   * @param data Tömb, adatok ami az txt-ben szerepelnek
   */
  exportToText(data: any[]): void {
    //Üres az input
    if (data.length === 0) {
      alert("Nincs mit exportálni.");
      return;
    }

    //Tartalom mező törlése a tömbből, ez csak ha tovább szeretnénk fejleszteni, akkor lesz fontos
    data.forEach(item => {
      if (Object.hasOwn(item, 'tartalom')) {
        delete item.tartalom;
      }
    });

    //Az első sor az inputban kapott kulcsok neve, és az objektumok értékeinek az összekapcsolása
    const headers = `"` + Object.keys(data[0]).join(`";"`) + `"`;
    const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(";"));

    // Összefűzzük a fejlécet és az adatokat
    const txtContent = [headers, ...rows].join("\n");

    // Fájlnév
    const fileName = `szamlak_${new Date().toLocaleDateString().replaceAll('. ', '_')}.txt`;

    // Fájl letöltése (létrehozunk egy linket, amire kattintva letölti az új fájlt)
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
}
