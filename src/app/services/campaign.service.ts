import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CampaignUser } from '../models/user.model';
import { PaginatedResult } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
   private readonly apiUrl = `${environment.apiUrl}/campaign`;

  constructor(private http: HttpClient) {}
  

  getCampaignUsers(page: number, pageSize: number) {
  return this.http.get<PaginatedResult<CampaignUser>>(
   `${this.apiUrl}/campaignUsers?page=${page}&pageSize=${pageSize}`
  );
}

  
  sendCampaign(
  campaignName: string,
  recipients: string[],
  attachment?: File,
  subject?: string,
  body?: string,
  link?: string
) {
  const form = new FormData();
  form.append('campaignName', campaignName);
  recipients.forEach(email => form.append('recipients', email));
    if (subject) form.append('subject', subject);
    if (body)    form.append('body',    body);
    if (link)    form.append('link',    link);
      recipients.forEach(r => form.append('recipients', r));
    if (attachment) form.append('attachment', attachment, attachment.name);

  return this.http.post(`${this.apiUrl}/send`, form);
}
}