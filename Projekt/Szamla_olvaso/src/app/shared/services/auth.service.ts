import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, updateProfile, UserInfo } from 'firebase/auth';
import { concatMap, from, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser$;

  constructor(private afs: AngularFireAuth, private router: Router) { 
    this.currentUser$=this.afs.authState;
  }
  signInWithGoogle() {
    return this.afs.signInWithPopup(new GoogleAuthProvider()).then((result) => {
      localStorage.setItem('token', 'true');
      this.currentUser$=this.afs.authState;
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
      this.currentUser$=this.afs.authState;
      localStorage.setItem('token', 'true');
    })
    .catch((error) => {
      console.error('Sign-in error:', error);
      alert('Bejelentkezés sikertelen: ' + error.message);
    });
  }
  logout() {
    this.afs.signOut();
    return this.afs.signOut().then(() => {
      localStorage.clear();
      location.reload()
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

  currentUser():Observable<any> {
    return this.afs.authState;
  }


  updateProfileData(displayName: string, photoURL: string): Observable<void> {
    return from(this.afs.currentUser).pipe(
      concatMap(user => {
        if (!user) throw new Error('Nincs bejelentkezve');
        
        return from(updateProfile(user, { displayName, photoURL }));
      })
    );
  }

  updateUserEmail(newEmail: string, password:string, oldEmail:string){
    return from(this.afs.signInWithEmailAndPassword(oldEmail, password).then(userCredentials => {
                return userCredentials.user!.updateEmail(newEmail);
    }))
}

}
