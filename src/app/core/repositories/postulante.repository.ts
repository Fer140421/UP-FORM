import { Injectable, inject } from '@angular/core';
import { Postulante } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostulanteRepository extends FirestoreRepository<Postulante> {
  constructor() {
    super('postulantes');
  }

  getFunciones(): Observable<string[]> {
    const funcionesRef = collection(this.firestore, 'funciones');
    return collectionData(funcionesRef).pipe(
      map((actions: any[]) => actions.map(a => a.nombre || a))
    );
  }
}
