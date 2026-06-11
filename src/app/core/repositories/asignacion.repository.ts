import { Injectable } from '@angular/core';
import { Asignacion } from '../models';
import { JsonServerRepository } from '../repositories/json-server.repository';

@Injectable({
  providedIn: 'root'
})
export class AsignacionRepository extends JsonServerRepository<Asignacion> {
  constructor() {
    super('asignaciones');
  }
}
