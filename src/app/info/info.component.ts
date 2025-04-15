import { Component, OnInit } from '@angular/core';
import { FAQ, FAQService } from '../services/faq.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-info',  
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
})
export class InfoComponent implements OnInit {
  faqs: FAQ[] = [];

  constructor(private faqService: FAQService) {}

  ngOnInit(): void {
    this.faqService.getFAQs().subscribe({
      next: (data) => this.faqs = data,
      error: (err) => console.error("Fehler beim Laden der FAQs:", err)
    });
  }
}

