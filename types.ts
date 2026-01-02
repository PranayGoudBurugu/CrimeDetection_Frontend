export interface MudraAnalysis {
  startTime: number;
  endTime: number;
  mudraName: string;
  meaning: string;
  expression: string; // Abhinaya
  description: string;
}

export interface AnalysisResponse {
  danceStyle?: string;
  segments: MudraAnalysis[];
}

export enum AnalysisState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
