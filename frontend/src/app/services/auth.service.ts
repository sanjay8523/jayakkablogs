import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Debug on initialization
    console.log('🔧 AuthService initialized');
    console.log('👤 Current user from storage:', this.getUserFromStorage());
    console.log('🔑 Token from storage:', this.getToken());
  }

  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      return null;
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    console.log('📝 Registering user:', data.email);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((response) => {
        console.log('✅ Registration response:', response);
        if (response.success && response.token) {
          this.setSession(response);
        }
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Logging in user:', data.email);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        console.log('✅ Login response:', response);
        if (response.success && response.token) {
          this.setSession(response);
        }
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    console.log('💾 Setting session with token:', authResult.token.substring(0, 20) + '...');
    console.log('👤 User:', authResult.user);

    localStorage.setItem('token', authResult.token);
    localStorage.setItem('currentUser', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);

    // Verify storage
    console.log('✅ Token saved to localStorage:', !!localStorage.getItem('token'));
    console.log('✅ User saved to localStorage:', !!localStorage.getItem('currentUser'));
  }

  logout(): void {
    console.log('👋 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ No token found in localStorage');
    }
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isLoggedIn = !!token;
    console.log('🔍 isLoggedIn check:', isLoggedIn);
    return isLoggedIn;
  }
}
