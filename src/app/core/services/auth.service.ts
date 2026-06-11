import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs,
  limit 
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signals for state management
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => !!this.currentUserSignal());

  login(username: string, password: string): Observable<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(
      usersRef, 
      where('username', '==', username), 
      where('password', '==', password),
      limit(1)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const user = { id: doc.id, ...doc.data() } as User;
          this.setCurrentUser(user);
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Auth error:', error);
        return of(false);
      })
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
