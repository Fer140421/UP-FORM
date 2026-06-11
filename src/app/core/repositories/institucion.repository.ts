import { Injectable } from '@angular/core';
import { Institucion } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';

@Injectable({
  providedIn: 'root'
})
export class InstitucionRepository extends FirestoreRepository<Institucion> {
  constructor() {
    super('instituciones');
  }
}
