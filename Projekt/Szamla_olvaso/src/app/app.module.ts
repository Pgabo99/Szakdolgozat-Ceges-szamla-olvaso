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
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
