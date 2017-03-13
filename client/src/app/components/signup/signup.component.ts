import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import {ApiService} from '../../services/apiService';
import {TokenService} from '../../services/tokenService';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  private formGroup: FormGroup;
  private usernameFormControl: FormControl;
  private passwordFormControl: FormControl;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usernameFormControl = new FormControl('', Validators.required);
    this.passwordFormControl = new FormControl('', Validators.required);
    this.formGroup = this.formBuilder.group({
      username: this.usernameFormControl,
      password: this.passwordFormControl
    });
  }

  signup() {
    this.apiService.signup(this.usernameFormControl.value, this.passwordFormControl.value)
      .then(response => {
        this.tokenService.setToken(response.json().token);
        this.router.navigate(['dashboard']);
      })
      .catch(err => console.error(err.json()));
  }

}
