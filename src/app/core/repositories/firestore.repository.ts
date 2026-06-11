import { inject } from '@angular/core';
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
  DocumentReference,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseRepository } from './base.repository';

export class FirestoreRepository<T extends { id?: string }> implements BaseRepository<T> {
  protected firestore = inject(Firestore);
  protected collectionRef: CollectionReference;

  constructor(protected collectionName: string) {
    this.collectionRef = collection(this.firestore, collectionName);
  }

  getAll(): Observable<T[]> {
    return collectionData(this.collectionRef, { idField: 'id' }) as Observable<T[]>;
  }

  getById(id: string): Observable<T> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<T>;
  }

  create(item: T): Observable<T> {
    // Remove id if it exists, Firestore will generate one
    const { id, ...data } = item;
    return from(addDoc(this.collectionRef, data)).pipe(
      map((docRef: DocumentReference) => ({ ...item, id: docRef.id }))
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

  // Helper for custom collections or nested queries if needed
  protected getQuery(queryFn: (ref: CollectionReference) => any): Observable<T[]> {
    const q = queryFn(this.collectionRef);
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }
}
