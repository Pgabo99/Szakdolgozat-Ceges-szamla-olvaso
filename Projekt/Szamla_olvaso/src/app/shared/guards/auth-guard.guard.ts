import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/userService/auth.service';

@Injectable({
  providedIn: 'root'
})

export class authGuardGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }


  canActivate() {
    if (this.auth.IsLoggenIn()) {
      return true;
    }

    alert("Hoppá! Nem vagy bejelentkezve!");
    this.router.navigate(['/bejelentkezes'])
    return false;
  }
}
