import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class UserComponent implements OnInit {
  userData: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getUserData().subscribe({
      next: (data) => {
        this.userData = data;
      },
      error: (err) => {
        console.error("Fehler beim Laden der Benutzerdaten:", err);
      }
    });
  }
}
