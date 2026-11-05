import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { User } from '../../../features/feed/components/posts/models/post.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  currentUser = signal<User | null>(this.getStoredUser());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    })
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  signUp(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'users/signup', data);
  }

  signIn(data: object): Observable<any> {
    return this.httpClient.post(environment.baseUrl + 'users/signin', data);
  }

  logOut(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  changePassword(data: object): Observable<any> {
    return this.httpClient.patch(environment.baseUrl + 'users/change-password', data);
  }
}
