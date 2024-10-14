import { Component, computed, Input, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';


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
export class SidenavComponent {
  sideNavCollapsed = signal(false);

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

  constructor(private authService: AuthService) {
  }

  logout() {
    this.authService.logout();
  }
  nothing() { }
  loggenIn() {
    return this.authService.IsLoggenIn();
  }

  profilePicSize = computed(() => this.sideNavCollapsed() ? '32' : '100')
}
