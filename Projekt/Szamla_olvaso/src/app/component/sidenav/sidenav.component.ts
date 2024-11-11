import { Component, computed, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { ProfileUploadService } from '../../shared/services/profile-upload.service';


export type MenuItem = {
  icon: string;
  label: string;
  route: string;
  click: string;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent implements OnInit, OnChanges {
  sideNavCollapsed = signal(false);

  user$: Observable<any>;
  email;
  downloadURL: string;

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }
  menuItemsLoggedIn = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Kezdőoldal',
      route: 'kezdooldal',
      click: ''
    },
    {
      icon: 'person',
      label: 'Profilom',
      route: 'profil',
      click: ''
    },
    {
      icon: 'description',
      label: 'Táblázatok',
      route: 'tablazatok',
      click: ''
    },
    {
      icon: 'upload_File',
      label: 'Fájlfeltöltés',
      route: 'fajlfeltoltes',
      click: ''
    },
    {
      icon: 'logout',
      label: 'Kijelentkezes',
      route: 'logout',
      click: 'logout'
    }
  ])

  menuItemsNotLoggedIn = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Kezdőlap',
      route: 'kezdooldal',
      click: ''
    },

    {
      icon: 'login',
      label: 'Bejelentkezés',
      route: '/bejelentkezes',
      click: ''
    },
    {
      icon: 'person_add',
      label: 'Regisztráció',
      route: '/regisztracio',
      click: ''
    }
  ])

  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService) {
    this.user$ = this.authService.currentUser$;
    this.downloadURL = ""
    this.email = this.authService.getUserEmail();

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.fetchDownloadURL()
  }
  ngOnInit(): void {
    this.fetchDownloadURL()
  }

  logout() {
    this.authService.logout();
  }
  nothing() { }
  loggenIn() {
    return this.authService.IsLoggenIn();
  }

  profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '100')

  fetchDownloadURL() {
      this.user$.subscribe(user => {
        if (user) {
          const filePath = `images/profile/${user.uid}`;
          this.imageUploadService.getFileDownloadURL(filePath).subscribe(url => {
            this.downloadURL = url;
          });
        } else {
          console.log('A felhasználó nem elérhető.');
        }
      });
   
  }
}
