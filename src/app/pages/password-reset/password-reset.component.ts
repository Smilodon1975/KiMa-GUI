import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
  passwordResetData = { email: '', token: '', newPassword: '', userName: '' };
  successMessage = '';
  alertType: 'success' | 'danger' = 'success';
  confirmNewPassword: string = '';
  passwordMismatch: boolean = false;
  loading = false;

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
      this.passwordResetData.userName = params['userName'] || ''; 
    });
  }

  // ✅ Sendet das neue Passwort an den AuthService und verarbeitet die Antwort
  resetPassword() {
    this.loading = true;
    if (this.passwordResetData.newPassword !== this.confirmNewPassword) {
      this.passwordMismatch = true;
      return;
    }
  
  this.passwordMismatch = false;
  
  this.authService.resetPassword({ email: this.passwordResetData.email, token: this.passwordResetData.token,
     newPassword: this.passwordResetData.newPassword}).subscribe({
        next: () => {
          this.successMessage = 'Passwort erfolgreich geändert!';
          this.alertType = 'success';
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/login']);
          }, 4000);
        },
        error: () => {
          this.successMessage = 'Fehler beim Zurücksetzen des Passworts!';
          this.alertType = 'danger';
          setTimeout(() => {
            this.successMessage = '';
            this.loading = false;
          }, 6000);
        }
      });
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
