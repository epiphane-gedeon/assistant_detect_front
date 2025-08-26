import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FAQ {
  id: number;
  question: string;
  procede: string;
}

export interface Pagination {
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Links {
  self: string;
  next: string | null;
  prev: string | null;
  first: string;
  last: string;
}

export interface PaginatedFaqResponse {
  items: FAQ[];
  pagination: Pagination;
  links: Links;
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = 'http://127.0.0.1:8000/faq';

  constructor(private http: HttpClient) { }

  getFaqs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.apiUrl);
  }

  getPaginatedFaqs(page: number = 1, size: number = 10): Observable<PaginatedFaqResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedFaqResponse>(`${this.apiUrl}/paginated`, { params });
  }
}
