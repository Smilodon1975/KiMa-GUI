// src/app/models/project.model.ts
export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;  
  questionsJson?: string;
  
}
