import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UploadedFile } from '../classes/uploaded-file';

@Injectable({
  providedIn: 'root'
})
export class FileServiceService {

  constructor(private angularFirestore:AngularFirestore,private router:Router) { }

  //User infó hozzáadása
  addUserToFiles(user: UploadedFile) {
    return this.angularFirestore.collection<UploadedFile>('Files').add(user);
  }

  //User lekérése
  getUserFileByEmail(email: string) {
    return this.angularFirestore.collection<UploadedFile>('/Files', ref => ref.where('email', '==', email)).valueChanges();
  }

  //User adatának frissítése
  updloadUserFileByEmail(user: UploadedFile,email:string) {
    return this.angularFirestore.collection('Files', (ref) => ref.where('email', '==', email)).get().subscribe(
      (querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          doc.ref.update({ Files: user.fileName as string });
        });
      }
    );
  }
}
