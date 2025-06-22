import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../../services/campaign.service';
import { PaginatedResult, CampaignUser } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-campaign',
  templateUrl: './admin-campaign.component.html',
  styleUrls: ['./admin-campaign.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AdminCampaignComponent implements OnInit {
  users: CampaignUser[] = []; 
  campaignUsers: CampaignUser[] = [];
  filteredUsers: CampaignUser[] = [];
  selected = new Set<string>();
  allSelected = false;
  page = 1;
  pageSize = 10000;
  totalCount = 0;
  totalPages: number[] = [];         // ← neu
  filterOption: 'all' | 'subscribed' | 'unsubscribed' = 'all';
  campaignName = '';
  attachment?: File;
  message?: string;
  searchText: string = '';
  emailSubject = '';
  emailBody = '';
  emailLink = '';

  sending = false;
  showMessage = true;

  constructor(private campaignSvc: CampaignService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

   private loadUsers(): void {
    this.campaignSvc.getCampaignUsers(1, 9999 /*oder beliebig groß*/).subscribe(res => {
      this.campaignUsers = res.items;
      // Zu Beginn keine Filter => alles anzeigen
      this.filteredUsers = [...this.campaignUsers];
    });
  }
  

  filterRecipients(): void {
    this.selected.clear();
    this.allSelected = false;

    const text = this.searchText.trim().toLowerCase();

    this.filteredUsers = this.campaignUsers.filter(u => {
      // 1) Text suchen (Email oder Username)
      const matchesText =
        !text ||
        u.email.toLowerCase().includes(text) ||
        (u.userName?.toLowerCase().includes(text) ?? false);

      // 2) Abo-Filter
      let matchesAbo = true;
      if (this.filterOption === 'subscribed') {
        matchesAbo = u.newsletterSub;
      } else if (this.filterOption === 'unsubscribed') {
        matchesAbo = !u.newsletterSub;
      }

      return matchesText && matchesAbo;
    });
  }


  toggleAll(): void {
    if (this.allSelected) {
      this.filteredUsers.forEach(u => this.selected.add(u.email));
    } else {
      this.selected.clear();
    }
  }

  toggleOne(email: string): void {
    this.selected.has(email)
      ? this.selected.delete(email)
      : this.selected.add(email);
    this.allSelected = this.filteredUsers.every(u => this.selected.has(u.email));
  }

  onPageChange(newPage: number): void {
    if (newPage === this.page) return;
    this.page = newPage;
    this.loadUsers();
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachment = input.files?.[0];
  }

  onSend(fm: NgForm): void {
  if (!fm.valid || this.selected.size === 0) return;
  this.sending = true;
  this.campaignSvc.sendCampaign(
    this.campaignName,
    Array.from(this.selected),
    this.attachment,
    this.emailSubject,
    this.emailBody,
    this.emailLink
  ).subscribe({
    next: () => {
      this.message = `Newsletter an ${this.selected.size} Empfänger verschickt.`;
      this.showMessage = true;
      fm.resetForm();
      this.attachment = undefined;
      this.loadUsers();
      this.sending = false;
      // Erfolgsmeldung langsam ausfaden
      setTimeout(() => this.showMessage = false, 3000); // nach 3s ausfaden
      setTimeout(() => this.message = '', 4000);        // nach 4s entfernen
    },
    error: () => {
      this.message = 'Fehler beim Versand.';
      this.showMessage = true;
      this.sending = false;
      setTimeout(() => this.showMessage = false, 3000);
      setTimeout(() => this.message = '', 4000);
    }
  });
}    

}
