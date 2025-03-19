import { Component, OnInit } from '@angular/core';
import { ProfileUploadService } from '../../shared/services/userService/profile-upload.service';
import { AuthService } from '../../shared/services/userService/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  loggedIn = false;
  constructor(private authService: AuthService) {
    this.loggedIn = this.authService.IsLoggenIn();
  }

  ngOnInit() {
    this.loggedIn = this.authService.IsLoggenIn();
  }

}
