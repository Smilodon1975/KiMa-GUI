import { Component, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'KiMa_Gui';
 
  private auth = inject(AuthService);

  ngOnInit(): void {   
    this.auth.checkToken();
  }

  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Zeige Button erst ab 100px Scrolltiefe
    this.isScrolled = window.pageYOffset > 100;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }  
}



