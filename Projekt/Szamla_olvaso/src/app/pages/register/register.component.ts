import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/userService/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {
  hidePassword: boolean = true;
  hidePasswordAgain: boolean = true;

  registerForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    passwordAgain: new FormControl('', Validators.required)
  });

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.IsLoggenIn()) {
      this.router.navigate(['/kezdooldal']);
    }
  }

  loginWithGoogle() {
    this.authService.signInWithGoogle().then((res: any) => {
    })
      .catch((error: any) => { alert('Sikertelen bejelentkezés')})
  }

  registerWithEmailAndPassword() {
    if (this.registerForm.value.email == '') {
      alert('Add meg az email címedet');
      return;
    }
    else if (this.registerForm.value.password === '' && this.registerForm.value.passwordagain === '') {
      alert('Add meg kétszer a jelszavadat');
      return;
    }
    else if (this.registerForm.value.password !== this.registerForm.value.passwordAgain) {
      alert('Kérlek ugyanazt a jelszót add meg!');
      return;
    }
    else if (this.registerForm.invalid) {
      alert('Kérlek töltsd ki az összes kötelező mezőt!');
      return;
    }
    else {
      const userData = Object.assign(this.registerForm.value);
      this.authService.registerWithEmailAndPassword(userData).then((res: any) => {
      })
        .catch((error: any) => { alert('Sikertelen regisztráció, próbálj meg másik emailt!'); })
    }
  }
}
