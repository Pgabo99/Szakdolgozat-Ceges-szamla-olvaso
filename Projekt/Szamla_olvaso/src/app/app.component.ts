import { Component, computed, signal } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Szamla_olvaso';
  user: firebase.User | null = null;
  collapsed=signal(false);
  sidenavWidth=computed(()=>this.collapsed()?'65px':'250px');
  constructor(public afAuth: AngularFireAuth,private authService:AuthService, private router:Router ) {
    this.afAuth.authState.subscribe(user => {
      this.user = user;
    });
  }
  login() {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout() {
    this.authService.logout();
  }
  loggenIn() {
    return this.authService.IsLoggenIn();
  }
}
