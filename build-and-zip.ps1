# ------------------------------
# KiMa GUI Build & ZIP Script (PowerShell Edition - clean)
# ------------------------------

Write-Host "Starte Angular Production-Build..." -ForegroundColor Yellow

# Schritt 1: Build ausführen
ng build --configuration production

# Schritt 2: Pfade definieren
# -> nur noch dist\ki-ma-gui, nicht dist\ki-ma-gui\browser
$distRoot = "dist\ki-ma-gui"
$zipPath  = Join-Path $distRoot "kima-gui.zip"

# Schritt 3: Vorherige ZIP löschen (falls vorhanden)
if (Test-Path $zipPath) {
    Write-Host "Entferne vorheriges ZIP..." -ForegroundColor Yellow
    Remove-Item $zipPath
}

# Schritt 4: ZIP erstellen (alles aus dem dist-Ordner reinpacken)
Write-Host "Erstelle neues ZIP: kima-gui.zip (inkl. web.config & Assets)" -ForegroundColor Yellow
Compress-Archive `
    -Path (Join-Path $distRoot "*") `
    -DestinationPath $zipPath

# Erfolgsmeldung
Write-Host ""
Write-Host "Build & ZIP erfolgreich! Datei liegt unter:" -ForegroundColor Green
Write-Host $zipPath -ForegroundColor Green

# Hinweis zur Azure-Bereitstellung
Write-Host ""
Write-Host "Jetzt kannst du die Datei nach Azure (z.B. via ZIP-Deploy) hochladen." -ForegroundColor Cyan
