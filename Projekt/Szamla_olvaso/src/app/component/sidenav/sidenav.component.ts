import { Component, computed, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { AuthService } from '../../shared/services/userService/auth.service';
import { catchError, Observable, Subscription, switchMap, take } from 'rxjs';
import { ProfileUploadService } from '../../shared/services/userService/profile-upload.service';
import { Router } from '@angular/router';
import { UserInfoService } from '../../shared/services/userService/user-info.service';

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
  profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '100');
  private subscriptions = new Subscription();

  user$: Observable<any>;
  email = '';
  downloadURL: string;
  companyName: string = "";
  fullname: string = "-";

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

  constructor(private authService: AuthService, private imageUploadService: ProfileUploadService, private router: Router, private userService: UserInfoService) {
    this.user$ = this.authService.currentUser$;
    this.downloadURL = ""
    this.user$.forEach(data => {
      this.email = data.email;
      if (data.email) {
        this.subscriptions.add(this.userService.getUserByEmail(data.email as string).subscribe(data => {
          console.log('asd');
          if (data[0] != null) {
            console.log(data[0]);
            this.companyName = data[0].companyName;
            this.fullname = data[0].name;
          }
        }));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.fetchDownloadURL();
  }

  ngOnInit(): void {
    this.fetchDownloadURL();
  }

  logout() {
    if (confirm("Biztosan kijelentkezel?")) {
      this.authService.logout();
    }
  }

  nothing() { }

  loggenIn() {
    return this.authService.IsLoggenIn();
  }

  fetchDownloadURL() {
    this.user$.subscribe(user => {
      if (user) {
        let filePath = `images/profile/${user.uid}`;
        this.imageUploadService.getFileDownloadURL(filePath).pipe(
          catchError(error => {
            return this.imageUploadService.getFileDownloadURL('background2.png');
          })
        ).subscribe(url => {
          this.downloadURL = url;
        });
      }
    });
  }

  toProfile() {
    this.router.navigateByUrl('profil')
  }
}
