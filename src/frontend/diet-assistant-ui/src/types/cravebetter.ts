export interface AnalyzeResult {
  score: number;
  issues: string[];
  improvement: string;
  alternative: string;
  explanation: string;
  feeling: string;
  tag: 'healthy' | 'unhealthy';
  source?: 'llm' | 'heuristic';
}

export interface MealEntry {
  id: string;
  food: string;
  goal: string;
  time: string;
  score: number;
  tag: 'healthy' | 'unhealthy';
  createdAt: string;
}

export interface PlanItem {
  meal: string;
  suggestion: string;
}
