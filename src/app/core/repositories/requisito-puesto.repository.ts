import { Injectable } from '@angular/core';
import { RequisitoPuesto } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';

@Injectable({
  providedIn: 'root'
})
export class RequisitoPuestoRepository extends FirestoreRepository<RequisitoPuesto> {
  constructor() {
    super('requisitosPuesto');
  }
}
