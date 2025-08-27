import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Post, 
  CreatePostRequest, 
  Comment, 
  CreateCommentRequest, 
  PostsResponse, 
  CommentsResponse 
} from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8081/api/posts';

  constructor(private http: HttpClient) {}

  // Create a new post
  createPost(request: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, request);
  }

  // Get all posts (feed) with pagination
  getAllPosts(page: number = 0, size: number = 10): Observable<PostsResponse> {
    console.log('Getting all posts with page:', page, 'size:', size);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    const request = this.http.get<PostsResponse>(this.apiUrl, { params });
    
    request.subscribe({
      next: (response) => console.log('Posts loaded successfully:', response),
      error: (error) => {
        console.error('Error loading posts:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        if (error.error && typeof error.error === 'string' && error.error.includes('<!DOCTYPE')) {
          console.error('Received HTML instead of JSON - likely an authentication error');
        }
      }
    });
    
    return request;
  }

  // Get posts by user
  getUserPosts(userId: number, page: number = 0, size: number = 10): Observable<PostsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PostsResponse>(`${this.apiUrl}/user/${userId}`, { params });
  }

  // Get a specific post
  getPost(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${postId}`);
  }

  // Like/Unlike a post
  toggleLike(postId: number): Observable<Post> {
    console.log(`Attempting to toggle like for post ${postId}`);
    return this.http.post<Post>(`${this.apiUrl}/${postId}/like`, {});
  }

  // Like a post (individual method)
  likePost(postId: number): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${postId}/like`, {});
  }

  // Unlike a post (individual method)
  unlikePost(postId: number): Observable<Post> {
    return this.http.delete<Post>(`${this.apiUrl}/${postId}/like`);
  }

  // Delete a post
  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}`);
  }

  // Add a comment to a post
  addComment(postId: number, request: CreateCommentRequest): Observable<Comment>;
  addComment(postId: number, content: string): Observable<Comment>;
  addComment(postId: number, requestOrContent: CreateCommentRequest | string): Observable<Comment> {
    const request = typeof requestOrContent === 'string' 
      ? { content: requestOrContent } 
      : requestOrContent;
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, request);
  }

  // Get comments for a post
  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  // Search posts
  searchPosts(keyword: string, page: number = 0, size: number = 10): Observable<PostsResponse> {
    const params = new HttpParams()
      .set('q', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PostsResponse>(`${this.apiUrl}/search`, { params });
  }

  // Get trending posts
  getTrendingPosts(page: number = 0, size: number = 10): Observable<PostsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PostsResponse>(`${this.apiUrl}/trending`, { params });
  }
}
