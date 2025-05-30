import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuardGuard } from './shared/guards/auth-guard.guard';
import { loginRegisterGuard } from './shared/guards/login-register.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { UploadFileComponent } from './pages/upload-file/upload-file.component';
import { TablesComponent } from './pages/tables/tables.component';

const routes: Routes = [
  { path: 'bejelentkezes', component: LoginComponent, canActivate: [loginRegisterGuard] },
  { path: 'regisztracio', component: RegisterComponent, canActivate: [loginRegisterGuard] },
  { path: 'profil', component: ProfileComponent, canActivate: [authGuardGuard] },
  { path: 'tablazatok', component: TablesComponent, canActivate: [authGuardGuard] },
  { path: 'fajlfeltoltes', component: UploadFileComponent, canActivate: [authGuardGuard] },
  { path: 'kezdooldal', component: HomeComponent },
  { path: '', redirectTo: '/kezdooldal', pathMatch: 'full' },
  { path: '**', redirectTo: '/kezdooldal' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
