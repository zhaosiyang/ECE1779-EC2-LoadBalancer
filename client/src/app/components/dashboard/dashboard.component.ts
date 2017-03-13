import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../services/apiService';
import {TokenService} from '../../services/tokenService';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private images;
  private selectedFile: File;

  constructor(private apiService: ApiService,
              private tokenService: TokenService,
              private router: Router
  ) {}

  ngOnInit() {
    this.apiService.getMyImages().then(response => this.images = response.json());
  }

  upload() {
    this.apiService.uploadImage(this.selectedFile)
      .then(res => alert('upload success'))
      .catch(err => alert('something wrong when uploading image'));
  }

  logout() {
    this.tokenService.removeToken();
    this.router.navigate(['login']);
  }

}
