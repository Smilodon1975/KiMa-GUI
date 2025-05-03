export interface Feedback {
    id?: number;
    userId?: number;
    email?: string;
    content: string;
    createdAt?: string;
  }
  export interface FeedbackDto {
    userId?: number;
    email?: string;
    content: string;
  }
  