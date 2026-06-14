import { Injectable } from '@angular/core';
import { User } from '../models';
import { FirestoreRepository } from '../repositories/firestore.repository';

@Injectable({
  providedIn: 'root'
})
export class UserRepository extends FirestoreRepository<User> {
  constructor() {
    super('users');
  }
}
