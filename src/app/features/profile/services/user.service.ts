import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);

  // Endpoints
  getMyProfile(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'users/profile-data');
  }

  getMyPosts(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'posts/feed?only=me');
  }

  getBookmarks(): Observable<any> {
    return this.httpClient.get(environment.baseUrl + 'users/bookmarks');
  }

  getSuggestions(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/suggestions?limit=5`);
  }

  followUnfollowUser(userId: string): Observable<any> {
    return this.httpClient.put(environment.baseUrl + `users/${userId}/follow`, null);
  }
}
