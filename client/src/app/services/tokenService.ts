import {Injectable} from '@angular/core';

@Injectable()
export class TokenService {

  setToken(token: string) {
    localStorage.setItem('_token', token);
  }
  getToken(): string {
    return 'Bearer ' + localStorage.getItem('_token');
  }
  removeToken() {
    localStorage.removeItem('_token');
  }

}
