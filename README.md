# KiMa API – Benutzer- & Admin-Verwaltung

**🔹 KiMa ist eine API zur Verwaltung von Probanden & Admins, mit sicherer Authentifizierung und Benutzersteuerung.**  
🌐 **Frontend:** [KiMa GUI](https://github.com/dein-username/kima-gui)  

## 🚀 Features
- **JWT-Authentifizierung** für sichere Logins
- **CRUD-Operationen** für Benutzerverwaltung
- **Passwort-Reset mit E-Mail-Link**
- **Rollenbasiertes Zugriffssystem (User/Admin)**
- **Swagger API-Dokumentation**

## 📂 Technologie-Stack
- **Backend:** .NET Core 7, Entity Framework, MySQL  
- **Sicherheit:** JWT, ASP.NET Identity  
- **Doku & API-Tests:** Swagger  

## 🔧 Installation & Setup
### 🔹 1. API klonen & Umgebung vorbereiten
```sh
git clone https://github.com/dein-username/kima-api.git
cd kima-api

Passe appsettings.json an:
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=KiMaDB;User=root;Password=1234;"
}

Datenbank migrieren & starten
dotnet ef database update
dotnet run

🛠 Endpunkte (Beispiele)
Methode	Endpoint	Beschreibung
POST	/api/auth/login	Benutzer einloggen
POST	/api/auth/register	Neuen Benutzer registrieren
GET	/api/admin/users	Liste aller Benutzer abrufen (Admin)
PUT	/api/admin/update	Benutzer aktualisieren
DELETE	/api/admin/delete/{id}	Benutzer löschen
🚀 Geplante Features
✅ Zwei-Faktor-Authentifizierung
✅ Admin-Dashboard mit Statistiken
✅ Dark Mode für die UI
