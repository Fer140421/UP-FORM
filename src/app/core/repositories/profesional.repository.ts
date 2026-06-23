import { Injectable } from '@angular/core';
import { Profesional } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalRepository extends FirestoreRepository<Profesional> {
  constructor() {
    super('professionals');
  }
}
