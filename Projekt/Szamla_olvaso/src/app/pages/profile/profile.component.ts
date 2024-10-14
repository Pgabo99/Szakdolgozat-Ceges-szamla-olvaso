import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { concatMap, Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { ProfileUploadService } from '../../shared/services/profile-upload.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  user$:Observable<any>;
  downloadURL: string;

  constructor(private authService:AuthService, private imageUploadService:ProfileUploadService, private router:Router){
   this.user$=this.authService.currentUser$;
   this.downloadURL=""
   this.fetchDownloadURL()
  }

  ngOnInit(): void {
    this.fetchDownloadURL()
  }

  /*uploadImage(event:any, user:User){
    this.imageUploadService.uploadImage(event.target.files[0],`images/profile/${user.uid}`).pipe(
      concatMap((photoURL: any)=>this.authService.updateProfileData(user.displayName!,photoURL))
    ).subscribe();
  }*/

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

}
