import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserUpdateModel } from '../models/user-update.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminUrl = 'https://localhost:7090/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/users`);
  }

  updateUserData(userData: UserUpdateModel): Observable<any> {
    return this.http.put(`${this.adminUrl}/update`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/delete/${userId}`);
  }
}
