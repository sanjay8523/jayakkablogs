import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔐 Interceptor - Token:', token ? 'EXISTS' : 'MISSING');
  console.log('📍 Interceptor - URL:', req.url);

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Interceptor - Added Authorization header');
    return next(clonedRequest);
  }

  console.log('⚠️ Interceptor - No token, proceeding without auth');
  return next(req);
};
