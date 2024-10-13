import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afs: AngularFireAuth, private router: Router) { }
  signInWithGoogle() {
    return this.afs.signInWithPopup(new GoogleAuthProvider());
  }

  registerWithEmailAndPassword(user: { email: string, password: string }) {
    return this.afs.createUserWithEmailAndPassword(user.email, user.password);
  }

  signInWithEmailAndPassword(user: { email: string, password: string }) {
    return this.afs.signInWithEmailAndPassword(user.email, user.password);
  }
  logout() {
    return this.afs.signOut().then(() => {
      localStorage.clear();
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    });
  }

   IsLoggenIn() {
    return !!localStorage.getItem('token');
  }
  deleteUser() {
    this.afs.currentUser.then(user => user?.delete());
    localStorage.clear();
  }

}
