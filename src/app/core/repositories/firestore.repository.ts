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
import { normalizeDataForSave } from '../utils/data-normalizer';

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
    const normalizedData = normalizeDataForSave(data);
    const dataWithState = {
      ...normalizedData,
      activo: (normalizedData as any).activo ?? true
    };
    return from(addDoc(ref, dataWithState)).pipe(
      map((docRef) => ({ ...normalizeDataForSave(item), activo: (item as any).activo ?? true, id: docRef.id }))
    );
  }

  update(id: string, item: Partial<T>): Observable<T> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    const { id: _, ...data } = item as any;
    const normalizedData = normalizeDataForSave(data);
    return from(updateDoc(docRef, normalizedData)).pipe(
      map(() => ({ ...normalizeDataForSave(item), id }) as T)
    );
  }

  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(updateDoc(docRef, { activo: false })).pipe(
      map(() => undefined)
    );
  }

  hardDelete(id: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(docRef));
  }

  activate(id: string): Observable<T> {
    return this.update(id, { activo: true } as unknown as Partial<T>);
  }

  protected getQuery(): Observable<T[]> {
    const ref = collection(this.firestore, this.collectionName);
    return runInInjectionContext(this.injector, () =>
      collectionData(ref, { idField: 'id' }) as Observable<T[]>
    );
  }
}
