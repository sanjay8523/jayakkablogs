import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Blog, BlogResponse, CreateBlogRequest, UpdateBlogRequest } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllBlogs(): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/blogs`);
  }

  getBlogById(id: string): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/blogs/${id}`);
  }

  getMyBlogs(): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/blogs/user/me`);
  }

  createBlog(data: CreateBlogRequest): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(`${this.apiUrl}/blogs`, data);
  }

  updateBlog(id: string, data: UpdateBlogRequest): Observable<BlogResponse> {
    return this.http.put<BlogResponse>(`${this.apiUrl}/blogs/${id}`, data);
  }

  deleteBlog(id: string): Observable<BlogResponse> {
    return this.http.delete<BlogResponse>(`${this.apiUrl}/blogs/${id}`);
  }
}