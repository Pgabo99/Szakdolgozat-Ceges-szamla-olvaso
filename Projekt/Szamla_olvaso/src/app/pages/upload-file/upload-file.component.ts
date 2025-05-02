import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/userService/auth.service';
import { ProfileUploadService } from '../../shared/services/userService/profile-upload.service';
import { UserInfoService } from '../../shared/services/userService/user-info.service';
import { Users } from '../../shared/classes/Users';
import { UploadedFile } from '../../shared/classes/uploaded-file';
import * as Tesseract from 'tesseract.js';
import { HttpClient } from '@angular/common/http';
import { Bills } from '../../shared/classes/Bill';
import { FixFileDataComponent } from '../../component/fix-file-data/fix-file-data.component';
import { FileService } from '../../shared/services/fileService/file.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss'
})

export class UploadFileComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  displayedColumns: string[] = ['fileName', 'uploadDate'];
  dataSource!: UploadedFile[];
  user$: Observable<any>;
  uid: any;
  downloadURL: string;
  loggenUser?: Users;
  textResult: string = '';
  feltolt = false;
  megjelenitheto = true;

  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService, private router: Router, private dialog: MatDialog, private userService: UserInfoService, private http: HttpClient, private fileService: FileService) {
    this.user$ = this.authService.currentUser$;
    this.downloadURL = ""
    this.getUserUid()

    // Lekéri a felhasználó által feltöltött fájlokat
    this.subscriptions.add(this.userService.getUserByEmail(this.authService.getUserEmail() as string).subscribe(data => {
      // Még nem töltötte ki a profil oldalon a szükséges adatokat
      if (data[0] === null || data[0] === undefined) {
        console.log('asd');
        alert("Mielőtt feltöltenél bármit is kérlek töltsd ki a profilodat!")
        this.megjelenitheto = false;
        return;
      }

      this.loggenUser = data[0];
      if (!this.loggenUser.files) {
        return;
      }

      //Feltöltött fájlok, legújabb legelől
      this.dataSource = Object.entries(this.loggenUser.files).map(([url, value]) => ({
        url,
        fileName: value.fileName,
        uploadDate: value.uploadDate
      })).reverse();
    }));
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  //Visszaadja a bejelentkezett felhasználó UID-ját
  getUserUid() {
    this.user$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
      } else {
        console.log('A felhasználó nem elérhető.');
      }
    });
  }

  /**
   * Feltölti a fájlt a storageba, és frissíti a felhasználónak a feltöltött fájljait
   * Az alapján, hogy PDF, vagy Kép formátumú a fájl, meghívja a megfelelő függvényt az adatok feldolgozásához
   * @param event 
   */
  async uploadImage(event: any) {
    this.feltolt = true;
    const input = event.target.files[0];

    // Ha nem választott ki fájlt.
    if (!input) {
      alert("Nem választottál ki fájlt.")
      this.feltolt = false;
      return;
    }

    //Rossz fájlformátum
    const allowedExtensions = ['pdf', 'png', 'jpeg', 'jpg'];
    const fileExtension = input.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert("Rossz fájl formátum!")
      this.feltolt = false;
      return;
    }

    // Fel lett-e már töltve ilyen nevű fájl
    let isUploaded = false;
    this.dataSource.forEach(element => {
      if (element.fileName === input.name) {
        isUploaded = true;
      }
    });

    if (isUploaded) {
      alert("Ezt már feltöltötted egyszer!");
      this.feltolt = false;
      return;
    }

    // Fájlfeltöltése a storageba
    const path = `files/${this.uid}/${input.name}`
    const uploadTask = await this.imageUploadService.uploadBill(input, path)
    const url = await uploadTask.ref.getDownloadURL();

    // Felhasználó feltöltött fájljainak frissítése az adatbázisban
    if (this.loggenUser?.files) {
      this.loggenUser.files[url] = {
        url: url,
        fileName: input.name,
        uploadDate: new Date()
      }
      this.userService.changeUserFiles(this.loggenUser)
    }

    // Fájlok feldolgozása
    if (fileExtension === 'pdf') {
      this.processPDF(input);
    } else {
      this.processImage(event.target.files[0]);
    }
  }

  //Kinyeri a szöveget a képről, majd átadja azt a FileServicenek
  processImage(image: File) {
    Tesseract.recognize(image, 'hun', {
      logger: (progress) => {}
    })
      .then(result => {
        this.textResult = result.data.text;
        this.feltolt = false;
        const bill: Bills = this.fileService.processingText(this.textResult, this.loggenUser!, image.name);
        const dialogRef = this.dialog.open(FixFileDataComponent, {
          data: { fileData: bill as Bills },
          width: '95%',
          height: '95%'
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  /**
   * Feldolgozza a PDF-et, hogyha szöveg van a PDF-ben, akkor abból kinyeri a szöveget, azonban hogyha kép, akkor azt átalakítja kép formátumba, és átadja a processImage függvénynek
   * @param input a feltöltött fájl
   */
  processPDF(input: any) {
    const formData = new FormData();
    formData.append('file', input);
    this.http.post('https://szakdolgozat-ceges-szamla-olvaso-backend.onrender.com/processPDF', formData).subscribe({
      next: (response) => {
        if ('type' in response) {
          //Ha szöveg van a PDF-ben
          if (response.type === 'text' && 'content' in response && typeof response.content === 'string' && response.content.replaceAll(' ', '').replaceAll("\n", "").replaceAll("\t", "").replaceAll("\v", "") !== "") {
            const bill: Bills = this.fileService.processingText(response.content as string, this.loggenUser!, input.name)
            const dialogRef = this.dialog.open(FixFileDataComponent, {
              data: { fileData: bill as Bills },
              width: '95%',
              height: '95%'
            });
            this.feltolt = false;
          } else if (response.type === 'path' && 'images' in response && Array.isArray(response.images)) {
            //Ha kép van a PDF-ben, akkor azt kéri le
            const imagePath = response.images[0]['path'];
            this.http.get(`https://szakdolgozat-ceges-szamla-olvaso-backend.onrender.com/images/${imagePath}`, { responseType: 'blob' }).subscribe({
              next: (blob) => {
                const file = new File([blob], input.name, { type: "image/png" });
                this.processImage(file);
              },
              error: (error) => { console.error('Hiba a kép letöltésekor:', error); this.feltolt = false; }
            });
          }
        }
      },
      error: (error) => { console.error('Hiba történt:', error); this.feltolt = false; }
    });
  }
}
