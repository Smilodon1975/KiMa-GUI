import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PasswordResetComponent {
  passwordResetData = { email: '', token: '', newPassword: '' };
  successMessage = '';
  confirmNewPassword: string = '';
  passwordMismatch: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // ✅ Liest E-Mail und Token aus der URL und setzt sie in das Passwort-Reset-Formular
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.passwordResetData.email = params['email'] || '';
      this.passwordResetData.token = params['token'] || '';
    });
  }

  // ✅ Sendet das neue Passwort an den AuthService und verarbeitet die Antwort
  resetPassword() {
    if (this.passwordResetData.newPassword !== this.confirmNewPassword) {
      this.passwordMismatch = true;
      return;
    }
  
    this.passwordMismatch = false; // Zurücksetzen, falls erfolgreich
  
    this.authService.resetPassword(this.passwordResetData).subscribe({
      next: () => {
        this.successMessage = 'Passwort erfolgreich geändert!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.successMessage = 'Fehler beim Zurücksetzen des Passworts!';
      }
    });
  }
}
