import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { concatMap, elementAt, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileUploadService } from '../../shared/services/profile-upload.service';
import { UserInfoService } from '../../shared/services/user-info.service';
import { User } from 'firebase/auth';
import { Users } from '../../shared/classes/Users';
import { UploadedFile } from '../../shared/classes/uploaded-file';
import * as Tesseract from 'tesseract.js';
import { HttpClient } from '@angular/common/http';
import { Buffer } from 'buffer';
import { FileServiceService } from '../../shared/services/file-service.service';
import { Bills } from '../../shared/classes/Bill';
import { FixFileDataComponent } from '../../component/fix-file-data/fix-file-data.component';

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
  megjelenitheto=true;

  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService, private router: Router, private dialog: MatDialog, private userService: UserInfoService, private http: HttpClient, private fileService: FileServiceService) {
    this.user$ = this.authService.currentUser$;
    this.downloadURL = ""
    this.getUserUid()

    this.subscriptions.add(this.userService.getUserByEmail(this.authService.getUserEmail() as string).subscribe(data => {
      if (data[0] != null) {
        this.loggenUser = data[0];
        if (this.loggenUser.files) {
          let count = Object.keys(this.loggenUser.files).length;
          this.dataSource = new Array(count)
          for (let key in this.loggenUser.files) {
            if (count != 0) {
              if (this.loggenUser.files.hasOwnProperty(key)) {
                const seged = {
                  url: key || 'default-url',
                  fileName: this.loggenUser.files[key].fileName,
                  uploadDate: this.loggenUser.files[key].uploadDate
                }
                count--;
                this.dataSource[count] = (seged);
              }
            }
          }
        }
      }else{
        alert("Mielőtt feltöltenél bármit is kérlek töltsd ki a profilodat!")
        this.megjelenitheto=false;
      }
    }));
  }
  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getUserUid() {
    this.user$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
      } else {
        console.log('A felhasználó nem elérhető.');
      }
    });
  }

  async uploadImage(event: any) {
    this.feltolt = true;
    const input = event.target.files[0];
    const allowedExtensions = ['pdf', 'png', 'jpeg', 'jpg'];
    const fileExtension = input.name.split('.').pop()?.toLowerCase();
    if (!input) {
      alert("Nem választottál ki fájlt.")
      this.feltolt = false;
    }
    else if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert("Rossz fájl formátum!")
      this.feltolt = false;
    }
    else {
      let voltE = false;
      this.dataSource.forEach(element => {
        if (element.fileName == input.name) {
          voltE = true;
        }
      });
      if (voltE==false) {
        const path = `files/${this.uid}/${input.name}`
        const uploadTask = await this.imageUploadService.uploadBill(input, path)
        const url = await uploadTask.ref.getDownloadURL();
        if (fileExtension == 'pdf') {
          console.log(event.target.files[0])
          //this.convertToBase64(event.target.files[0])
        } else {
          this.processImage(event)
        }

        if (this.loggenUser?.files) {
          this.loggenUser.files[url] = {
            url: url,
            fileName: input.name,
            uploadDate: new Date()
          }
          this.userService.userUploadFile(this.loggenUser)
        }
      } else {
        alert("Ezt már feltöltötted egyszer!")
        this.feltolt = false;
      }
    }
  }

  processImage(event: any) {
    const image = event.target.files[0];

    Tesseract.recognize(image, 'hun', {
      logger: (progress) => {
      }
    })
      .then(result => {
        this.textResult = result.data.text;
        this.feltolt = false;
        const bill:Bills=this.fileService.processingImage(this.textResult, this.loggenUser!, image.name);
        const dialogRef = this.dialog.open(FixFileDataComponent, {
          data: { fileData: bill as Bills},
          width: '95%',
          height: '95%'
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  /* convertToBase64(file: File) {
     const reader = new FileReader();
 
     // A FileReader API readAsDataURL metódusa aszinkron módon konvertálja a fájlt base64 formátumúra
     reader.readAsDataURL(file);
 
     // Eseménykezelő, ami lefut, amikor a fájl sikeresen beolvasásra került
     reader.onload = (event: any) => {
       // A base64 string a event.target.result értékében található
       const base64String = event.target.result;
       const base64Data = base64String.split(',')[1]; 
       const text = new TextDecoder("utf-8").decode(this.decodeBase64(base64Data));
 
       console.log("File in Base64: ", event.target.result);
       console.log(text)
       // További feldolgozáshoz itt használhatod a base64 stringet
     };
 
     // Hiba esetén ezt az eseménykezelőt hívjuk
     reader.onerror = (event: any) => {
       console.log("File could not be read: " + event.target.error.code);
     };
   }
 
   decodeBase64(base64: string): Uint8Array {
     const binaryString = window.atob(base64);
     const len = binaryString.length;
     const bytes = new Uint8Array(len);
     for (let i = 0; i < len; i++) {
       bytes[i] = binaryString.charCodeAt(i);
     }
     return bytes;
   }*/

}
