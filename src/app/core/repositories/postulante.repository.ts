import { Injectable } from '@angular/core';
import { Postulante } from '../models';
import { JsonServerRepository } from '../repositories/json-server.repository';

@Injectable({
  providedIn: 'root'
})
export class PostulanteRepository extends JsonServerRepository<Postulante> {
  constructor() {
    super('postulantes');
  }
}
