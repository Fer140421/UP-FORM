import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Postulante } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';
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
    const q = query(funcionesRef);
    return runInInjectionContext(this.injector, () => 
      collectionData(q).pipe(
        map((actions: any[]) => actions.map(a => a.nombre || a))
      )
    );
  }
}
