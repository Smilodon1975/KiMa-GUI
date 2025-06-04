export interface QuestionOption {
  value: string;   // eindeutiger Schlüssel
  label: string;   // Anzeige-Text
  exclude?: boolean; // Ausschlusskriterium
}

export type QuestionType = 'radio' | 'checkbox' | 'text' | 'date' | 'checkboxGrid' | 'textarea' | 'select';

export interface QuestionDef {
  id: number;              // interne ID (wird eindeutig pro Frage generiert)
  type: QuestionType;
  text: string;            // der Fragentext
  options?: QuestionOption[]; // nur gesetzt, wenn type radio/checkbox/checkboxGrid
}