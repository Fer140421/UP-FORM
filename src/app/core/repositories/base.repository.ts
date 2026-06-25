import { Observable } from 'rxjs';

export interface BaseRepository<T> {
  getAll(): Observable<T[]>;
  getById(id: string): Observable<T>;
  create(item: T): Observable<T>;
  update(id: string, item: Partial<T>): Observable<T>;
  delete(id: string): Observable<void>;
  activate(id: string): Observable<T>;
}
