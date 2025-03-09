import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Bills } from '../../shared/classes/Bill';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileService } from '../../shared/services/fileService/file.service';

@Component({
  selector: 'app-fix-file-data',
  templateUrl: './fix-file-data.component.html',
  styleUrl: './fix-file-data.component.scss'
})

export class FixFileDataComponent {

  fixFileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    fajlNev: new FormControl('', [Validators.required]),
    szamlaszam: new FormControl('', [Validators.required]),
    szallitoNev: new FormControl('', [Validators.required]),
    szallitoAdo: new FormControl('', [Validators.required]),
    szallitoIrsz: new FormControl(0),
    szallitoTelepules: new FormControl(''),
    szallitoCim: new FormControl(''),
    fizKelt: new FormControl('', [Validators.required]),
    fizTeljesites: new FormControl('', [Validators.required]),
    fizHatarido: new FormControl(''),
    fizMod: new FormControl('', [Validators.required]),
    netto: new FormControl(''),
    brutto: new FormControl('', [Validators.required]),
    afa: new FormControl('')
  });

  editing:Boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { fileData: Bills }, private fileService: FileService) {
    this.fixFileForm.setValue({
      email: data.fileData.email as string,
      fajlNev: data.fileData.fajlNev as string,
      szamlaszam: data.fileData.szamlaszam as string,
      szallitoNev: data.fileData.szallitoNev as string,
      szallitoAdo: data.fileData.szallitoAdo as string,
      szallitoIrsz: data.fileData.szallitoIrsz as number,
      szallitoTelepules: data.fileData.szallitoTelepules as string,
      szallitoCim: data.fileData.szallitoCim as string,
      fizKelt: data.fileData.fizKelt as string,
      fizTeljesites: data.fileData.fizTeljesites as string,
      fizHatarido: data.fileData.fizHatarido as string,
      fizMod: data.fileData.fizMod as string,
      netto: data.fileData.netto as string,
      brutto: data.fileData.brutto as string,
      afa: data.fileData.afa as string
    });
    this.editing = false;
  }

  fixFile() {
    if (this.fixFileForm.value.email == "" || this.fixFileForm.value.fajlNev == "" || this.fixFileForm.value.szamlaszam == "" ||
      this.fixFileForm.value.szallitoNev == "" || this.fixFileForm.value.szallitoAdo == "" || this.fixFileForm.value.fizKelt == "" ||
      this.fixFileForm.value.fizTeljesites == "" || this.fixFileForm.value.fizMod == "" || this.fixFileForm.value.brutto == "")
      alert("Kérlek tölts ki minden mezőt!");
    else {
      let seged: Bills = {
        email: this.fixFileForm.value.email as string,
        fajlNev: this.fixFileForm.value.fajlNev as string,
        szamlaszam: this.fixFileForm.value.szamlaszam as string,
        tipus: this.data.fileData.tipus,
        szallitoNev: this.fixFileForm.value.szallitoNev as string,
        szallitoAdo: this.fixFileForm.value.szallitoAdo as string,
        szallitoIrsz: this.fixFileForm.value.szallitoIrsz as number,
        szallitoTelepules: this.fixFileForm.value.szallitoTelepules as string,
        szallitoCim: this.fixFileForm.value.szallitoCim as string,
        fizKelt: this.fixFileForm.value.fizKelt as string,
        fizTeljesites: this.fixFileForm.value.fizTeljesites as string,
        fizHatarido: this.fixFileForm.value.fizHatarido as string,
        fizMod: this.fixFileForm.value.fizMod as string,
        netto: this.fixFileForm.value.netto as string,
        brutto: this.fixFileForm.value.brutto as string,
        afa: this.fixFileForm.value.afa as string,
        tartalom: this.data.fileData.tartalom
      }
      this.fileService.updateFile(seged)
    }
  }

  changeEdit() {
    this.editing = !this.editing;
  }
}
