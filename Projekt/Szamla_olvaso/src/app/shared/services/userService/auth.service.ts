import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { concatMap, from, Observable } from 'rxjs';
import { ProfileUploadService } from './profile-upload.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser$;
  userEmail$: string | null | undefined;

  constructor(private afs: AngularFireAuth, private router: Router, private imageUploadService: ProfileUploadService,) {
    this.currentUser$ = this.afs.authState;
    this.afs.authState.subscribe(auth => {
      if (auth) {
        this.userEmail$ = auth.email;
      }
    });
  }

  signInWithGoogle() {
    return this.afs.signInWithPopup(new GoogleAuthProvider()).then((result) => {
      localStorage.setItem('token', 'true');
      this.currentUser$ = this.afs.authState;
      this.afs.authState.subscribe(auth => {
        if (auth) {
          this.userEmail$ = auth.email;
          this.router.navigateByUrl('/kezdooldal');
        }
      });
    }).catch(error => {
      alert('Google bejelentkezés sikertelen...');
      this.afs.signOut();
      localStorage.clear();
    });
  }

  registerWithEmailAndPassword(user: { email: string, password: string }) {
    return this.afs.createUserWithEmailAndPassword(user.email, user.password)
      .then(() => {
        this.afs.authState.subscribe(auth => {
          if (auth) {
            this.userEmail$ = auth.email;
          }
        });
        localStorage.setItem('token', 'true');
        this.router.navigateByUrl('/kezdooldal');
      })
      .catch((error) => {
        alert('Regisztráció sikertelen... ');
      });
  }

  signInWithEmailAndPassword(user: { email: string, password: string }) {
    return this.afs.signInWithEmailAndPassword(user.email, user.password)
      .then(() => {
        this.currentUser$ = this.afs.authState;
        localStorage.setItem('token', 'true');
        this.afs.authState.subscribe(auth => {
          if (auth) {
            this.userEmail$ = auth.email;
          }
        });
        this.router.navigateByUrl('/kezdooldal');
      })
      .catch((error) => {
        alert('Bejelentkezés sikertelen...');
      });
  }

  logout() {
    this.afs.signOut();
    return this.afs.signOut().then(() => {
      localStorage.clear();
      this.currentUser$;
      location.reload()
      alert('Sikeres kijelentkezés!');
    }).catch((err) => {
      alert(err.message);
    });
  }

  IsLoggenIn() {
    return !!this.userEmail$ || !!localStorage.getItem('token');
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

  currentUser(): Observable<any> {
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

  getUserEmail() {
    return this.userEmail$;
  }

  passwordReset(email: string) {
    return this.afs.sendPasswordResetEmail(email);
  }
}
