

import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CampaignService {
   private readonly apiUrl = `${environment.apiUrl}/campaign`;

  constructor(private http: HttpClient) {}
  
  sendCampaign(
    campaignName: string,
    file: File,
    recipients: string[]
  ) {
    const form = new FormData();
    form.append('campaignName', campaignName);
    form.append('attachment', file, file.name);
    recipients.forEach(email => form.append('recipients', email));    
    return this.http.post(`${this.apiUrl}/send`, form);
  }
}