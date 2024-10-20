import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { concatMap, Observable } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileUploadService } from '../../shared/services/profile-upload.service';
import { UserInfoService } from '../../shared/services/user-info.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss'
})
export class UploadFileComponent {
  user$: Observable<any>;
  downloadURL: string;
  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService, private router: Router, private dialog: MatDialog, private userService: UserInfoService) {
    this.user$ = this.authService.currentUser$;
    this.downloadURL = ""
    this.fetchDownloadURL()
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
}
