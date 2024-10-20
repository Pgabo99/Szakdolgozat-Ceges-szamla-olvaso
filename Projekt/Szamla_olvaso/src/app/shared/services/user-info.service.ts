import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Users } from '../classes/Users';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor(private angularFirestore:AngularFirestore,private router:Router) { }

  //User infó hozzáadása
  addUser(user: Users) {
    return this.angularFirestore.collection<Users>('Users').add(user);
  }

  //User lekérése
  getUserByEmail(email: string) {
    return this.angularFirestore.collection<Users>('/Users', ref => ref.where('email', '==', email)).valueChanges();
  }

  //User adatának frissítése
  updateUser(user: Users) {
    return this.angularFirestore.collection('Users', (ref) => ref.where('email', '==', user.email)).get().subscribe(
      (querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          doc.ref.update({ name: user.name as string });
          doc.ref.update({ companyName: user.companyName });
          doc.ref.update({ phoneNumber: user.phoneNumber });
          doc.ref.update({ taxNumber: user.taxNumber });
          doc.ref.update({ country: user.country });
          doc.ref.update({ zipCode: user.zipCode });
          doc.ref.update({ site: user.site });
        });
      }
    );
  }
}
