import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { concatMap, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileUploadService } from '../../shared/services/profile-upload.service';
import { UserInfoService } from '../../shared/services/user-info.service';
import { User } from 'firebase/auth';
import { Users } from '../../shared/classes/Users';
import { UploadedFile } from '../../shared/classes/uploaded-file';
import * as Tesseract from 'tesseract.js';
import { HttpClient } from '@angular/common/http';

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

  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService, private router: Router, private dialog: MatDialog, private userService: UserInfoService,private http: HttpClient) {
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
    const input = event.target.files[0];
    const allowedExtensions = ['pdf', 'png', 'jpeg', 'jpg'];
    const fileExtension = input.name.split('.').pop()?.toLowerCase();
    if (!input) {
      alert("Nem választottál ki fájlt.")
    }
    else if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert("Rossz fájl formátum!")
    }
    else {
      const path = `files/${this.uid}/${input.name}`
      const uploadTask = await this.imageUploadService.uploadBill(input, path)
      const url = await uploadTask.ref.getDownloadURL();
      if(fileExtension=='pdf'){
        this.convertToBase64(url)
      }else{
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
    }

  }

  processImage(event: any) {
    const image = event.target.files[0];

    Tesseract.recognize(image, 'hun', {
      logger: (progress) => {
        console.log(progress); // You can log the progress or show a progress bar
      }
    })
    .then(result => {
      this.textResult = result.data.text;
      console.log(result.data.text);
    })
    .catch(err => {
      console.error(err);
    });
  }

  convertToBase64(url: string) {
    this.http.get(url, { responseType: "blob" }).subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        //Here you can do whatever you want with the base64 String
        console.log("File in Base64: ", event.target.result);
      };

      reader.onerror = (event: any) => {
        console.log("File could not be read: " + event.target.error.code);
      };
    });
}
  

}
