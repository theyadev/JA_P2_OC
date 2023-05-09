import type Olympic from '../models/Olympic';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[]>([]);

  constructor(private http: HttpClient, private router: Router) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError(this._handleError)
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }

  private _handleError<T>(error: any, caught: T): T {
    this.olympics$.unsubscribe();
    this.router.navigate(['not-found']);

    return caught;
  }
}
