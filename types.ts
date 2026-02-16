
export interface LinkedInPost {
  week: number;
  day: string;
  title: string;
  content: string;
  graphicIdea: string;
  businessGoal: string;
  postType: string;
  graphicFormat: string;
  aiPrompt: string;
  category: string;
}

export interface ContentPlan {
  topic: string;
  targetAudience: string;
  posts: LinkedInPost[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  SUGGESTIONS_LOADING = 'SUGGESTIONS_LOADING'
}

export enum AppTab {
  GENERATOR = 'GENERATOR',
  SUGGESTIONS = 'SUGGESTIONS'
}

export interface TopicSuggestion {
  title: string;
  description: string;
}
