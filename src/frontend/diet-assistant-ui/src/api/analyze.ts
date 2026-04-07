import { API_BASE_URL } from '../config';
import { AnalyzeResult } from '../types/cravebetter';

export interface AnalyzeRequest {
  food: string;
  goal: string;
  time: string;
}

export async function analyzeFood(input: AnalyzeRequest): Promise<AnalyzeResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to analyze food decision');
  }

  return data as AnalyzeResult;
}
