import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [CommonModule,FormsModule]
})
export class AdminComponent implements OnInit {
  user: any[] = []; // Speichert die geladenen Probanden
  filteredUser: any[] = []; // Speichert die gefilterten Probanden
  searchText: string = ''; // Suchtext
  currentPage: number = 1; // Aktuelle Seite
  itemsPerPage: number = 10; // Anzahl pro Seite
  totalPages: number[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // 🔹 Probanden von der API laden
  loadUsers(): void {
    this.adminService.getAllUsers().subscribe(data => {
      this.user = data;
      this.filterUsers(); // Suche & Paginierung anwenden
    });
  }

  // 🔹 Such- & Paginierungslogik
  filterUsers(): void {
    let filtered = this.user;

    if (this.searchText) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.filteredUser = filtered.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  // 🔹 Seite ändern
  changePage(page: number): void {
    this.currentPage = page;
    this.filterUsers();
  }
}
