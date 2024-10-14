import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { SidenavComponent } from './component/sidenav/sidenav.component';

import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule,MatLabel} from '@angular/material/form-field';
import { GoogleLoginCardComponent } from './component/google-login-card/google-login-card.component';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import {MatListModule} from '@angular/material/list'

const firebaseConfig = {
  apiKey: "AIzaSyA_AiToCNllRHkVkleW9E6P_sp3RuXmY5E",
  authDomain: "szamla-olvaso.firebaseapp.com",
  projectId: "szamla-olvaso",
  storageBucket: "szamla-olvaso.appspot.com",
  messagingSenderId: "819730583747",
  appId: "1:819730583747:web:d073a177738b5e28685276",
  measurementId: "G-EQ19F5P25H"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    GoogleLoginCardComponent,
    SidenavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatLabel,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
    
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
