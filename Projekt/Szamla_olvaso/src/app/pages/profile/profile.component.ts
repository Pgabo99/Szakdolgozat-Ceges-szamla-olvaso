import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { concatMap, Observable, Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { ProfileUploadService } from '../../shared/services/profile-upload.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ChangeProfileComponent } from '../../component/change-profile/change-profile.component';
import { Users } from '../../shared/classes/Users';
import { UserInfoService } from '../../shared/services/user-info.service';
import { AddProfileComponent } from '../../component/add-profile/add-profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();

  user$: Observable<any>;
  downloadURL: string;
  loggenUser?: Users;
  userForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    companyName: new FormControl(''),
    phoneNumber: new FormControl(''),
    taxNumber: new FormControl(''),
    country: new FormControl(''),
    zipCode: new FormControl(''),
    site: new FormControl('')
  });

  profileForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('')
  });

  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService, private router: Router, private dialog: MatDialog, private userService: UserInfoService) {
    this.user$ = this.authService.currentUser$;
    this.downloadURL = ""
    this.fetchDownloadURL()
    this.profileForm.setValue({ email: this.authService.getUserEmail(), password: '' });
    this.subscriptions.add(this.userService.getUserByEmail(this.authService.getUserEmail() as string).subscribe(data => {
      if (data[0] != null) {
        this.loggenUser = data[0];
        this.userForm.setValue({
          email: this.loggenUser.email, name: this.loggenUser.name,
          companyName: this.loggenUser.companyName, phoneNumber: this.loggenUser.phoneNumber,
          taxNumber: this.loggenUser.taxNumber, country: this.loggenUser.country,
          zipCode: this.loggenUser.zipCode as unknown as string, site: this.loggenUser.site
        })
      }
    }));



  }

  ngOnInit(): void {
    this.fetchDownloadURL();
    this.subscriptions.add(this.userService.getUserByEmail(this.authService.getUserEmail() as string).subscribe(data => {
      this.loggenUser = data[0];

    }))
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  uploadImage(event: Event, user: User) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageUploadService.uploadImage(file, `images/profile/${user.uid}`).pipe(
        concatMap((photoURL: string) => this.authService.updateProfileData(user.displayName!, photoURL))
      ).subscribe({
        next: () => location.reload(),
        //this.router.navigateByUrl('/kezooldal', { skipLocationChange: true }).then(()=>this.router.navigateByUrl('/profil')),
        error: (err) => console.error('Error updating profile:', err)
      });
    }
  }

  fetchDownloadURL() {
    this.user$.subscribe(user => {
      if (user) {
        const filePath = `images/profile/${user.uid}`; // A fájl tárolási útvonala

        this.imageUploadService.getFileDownloadURL(filePath).subscribe(url => {
          this.downloadURL = url; // A letöltési URL tárolása
          console.log('Fájl letöltési URL:', this.downloadURL); // URL kiírása a konzolra
        });
      } else {
        console.log('A felhasználó nem elérhető.');
      }
    });
  }
  async resetPassword() {
    if (this.profileForm.value.email == '') {
      alert('Add meg az email címedet');
      return;
    }
    this.authService.passwordReset(this.profileForm.value.email);
    alert('Nézd meg az email fiókodat');
  }

  ResetPassword() {
    if (this.profileForm.value.email == '') {
      alert('Add meg az email címedet');
      return;
    }
    alert('Nézd meg az email fiókodat');
    this.authService.passwordReset(this.profileForm.value.email);
  }


  szerkeszt() {
    const dialogRef = this.dialog.open(ChangeProfileComponent, {
      data: { user: this.loggenUser },
      width: '95%',
      height: '95%'
    });
  }

  hozzaad() {
    const dialogRef = this.dialog.open(AddProfileComponent, {
      data: { userEmail: this.authService.getUserEmail() },
      width: '95%',
      height: '95%'
    });
  }
}
