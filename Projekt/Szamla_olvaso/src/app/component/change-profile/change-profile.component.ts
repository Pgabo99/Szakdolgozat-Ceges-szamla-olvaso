import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'firebase/auth';
import { AuthService } from '../../shared/services/userService/auth.service';
import { Router } from '@angular/router';
import { Users } from '../../shared/classes/Users';
import { UserInfoService } from '../../shared/services/userService/user-info.service';

@Component({
  selector: 'app-change-profile',
  templateUrl: './change-profile.component.html',
  styleUrl: './change-profile.component.scss'
})
export class ChangeProfileComponent {


  updateProfileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    companyName: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl(''),
    taxNumber: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    zipCode: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    site: new FormControl('', [Validators.required])
  });

  profile: Users = {
    email: '',
    name: '',
    companyName: '',
    phoneNumber: '',
    taxNumber: '',
    country: '',
    zipCode: 0,
    city: '',
    site: '',
    files: {}

  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: Users }, private userService: UserInfoService, private router: Router) {
    console.log(this.data.user)
    this.updateProfileForm.setValue({
      email: this.data.user.email as string,
      name: this.data.user.name,
      companyName: this.data.user.companyName,
      phoneNumber: this.data.user.phoneNumber,
      taxNumber: this.data.user.taxNumber,
      country: this.data.user.country,
      zipCode: this.data.user.zipCode as unknown as string,
      city: this.data.user.city,
      site: this.data.user.site
    });
  }

  updateUser() {
    if(this.updateProfileForm.value.companyName==''||this.updateProfileForm.value.taxNumber==''||this.updateProfileForm.value.country==''||this.updateProfileForm.value.zipCode=='0'||this.updateProfileForm.value.city==''||this.updateProfileForm.value.site==''){
      alert('Nem adtál meg minden adatot' );
      return;
    }
    this.data.user.name = this.updateProfileForm.value.name as string;
    this.data.user.companyName = this.updateProfileForm.value.companyName as string;
    this.data.user.phoneNumber = this.updateProfileForm.value.phoneNumber as string;
    this.data.user.taxNumber = this.updateProfileForm.value.taxNumber as string;
    this.data.user.country = this.updateProfileForm.value.country as string;
    this.data.user.zipCode = this.updateProfileForm.value.zipCode as unknown as number;
    this.data.user.city=this.updateProfileForm.value.city as string;
    this.data.user.site = this.updateProfileForm.value.site as string;
    this.userService.updateUser(this.data.user);
  }

}
