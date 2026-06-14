import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('cloudinary.com')) {
    return next(req);
  }

  return next(req);
};