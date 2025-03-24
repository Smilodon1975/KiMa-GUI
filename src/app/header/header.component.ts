import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
  export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userRole: string | null = null;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.authStatusChanged.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.authService.getUserRole().subscribe(role => {
      this.userRole = role;
    });
  }
  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home'], { queryParams: { logout: 'true' } }); 
  }
}
