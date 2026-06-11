import { Injectable } from '@angular/core';
import { Institucion } from '../models';
import { JsonServerRepository } from '../repositories/json-server.repository';

@Injectable({
  providedIn: 'root'
})
export class InstitucionRepository extends JsonServerRepository<Institucion> {
  constructor() {
    super('instituciones');
  }
}
