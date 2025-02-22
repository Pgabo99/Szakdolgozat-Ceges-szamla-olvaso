import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/userService/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {

  hidePassword: boolean = true;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  loginWithGoogle() {
    this.authService.signInWithGoogle().then((res: any) => {
      localStorage.setItem('token', 'true');
    })
      .catch((error: any) => { console.error(error); })
  }

  loginWithEmailAndPassword() {
    if (this.loginForm.value.email == '') {
      alert('Add meg az email címedet');
      return;
    }
    if (this.loginForm.value.password == '') {
      alert('Add meg a jelszavadat');
      return;
    }
    const userData = Object.assign(this.loginForm.value);
    this.authService.signInWithEmailAndPassword(userData).then((res: any) => {
      this.router.navigateByUrl('regisztracio');
    })
      .catch((error: any) => { alert("Sikertelen bejelentkezés"); })
  }

  async ForgotPassword() {
    if (this.loginForm.value.email == '') {
      alert('Add meg az email címedet');
      return;
    }
    this.authService.passwordReset(this.loginForm.value.email);
    alert('Nézd meg az email fiókodat');
  }
}
