import { Injectable } from '@angular/core';
import { RequisitoPuesto } from '../models';
import { JsonServerRepository } from '../repositories/json-server.repository';

@Injectable({
  providedIn: 'root'
})
export class RequisitoPuestoRepository extends JsonServerRepository<RequisitoPuesto> {
  constructor() {
    super('requisitosPuesto');
  }
}
