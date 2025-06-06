import { Component, OnInit } from '@angular/core';
import { FAQ, FAQService } from '../../services/faq.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';



@Component({
  selector: 'app-info',  
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, RouterModule],
  animations: [
    trigger('slideToggle', [
      state('open', style({
        height: '*',
        opacity: 1,
        paddingTop: '8px',
        paddingBottom: '8px'
      })),
      state('closed', style({
        height: '0px',
        opacity: 0,
        paddingTop: '0px',
        paddingBottom: '0px',
        overflow: 'hidden'
      })),
      transition('open <=> closed', [animate('300ms ease-in-out')])
    ])
  ],  
})
export class InfoComponent implements OnInit {
  isLoggedIn = false;
  faqs: FAQ[] = [];
  openedIndex: number | null = null;

  constructor(private faqService: FAQService) {}

  ngOnInit(): void {
    this.faqService.getFAQs().subscribe({
      next: (data) => this.faqs = data,
      error: (err) => console.error("Fehler beim Laden der FAQs:", err)
    });
  }

  toggleFAQ(index: number): void {
    this.openedIndex = this.openedIndex === index ? null : index;
  }

}

