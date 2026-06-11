import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.currentUser();

  if (req.url.includes('cloudinary.com')) {
    return next(req);
  }

  if (user?.rol) {
    const cloned = req.clone({
      setHeaders: {
        'X-User-Role': user.rol
      }
    });

    return next(cloned);
  }

  return next(req);
};