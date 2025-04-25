import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';



@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterComponent implements OnInit {
  registerData: { email: string; password: string; userName?: string; birthDate?: string } = {
    email: '',
    password: '',
    userName: '',
    birthDate: ''
  }; 

  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  maxDate: string = '';

  constructor(private authService: AuthService, private router: Router) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear() - 16;
    this.maxDate = `${year}-${month}-${day}`;
  }
  ngOnInit(): void {
    // Reset messages and initialize any required data
    this.successMessage = null;
    this.errorMessage = null;
  }

/** Prüft, ob das eingegebene Datum mindestens 16 Jahre zurückliegt */
isAgeValid(): boolean {
  if (!this.registerData.birthDate) return false;
  const birth = new Date(this.registerData.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 16;
}

  // ✅ Registriert einen neuen Benutzer und leitet nach Erfolg zum Login weiter
  onRegister() {
    if (!this.isAgeValid()) {
      this.errorMessage = 'Du musst mindestens 16 Jahre alt sein!';
      return;
    }
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = "Die Passwörter stimmen nicht überein!";
      return;
    }
  
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.successMessage = "Registrierung erfolgreich 💚! Du wirst nun weitergeleitet";
        setTimeout(() => this.router.navigate(['/welcome']), 3000);
      },
      error: (error) => {
        this.errorMessage = error;
      }
    });
  }
  

  validatePassword(): boolean {
    const password = this.registerData.password;
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);
  }
  
  getPasswordStrength(password: string): string {
    if (!password || password.length < 8) return "❌ Ungültig (mind. 8 Zeichen)";
  
    let strengthPoints = 0;
    if (password.match(/[A-Z]/)) strengthPoints++; // Großbuchstaben
    if (password.match(/[a-z]/)) strengthPoints++; // Kleinbuchstaben
    if (password.match(/[0-9]/)) strengthPoints++; // Zahl
    if (password.match(/[\W_]/)) strengthPoints++; // Sonderzeichen
  
    switch (strengthPoints) {
      case 0:
      case 1:
        return "⚠️ Schwach";
      case 2:
        return "🟡 Mittel";
      case 3:
        return "🟢 Stark";
      case 4:
        return "🟢💪 Sehr stark!";
      default:
        return "❌ Ungültig";
    }
  }
  

}  
