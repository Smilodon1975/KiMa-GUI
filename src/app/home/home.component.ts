import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  successMessage: string = '';
  fadeOut: boolean = false;

  constructor(private route: ActivatedRoute, ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['logout'] === 'true') {
        this.successMessage = 'Du hast dich erfolgreich abgemeldet';
        // Nach 2 Sekunden mit dem Verblassen beginnen
        setTimeout(() => {
          this.fadeOut = true;
        }, 2000);
        // Nach 3 Sekunden die Meldung komplett entfernen
        setTimeout(() => {
          this.successMessage = '';
          this.fadeOut = false;
        }, 3000);
      }
    });
  }
}
