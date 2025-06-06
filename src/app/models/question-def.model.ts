

export interface QuestionOption {
  value: string;   // eindeutiger Schlüssel
  label: string;   // Anzeige-Text
  exclude?: boolean; // Ausschlusskriterium
}

export interface QuestionRow {
  label: string;
  value: string;
  exclude?: boolean;
}

export type QuestionType = 'radio' | 'checkbox' | 'text' | 'date' | 'checkboxGrid' | 'textarea' | 'select';

export interface QuestionDef {
  id: number; 
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  rows?: QuestionRow[];
}