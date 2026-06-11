import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, catchError, map } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://localhost:3000/users';

  // Signals for state management
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => !!this.currentUserSignal());

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.baseUrl}?username=${username}&password=${password}`).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          this.setCurrentUser(user);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    localStorage.removeItem('up_form_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('up_form_user', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('up_form_user');
    return user ? JSON.parse(user) : null;
  }
}
