import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.initialized).pipe(
    filter(initialized => initialized),
    take(1),
    map(() => {
      return authService.isAuthenticated()
        ? true
        : router.createUrlTree(['/auth/login']);
    })
  );
};