import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'firebase/auth';
import { UserInfoService } from '../../shared/services/userService/user-info.service';
import { Users } from '../../shared/classes/Users';

@Component({
  selector: 'app-add-profile',
  templateUrl: './add-profile.component.html',
  styleUrl: './add-profile.component.scss'
})
export class AddProfileComponent {


  addProfileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    companyName: new FormControl('',[Validators.required]),
    phoneNumber: new FormControl(''),
    taxNumber: new FormControl('',[Validators.required]),
    country: new FormControl('',[Validators.required]),
    zipCode: new FormControl('',[Validators.required]),
    city: new FormControl('',[Validators.required]),
    site: new FormControl('',[Validators.required])
  });

  profile: Users = {
    email: '',
    name: '',
    companyName: '',
    phoneNumber: '',
    taxNumber: '',
    country: '',
    zipCode: 0,
    city:'',
    site: '',
    files:{}
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { userEmail: string }, private userService: UserInfoService) {
    this.addProfileForm.setValue({ email: this.data.userEmail as string, name: '', companyName: '', phoneNumber: '', taxNumber: '', country: '', zipCode: '0', city:'',site: '' });
  }


  addUser() {
    if(this.addProfileForm.value.companyName==''||this.addProfileForm.value.taxNumber==''||this.addProfileForm.value.country==''||this.addProfileForm.value.zipCode=='0'||this.addProfileForm.value.city==''||this.addProfileForm.value.site==''){
      alert('Nem adtál meg minden adatot' );
      return;
    }
    this.profile.email=this.addProfileForm.value.email as string;
    this.profile.name=this.addProfileForm.value.name as string;
    this.profile.companyName=this.addProfileForm.value.companyName as string;
    this.profile.phoneNumber=this.addProfileForm.value.phoneNumber as string;
    this.profile.taxNumber=this.addProfileForm.value.taxNumber as string;
    this.profile.country=this.addProfileForm.value.country as string;
    this.profile.zipCode=this.addProfileForm.value.zipCode as unknown as number;
    this.profile.city=this.addProfileForm.value.city as string;
    this.profile.site=this.addProfileForm.value.site as string;
    this.userService.addUser(this.profile);
  }
}

