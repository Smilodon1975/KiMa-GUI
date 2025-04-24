# ------------------------------
# KiMa GUI Build & ZIP Script (PowerShell Edition - clean)
# ------------------------------

Write-Host "Starte Angular Production-Build..." -ForegroundColor Yellow

# Schritt 1: Build ausführen
ng build --configuration production

# Schritt 2: Pfade definieren
$buildPath = "dist\ki-ma-gui\browser"
$zipPath = "dist\ki-ma-gui\kima-gui.zip"

# Schritt 3: Vorherige ZIP löschen (falls vorhanden)
if (Test-Path $zipPath) {
    Write-Host "Entferne vorheriges ZIP..." -ForegroundColor Yellow
    Remove-Item $zipPath
}

# Schritt 4: ZIP erstellen
Write-Host "Erstelle neues ZIP: kima-gui.zip" -ForegroundColor Yellow
Compress-Archive -Path "$buildPath\*" -DestinationPath $zipPath

# Erfolgsmeldung
Write-Host ""
Write-Host "Build & ZIP erfolgreich! Datei liegt unter:" -ForegroundColor Green
Write-Host "$zipPath" -ForegroundColor Green

# Hinweis zur Azure-Bereitstellung
Write-Host ""
Write-Host "Jetzt kannst du die Datei nach Azure hochladen: /home/ingo/kima-gui.zip" -ForegroundColor Cyan
