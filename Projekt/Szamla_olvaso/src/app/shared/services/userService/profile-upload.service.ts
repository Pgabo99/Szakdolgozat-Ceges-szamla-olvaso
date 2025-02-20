import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProfileUploadService {

  constructor(private storage: AngularFireStorage) { }

  uploadImage(image: File, path: string): Observable<string> {
    const storageRef = this.storage.ref(path); 
    const uploadTask = from(this.storage.upload(path, image)); 
    return uploadTask.pipe(
      switchMap(() => storageRef.getDownloadURL()) 
    );
  }

  getFileDownloadURL(path: string): Observable<string> {
    const storageRef = this.storage.ref(path);
    return storageRef.getDownloadURL(); 
  }

  async uploadBill(bill:File,path:string):Promise<any>{
    return await this.storage.upload(path,bill)
  }
}