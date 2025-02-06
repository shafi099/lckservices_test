// employees.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeesSEndpoint {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) {}

  // Fetch employees data
  getEmployees(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl);
  }


  saveEmployee(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
}
