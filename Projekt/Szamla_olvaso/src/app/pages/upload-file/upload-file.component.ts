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
      } else {
        alert("Mielőtt feltöltenél bármit is kérlek töltsd ki a profilodat!")
        this.megjelenitheto = false;
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
      if (voltE === false) {
        const path = `files/${this.uid}/${input.name}`
        const uploadTask = await this.imageUploadService.uploadBill(input, path)
        const url = await uploadTask.ref.getDownloadURL();
        if (fileExtension === 'pdf') {

          const formData = new FormData();
          formData.append('file', event.target.files[0]);
          this.http.post('http://localhost:3000/processPDF', formData).subscribe({
            next: (response) => {
              if ('type' in response) {
                if (response.type === 'text' && 'content' in response && typeof response.content === 'string' && response.content.replaceAll(' ', '').replaceAll("\n", "").replaceAll("\t", "").replaceAll("\v", "") !== "") {
                  const bill: Bills = this.fileService.processingImage(response.content as string, this.loggenUser!, input.name)
                  const dialogRef = this.dialog.open(FixFileDataComponent, {
                    data: { fileData: bill as Bills },
                    width: '95%',
                    height: '95%'
                  });
                } else if (response.type === 'path' && 'images' in response && Array.isArray(response.images)) {
                  const imagePath = response.images[0]['path'];
                  this.http.get(`http://localhost:3000/images/${imagePath}`, { responseType: 'blob' }).subscribe({
                    next: (blob) => {
                      const file = new File([blob], event.target.files[0].name, { type: "image/png" });

                      // Meghívjuk a processImage függvényt a letöltött fájllal

                      this.processImage(file);
                    },
                    error: (error) => console.error('Hiba a kép letöltésekor:', error)
                  });
                }
              }
            },
            error: (error) => console.error('Hiba történt:', error)
          });

        } else {
          this.processImage(event.target.files[0]);
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
    this.feltolt = false;
  }

  processImage(image: File) {
    Tesseract.recognize(image, 'hun', {
      logger: (progress) => {
      }
    })
      .then(result => {
        this.textResult = result.data.text;
        this.feltolt = false;
        const bill: Bills = this.fileService.processingImage(this.textResult, this.loggenUser!, image.name);
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
}
