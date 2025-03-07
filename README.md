# KiMa GUI – Benutzer- & Admin-Frontend

🔹 **Das Frontend für das KiMa-Projekt** – eine moderne Angular-App zur Verwaltung von Probanden und Administratoren.  
🔗 **API Backend:** [KiMa API](https://github.com/dein-username/kima-api)

## 🚀 Features
- **Login & Registrierung mit JWT**
- **Admin-Bereich mit Benutzerverwaltung**
- **Passwort-Reset via E-Mail**
- **Responsive UI mit Bootstrap**
- **Paginierung & Filter für Benutzer**

## 📂 Technologie-Stack
- **Frontend:** Angular 16, TypeScript, Bootstrap  
- **HTTP & Auth:** Angular Services, Interceptors  
- **State-Management:** RxJS  

## 🔧 Installation & Setup
### 🔹 1. Projekt klonen & Abhängigkeiten installieren
```sh
git clone https://github.com/dein-username/kima-gui.git
cd kima-gui
npm install
🔹 2. Umgebungsvariablen setzen (environment.ts)
Passe die API-URL an:

ts
Kopieren
Bearbeiten
export const environment = {
  production: false,
  apiUrl: "https://localhost:7090/api"
};
🔹 3. Anwendung starten
sh
Kopieren
Bearbeiten
ng serve
🔗 Frontend läuft auf: http://localhost:4200

📡 API-Anbindung
Das Frontend kommuniziert mit der KiMa API über HTTP-Requests.

📜 Geplante Features
✅ Dark Mode
✅ Dashboard mit Statistiken
✅ Push-Benachrichtigungen
