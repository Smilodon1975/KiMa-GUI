// admin-rapidmail.component.ts
import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../services/campaign.service';
import { PaginatedResult } from '../models/user.model';
import { User } from '../models/user.model';
import { CampaignUser } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-campaign',
  templateUrl: './admin-campaign.component.html',
  styleUrls: ['./admin-campaign.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, RouterModule]

})
export class AdminCampaignComponent implements OnInit {
  users: CampaignUser[] = []; 
  recipients: string[] = [];
  campaignName = '';
  file?: File;
  message?: string;
  user: User[] = [];
  selected = new Set<string>();
  allSelected = false;
  page = 1;
  pageSize = 10;
  totalCount = 0;

  constructor(private campaignSvc: CampaignService, private router: Router) {}

   ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.campaignSvc.getCampaignUsers(this.page, this.pageSize)
      .subscribe((res: PaginatedResult<CampaignUser>) => {
        this.users = res.items;
        this.totalCount = res.totalCount;
        this.selected.clear();
        this.allSelected = false;
      });
  }

  toggleAll(): void {
    if (this.allSelected) {
      this.users.forEach(u => this.selected.add(u.email));
    } else {
      this.selected.clear();
    }
  }

  toggleOne(email: string): void {
    if (this.selected.has(email)) {
      this.selected.delete(email);
    } else {
      this.selected.add(email);
    }
    this.allSelected = this.users.every(u => this.selected.has(u.email));
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadPage();
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files ? input.files[0] : undefined;
  }

  onSend(fm: NgForm): void {
    if (!fm.valid || !this.file || this.selected.size === 0) 
      return;
    
    this.campaignSvc.sendCampaign(
      this.campaignName,      
      this.file!,
      Array.from(this.selected)
    ).subscribe(() => {
      this.message = `Newsletter an ${this.selected.size} Empfänger verschickt.`;
      fm.resetForm();
      this.file = undefined;
      this.loadPage();
    }, err => {
      this.message = 'Fehler beim Versand.';
    });
  }
}
