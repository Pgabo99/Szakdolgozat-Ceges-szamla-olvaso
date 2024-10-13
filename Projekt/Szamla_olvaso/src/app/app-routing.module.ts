import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuardGuard } from './guards/auth-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'bejelentkezes', pathMatch:'full' },
  { path: 'bejelentkezes', component: LoginComponent },
  { path: 'regisztracio', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuardGuard]  },
  { path: '**', redirectTo: 'bejelentkezes', pathMatch:'full'}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
