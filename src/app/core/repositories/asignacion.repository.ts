import { Injectable } from '@angular/core';
import { Asignacion } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';

@Injectable({
  providedIn: 'root'
})
export class AsignacionRepository extends FirestoreRepository<Asignacion> {
  constructor() {
    super('asignaciones');
  }
}
