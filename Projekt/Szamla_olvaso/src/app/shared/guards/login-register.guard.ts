import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/userService/auth.service';

@Injectable({
  providedIn: 'root'
})

export class loginRegisterGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  canActivate() {
    if (!this.auth.IsLoggenIn()) {
      return true;
    }
    return false;
  }
}
