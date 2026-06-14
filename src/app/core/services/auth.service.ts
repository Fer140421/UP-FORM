import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  UserCredential,
  User
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private initializedSignal = signal(false);

  currentUser = this.currentUserSignal.asReadonly();
  initialized = this.initializedSignal.asReadonly();

  isAuthenticated = computed(() => !!this.currentUserSignal());

  authState$ = authState(this.auth);

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    this.authState$.subscribe(user => {
      this.currentUserSignal.set(user);
      this.initializedSignal.set(true);
    });
  }
  login(email: string, password: string): Observable<boolean> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      map((cred: UserCredential) => {
        this.currentUserSignal.set(cred.user);
        return true;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
      })
    );
  }

  register(email: string, password: string): Observable<boolean> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      map((cred: UserCredential) => {
        this.currentUserSignal.set(cred.user);
        return true;
      }),
      catchError(error => {
        console.error('Register error:', error);
        return of(false);
      })
    );
  }

  logout(): void {
    signOut(this.auth).then(() => {
      this.currentUserSignal.set(null);
      this.router.navigate(['/auth/login']);
    });
  }
}