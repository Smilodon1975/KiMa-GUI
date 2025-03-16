import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule, CommonModule]
})
export class RegisterComponent { 
  registerData = {
    email: '',
    password: '',
    userName: ''
    
  };  
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  // ✅ Registriert einen neuen Benutzer und leitet nach Erfolg zum Login weiter
  onRegister() {
    if (this.registerData.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
  
    this.passwordMismatch = false; // Zurücksetzen, falls erfolgreich
  
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.router.navigate(['/welcome']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Fehler bei der Registrierung.';
      }
    });
  }
}  
