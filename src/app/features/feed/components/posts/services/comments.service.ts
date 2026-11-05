import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  // Endpoins
  getPostComments(postId: string, page: number = 1): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}posts/${postId}/comments?page=${page}&limit=5`);
  }

  createComments(postId: string, data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}posts/${postId}/comments`, data);
  }

  UpdateComment(postId: string, commentId: string, data: object): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}posts/${postId}/comments/${commentId}`, data);
  }

  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}posts/${postId}/comments/${commentId}`);
  }

  likeUnlikeComment(postId: string, commentId: string, data = null): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}posts/${postId}/comments/${commentId}/like`, data);
  }
}
