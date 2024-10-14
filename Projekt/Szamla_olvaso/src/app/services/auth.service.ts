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
    return this.afs.signInWithPopup(new GoogleAuthProvider()).then((result) => {
      localStorage.setItem('token', 'true');
    }).catch(error => {
      console.error('Google sign-in error:', error);
      alert('Google bejelentkezés sikertelen: ' + error.message);
    });
  }

  registerWithEmailAndPassword(user: { email: string, password: string }) {
    return this.afs.createUserWithEmailAndPassword(user.email, user.password)
    .then(() => {
      alert('Regisztráció sikeres!');
    })
    .catch((error) => {
      console.error('Registration error:', error);
      alert('Regisztráció sikertelen: ' + error.message);
    });
  }

  signInWithEmailAndPassword(user: { email: string, password: string }) {
    return this.afs.signInWithEmailAndPassword(user.email, user.password)
    .then(() => {
      localStorage.setItem('token', 'true');
    })
    .catch((error) => {
      console.error('Sign-in error:', error);
      alert('Bejelentkezés sikertelen: ' + error.message);
    });
  }
  logout() {
    return this.afs.signOut().then(() => {
      localStorage.clear();
      this.router.navigate(['/bejelentkezes']);
      alert('Sikeres kijelentkezés!');
    }).catch((err) => {
      alert(err.message);
    });
  }

  IsLoggenIn() {
    return !!localStorage.getItem('token');
  }
  deleteUser() {
    this.afs.currentUser.then(user => {
      if (user) {
        user.delete().then(() => {
          localStorage.clear();
          alert('A felhasználó törlése sikeres volt.');
        }).catch(error => {
          alert('Felhasználó törlése sikertelen: ' + error.message);
        });
      } else {
        alert('Nincs bejelentkezve felhasználó.');
      }
    });
    localStorage.clear();
  }

}
