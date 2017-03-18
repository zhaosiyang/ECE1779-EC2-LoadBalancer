
import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/toPromise';
import {TokenService} from './tokenService';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Injectable()
export class ApiService {

  static API_BASE = `${environment.backendUrl}api`;

  constructor(
    private http: Http,
    private tokenService: TokenService,
    private router: Router
  ) {}

  private createHeadersWithAuthorizationToken() {
    const token = this.tokenService.getToken();
    return new Headers({'Authorization': token});
  }

  private preCheckStatus401() {
    return (response: Response) => {
      if (response.status == 401) {
        this.router.navigate(['login']);
      }
      throw response;
    }
  }

  login(username: string, password: string): Promise<Response> {
    return this.http.post(ApiService.API_BASE + '/users/login', {username, password}).toPromise()
  }

  signup(username: string, password: string): Promise<Response> {
    return this.http.post(ApiService.API_BASE + '/users/signup', {username, password}).toPromise();
  }

  getMyImages(): Promise<Response> {
    const headers = this.createHeadersWithAuthorizationToken();
    return this.http.get(ApiService.API_BASE + '/images/my-images', {headers}).toPromise()
      .catch(this.preCheckStatus401());
  }

  getOneImage(id: string): Promise<Response> {
    const headers = this.createHeadersWithAuthorizationToken();
    return this.http.get(ApiService.API_BASE + '/images/' + id, {headers}).toPromise()
      .catch(this.preCheckStatus401());
  }

  uploadImage(file: File): Promise<Response> {
    const headers = this.createHeadersWithAuthorizationToken();
    const formData = new FormData();
    formData.append('file', file);
    let options = new RequestOptions({ headers: headers });
    return this.http.post(ApiService.API_BASE + '/images', formData, options).toPromise()
      .catch(this.preCheckStatus401());
  }

  getAdminConfig(): Promise<Response> {
    return this.http.get(ApiService.API_BASE + '/adminConfig').toPromise();
  }

  setAdminConfig(body): Promise<Response> {
    return this.http.put(ApiService.API_BASE + '/adminConfig', body).toPromise();
  }

}
