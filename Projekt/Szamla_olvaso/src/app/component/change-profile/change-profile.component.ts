import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'firebase/auth';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { Users } from '../../shared/classes/Users';
import { UserInfoService } from '../../shared/services/user-info.service';

@Component({
  selector: 'app-change-profile',
  templateUrl: './change-profile.component.html',
  styleUrl: './change-profile.component.scss'
})
export class ChangeProfileComponent {


  updateProfileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    companyName: new FormControl(''),
    phoneNumber: new FormControl(''),
    taxNumber: new FormControl(''),
    country: new FormControl(''),
    zipCode: new FormControl(''),
    site: new FormControl('')
  });

  profile: Users = {
    email: '',
    name: '',
    companyName: '',
    phoneNumber: '',
    taxNumber: '',
    country: '',
    zipCode: 0,
    site: '',
    files:{}

  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: Users }, private userService: UserInfoService, private router: Router) {
    this.updateProfileForm.setValue({
      email: this.data.user.email as string,
      name: this.data.user.name,
      companyName: this.data.user.companyName,
      phoneNumber: this.data.user.phoneNumber,
      taxNumber: this.data.user.taxNumber,
      country: this.data.user.country,
      zipCode: this.data.user.zipCode as unknown as string,
      site: this.data.user.site
    });
  }

  updateUser() {
    this.data.user.name = this.updateProfileForm.value.name as string;
    this.data.user.companyName = this.updateProfileForm.value.companyName as string;
    this.data.user.phoneNumber = this.updateProfileForm.value.phoneNumber as string;
    this.data.user.taxNumber = this.updateProfileForm.value.taxNumber as string;
    this.data.user.country = this.updateProfileForm.value.country as string;
    this.data.user.zipCode = this.updateProfileForm.value.zipCode as unknown as number;
    this.data.user.site = this.updateProfileForm.value.site as string;
    this.userService.updateUser(this.data.user);
  }

}
