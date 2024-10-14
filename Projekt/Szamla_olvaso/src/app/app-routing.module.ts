import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuardGuard } from './guards/auth-guard.guard';
import { loginRegisterGuard } from './guards/login-register.guard';

const routes: Routes = [
  { path: '', redirectTo: 'bejelentkezes', pathMatch:'full' },
  { path: 'bejelentkezes', component: LoginComponent,canActivate:[loginRegisterGuard] },
  { path: 'regisztracio', component: RegisterComponent,canActivate:[loginRegisterGuard] },
  { path: 'kezdooldal', component: HomeComponent},
  { path: 'profil', component: HomeComponent, canActivate: [authGuardGuard]  },
  { path: 'tablazatok', component: HomeComponent, canActivate: [authGuardGuard]  },
  { path: 'fajlfeltoltes', component: HomeComponent, canActivate: [authGuardGuard]  },
  { path: '**', redirectTo: 'kezdooldal', pathMatch:'full'}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
