import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage'; 

import { environment } from '../environments/environment';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { SidenavComponent } from './component/sidenav/sidenav.component';
import { GoogleLoginCardComponent } from './component/google-login-card/google-login-card.component';
import { ProfileComponent } from './pages/profile/profile.component';

import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChangeProfileComponent } from './component/change-profile/change-profile.component';
import { AddProfileComponent } from './component/add-profile/add-profile.component';
import { UploadFileComponent } from './pages/upload-file/upload-file.component';
import { HttpClientModule } from '@angular/common/http';
import { TablesComponent } from './pages/tables/tables.component';
import { FixFileDataComponent } from './component/fix-file-data/fix-file-data.component';
import { TableColumnsComponent } from './component/table-columns/table-columns.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    GoogleLoginCardComponent,
    SidenavComponent,
    ProfileComponent,
    ChangeProfileComponent,
    AddProfileComponent,
    UploadFileComponent,
    TablesComponent,
    FixFileDataComponent,
    TableColumnsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatTableModule,
    MatProgressBarModule,
    MatSortModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }