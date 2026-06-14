import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  private readonly cloudName = environment.cloudinary.cloudName;
  private readonly uploadPreset = environment.cloudinary.uploadPreset;
  private readonly url = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(this.url, formData).pipe(
      map(response => response.secure_url),
      catchError(error => {
        console.error('Cloudinary upload error:', error);
        throw error;
      })
    );
  }

  /**
   * Uploads multiple files and returns an array of URLs
   */
  uploadFiles(files: File[]): Observable<string[]> {
    if (!files || files.length === 0) return of([]);
    return forkJoin(files.map(file => this.uploadFile(file)));
  }

  /**
   * Helper to determine if a file is an image or PDF
   */
  isValidFileType(file: File): boolean {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedPdfType = 'application/pdf';
    return allowedImageTypes.includes(file.type) || file.type === allowedPdfType;
  }
}
