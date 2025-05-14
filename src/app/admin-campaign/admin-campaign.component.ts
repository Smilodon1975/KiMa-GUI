// admin-rapidmail.component.ts
import { Component, OnInit } from '@angular/core';
import { CampaignService } from '../services/campaign.service';
import { UserService } from '../services/user.service';
import { AdminService } from '../services/admin.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-campaign',
  templateUrl: './admin-campaign.component.html',
  styleUrls: ['./admin-campaign.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule]

})
export class AdminCampaignComponent implements OnInit {
  users: Array<{ email: string }> = [];
  recipients: string[] = [];
  campaignName = '';
  file?: File;
  message?: string;

  constructor(
    private campaign: CampaignService, private userSvc: UserService, private adminSvc: AdminService) {}

  ngOnInit() {
    // Alle User-Emails laden
    this.adminSvc.getAllUsers().subscribe(list => {
      this.users = list.map(u => ({ email: u.email }));
    });
  }

  onFile(evt: any) {
     const input = evt.target as HTMLInputElement;
    if (input.files?.length)
    this.file = evt.target.files[0];
  }

  onSend() {
    if (!this.file) return;
    this.campaign.sendCampaign(this.campaignName, this.file, this.recipients)
      .subscribe({
        next: () => this.message = 'Kampagne erfolgreich versendet!',
        error: err => this.message = 'Fehler: ' + err.message
      });
  }
}
