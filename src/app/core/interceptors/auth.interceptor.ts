import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.currentUser();

  // In a real app, we would add the Authorization header here
  // For JSON Server, we just pass the request through or simulate token headers
  if (user) {
    const cloned = req.clone({
      setHeaders: {
        'X-User-Role': user.role
      }
    });
    return next(cloned);
  }

  return next(req);
};
