import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  // Bevorzugte Länder
  private popularCountries: string[] = [
    "Deutschland",
    "Schweiz",
    "Österreich"
  ];

  // Volle Länderliste (ohne die beliebten Länder, falls diese nicht doppelt angezeigt werden sollen)
  private allCountries: string[] = [
    "Afghanistan",
    "Albanien",
    "Algerien",
    "Andorra",
    "Angola",
    "Antigua und Barbuda",
    "Argentinien",
    "Armenien",
    "Aserbaidschan",
    "Äthiopien",
    "Australien",
    "Bahamas",
    "Bahrain",
    "Bangladesch",
    "Barbados",
    "Belarus",
    "Belgien",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivien",
    "Bosnien und Herzegowina",
    "Botswana",
    "Brasilien",
    "Brunei",
    "Bulgarien",
    "Burkina Faso",
    "Burundi",
    "Chile",
    "China",
    "Cookinseln",
    "Costa Rica",
    "Dänemark",
    // Weitere Länder hinzufügen ...
    "Niederlande",
    "Niger",
    "Nigeria",
    "Nordmazedonien",
    "Norwegen",
    "Oman",
    "Pakistan",
    "Panama",
    "Paraguay",
    "Peru",
    "Philippinen",
    "Polen",
    "Portugal",
    "Rumänien",
    "Russland",
    "Ruanda",
    "Saudi-Arabien",
    "Schweden",
    "Senegal",
    "Serbien",
    "Singapur",
    "Slowakei",
    "Slowenien",
    "Spanien",
    "Sri Lanka",
    "Sudan",
    "Südkorea",
    "Südsudan",
    "Syrien",
    "Tadschikistan",
    "Tansania",
    "Thailand",
    "Togo",
    "Trinidad und Tobago",
    "Tschechien",
    "Tunesien",
    "Türkei",
    "Uganda",
    "Ukraine",
    "Ungarn",
    "Uruguay",
    "Usbekistan",
    "Venezuela",
    "Vietnam",
    "Zentralafrikanische Republik",
    "Zypern",
    "Zimbabwe"
  ];

  constructor() { }

  // Liefert die Liste der bevorzugten Länder
  getPopularCountries(): string[] {
    return this.popularCountries;
  }

  // Liefert die vollständige Liste aller Länder
  getAllCountries(): string[] {
    return this.allCountries;
  }
}
