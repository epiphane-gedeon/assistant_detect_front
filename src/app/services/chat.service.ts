// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ChatService {

//   constructor() { }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8000/ask'; // à adapter à ton backend

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<Record<string, any>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = { question: message };
    console.log('Sending request:', body);

    const request = this.http.post<Record<string, any>>(this.apiUrl, body, { headers })
    console.log('Request sent:', request);
    return request;
  }
}
