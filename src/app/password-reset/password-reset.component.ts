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

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.passwordResetData.email = params['email'] || '';
      this.passwordResetData.token = params['token'] || '';
    });
  }

  resetPassword() {
    this.authService.resetPassword(this.passwordResetData).subscribe({
      next: () => {
        this.successMessage = 'Passwort erfolgreich zurückgesetzt!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.successMessage = 'Fehler beim Zurücksetzen des Passworts!';
      }
    });
  }
}

