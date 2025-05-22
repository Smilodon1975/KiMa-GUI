import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult, User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { UserUpdateModel } from '../models/user-update.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Der Basis-Pfad zu deinem Admin-Controller
  private adminUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  /** Alle User (unpaginiert) */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminUrl}/users`);
  }

  /** User paginiert holen */
  getUsers(page: number, pageSize: number): Observable<PaginatedResult<User>> {
    return this.http.get<PaginatedResult<User>>(
      `${this.adminUrl}/users?page=${page}&pageSize=${pageSize}`
    );
  }

  /** Rolle eines Users setzen (z.B. "Admin" oder "Proband") */
  setUserRole(userId: number, role: string): Observable<any> {
    const url = `${this.adminUrl}/set-role/${userId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Da dein Controller [FromBody] string newRole erwartet, senden wir rohes JSON-String
    return this.http.put(url, JSON.stringify(role), { headers });
  }

  /** User-Daten updaten */
 updateUserData(updateDto: UserUpdateModel): Observable<any> {
  return this.http.put(
    `${this.adminUrl}/update`,
    updateDto,
    { headers: { 'Content-Type': 'application/json' }}
  );
}


  /** User löschen */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/delete/${userId}`);
  }
}
