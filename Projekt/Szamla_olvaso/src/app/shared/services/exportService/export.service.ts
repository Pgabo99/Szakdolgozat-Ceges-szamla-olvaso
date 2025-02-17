import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }
    exportToExcel(data:any[]):void{
      if (!Array.isArray(data)) {
        console.error("Hiba: a data nem tömb!", data);
        return;
      }
  
      if (data.length === 0) {
        console.warn("Üres adathalmaz, nincs mit exportálni.");
        return;
      }
  
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
  
      const fileName = `exported_at_${new Date().toISOString().split('T')[0]}.xlsx`;
      const sheetName = `Havi_Export_${new Date().getMonth()}`;
  
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
  
    }
  
  
    exportToText(data:any[]):void{
      const headers = Object.keys(data[0]).join(",");
  
      const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(","));
      
        // Egyesítjük a fejlécet és az adatokat
        const csvContent = [headers, ...rows].join("\n");
    
        // Fájlnév generálása
        const fileName = `export_${new Date().toISOString().split('T')[0]}.txt`;
    
        // Fájl letöltése
        const blob = new Blob([csvContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
}
