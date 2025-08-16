import { Component, OnInit, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './main/header/header.component';
import { FooterComponent } from './main/footer/footer.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import $ from 'jquery';
import 'bootstrap';


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

  isScrolled = false;

  ngOnInit(): void {   
    this.auth.checkToken();
    $(document).on('shown.bs.modal', (e: any) => {
      console.log('Modal shown:', e.target);
      const dialog = $(e.target).find('.modal-dialog');
      try {
      dialog.draggable('destroy');
      dialog.resizable('destroy');
    } catch {}
      dialog
        // ziehbar nur am Header, im Viewport bleiben
        .draggable({
          handle: '.modal-header',
          containment: 'window'
        })
        // an allen Seiten/Ecken skalierbar
        .resizable({
          minHeight: 200,
          minWidth: 300
        });
    });
  }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Zeige Button erst ab 100px Scrolltiefe
    this.isScrolled = window.pageYOffset > 100;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }     

}



