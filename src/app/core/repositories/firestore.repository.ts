import { inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseRepository } from './base.repository';

export class FirestoreRepository<T extends { id?: string }> implements BaseRepository<T> {
  protected firestore: Firestore;
  protected injector: Injector;

  constructor(protected collectionName: string) {
    // inject() en el constructor SÍ está dentro del contexto de inyección
    this.firestore = inject(Firestore);
    this.injector = inject(Injector);
  }

  getAll(): Observable<T[]> {
    const ref = collection(this.firestore, this.collectionName);
    return runInInjectionContext(this.injector, () =>
      collectionData(ref, { idField: 'id' }) as Observable<T[]>
    );
  }

  getByProperty(field: string, value: any): Observable<T[]> {
    const ref = collection(this.firestore, this.collectionName);
    const q = query(ref, where(field, '==', value));
    return runInInjectionContext(this.injector, () =>
      collectionData(q, { idField: 'id' }) as Observable<T[]>
    );
  }

  getById(id: string): Observable<T> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return runInInjectionContext(this.injector, () =>
      docData(docRef, { idField: 'id' }) as Observable<T>
    );
  }

  create(item: T): Observable<T> {
    const { id, ...data } = item;
    const ref = collection(this.firestore, this.collectionName);
    return from(addDoc(ref, data)).pipe(
      map((docRef) => ({ ...item, id: docRef.id }))
    );
  }

  update(id: string, item: Partial<T>): Observable<T> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const { id: _, ...data } = item as any;
    return from(updateDoc(docRef, data)).pipe(
      map(() => ({ ...item, id }) as T)
    );
  }

  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(docRef));
  }

  protected getQuery(): Observable<T[]> {
    const ref = collection(this.firestore, this.collectionName);
    return runInInjectionContext(this.injector, () =>
      collectionData(ref, { idField: 'id' }) as Observable<T[]>
    );
  }
}