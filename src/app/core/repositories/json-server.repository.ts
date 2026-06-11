import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseRepository } from './base.repository';

export class JsonServerRepository<T extends { id?: string }> implements BaseRepository<T> {
  protected http = inject(HttpClient);
  protected baseUrl = 'http://localhost:3000';

  constructor(protected collection: string) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.collection}`);
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.collection}/${id}`);
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.collection}`, item);
  }

  update(id: string, item: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${this.collection}/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.collection}/${id}`);
  }

  getCustom(collection: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${collection}`);
  }
}
