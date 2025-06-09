

export enum ProjectStatus {
  Draft = 'Draft',
  Finished = 'Finished',
  Published = 'Published'
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;  
  questionsJson?: string;
  status: ProjectStatus;
}
