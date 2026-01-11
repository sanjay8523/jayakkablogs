import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Blog, BlogResponse } from '../models/blog.model';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllBlogs(): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/blogs`);
  }

  getBlogById(id: string): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/blogs/${id}`);
  }

  getMyBlogs(): Observable<BlogResponse & { totalViews: number; totalLikes: number }> {
    return this.http.get<any>(`${this.apiUrl}/blogs/user/me`);
  }

  createBlog(formData: FormData): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(`${this.apiUrl}/blogs`, formData);
  }

  updateBlog(id: string, formData: FormData): Observable<BlogResponse> {
    return this.http.put<BlogResponse>(`${this.apiUrl}/blogs/${id}`, formData);
  }

  deleteBlog(id: string): Observable<BlogResponse> {
    return this.http.delete<BlogResponse>(`${this.apiUrl}/blogs/${id}`);
  }

  toggleLike(id: string): Observable<{ success: boolean; liked: boolean; likes: number }> {
    return this.http.post<any>(`${this.apiUrl}/blogs/${id}/like`, {});
  }
}
