import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  activeTab = signal<string>('feed');
  only = signal<string>('following');

  // Endpoins
  getAllPosts(page: number = 1): Observable<any> {
    const currentTab = this.activeTab();
    if (currentTab === 'saved') {
      return this.getSavedPosts(page);
    }
    return this.getPosts(page);
  }

  getPosts(page: number = 1): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}posts/feed?only=${this.only()}&limit=20&page=${page}`);
  }

  getSavedPosts(page: number = 1): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}users/bookmarks?limit=20&page=${page}`);
  }

  createPost(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}posts`, data);
  }

  updatePost(postId: string, data: object): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}posts/${postId}`, data);
  }

  bookmarkUnbookmarkPost(postId: string): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}posts/${postId}/bookmark`, '');
  }

  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}posts/${postId}`);
  }

  getPostLikes(postId: string, page: number = 1): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}posts/${postId}/likes?page=${page}&limit=20`);
  }

  LikeUnlikePost(postId: string): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}posts/${postId}/like`, '');
  }

  sharePost(postId: string, data: object): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}posts/${postId}/share`, data);
  }

  getSinglePost(postId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}posts/${postId}`);
  }
}
