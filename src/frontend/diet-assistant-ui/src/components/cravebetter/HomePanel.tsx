import React, { FormEvent, useState } from 'react';
import { analyzeFood } from '../../api/analyze';
import { AnalyzeResult, MealEntry } from '../../types/cravebetter';

interface HomePanelProps {
  onMealLogged: (meal: MealEntry) => void;
}

const GOALS = ['Fat loss', 'Maintain weight', 'Build muscle', 'Better energy'];
const TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Late Night Snack'];

function scoreTone(score: number): string {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'warning';
  return 'risk';
}

export default function HomePanel({ onMealLogged }: HomePanelProps): React.ReactElement {
  const [food, setFood] = useState('');
  const [goal, setGoal] = useState(GOALS[0]);
  const [time, setTime] = useState(TIMES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!food.trim()) {
      setError('Please tell us what you are planning to eat.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const analysis = await analyzeFood({
        food: food.trim(),
        goal,
        time,
      });
      setResult(analysis);

      onMealLogged({
        id: `${Date.now()}`,
        food: food.trim(),
        goal,
        time,
        score: analysis.score,
        tag: analysis.tag,
        createdAt: new Date().toISOString(),
      });
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to analyze this food right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="panel panel-home">
      <div className="hero">
        <h1>CraveBetter</h1>
        <p>Instant food decision help that builds long-term healthy habits.</p>
      </div>

      <form className="decision-form" onSubmit={onSubmit}>
        <label htmlFor="food">What are you planning to eat?</label>
        <input
          id="food"
          type="text"
          placeholder="Example: Cheese burger and fries"
          value={food}
          onChange={(event) => setFood(event.target.value)}
        />

        <div className="inline-fields">
          <label>
            Goal
            <select value={goal} onChange={(event) => setGoal(event.target.value)}>
              {GOALS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Time
            <select value={time} onChange={(event) => setTime(event.target.value)}>
              {TIMES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Food'}
        </button>
      </form>

      {error ? <p className="error-text" role="alert">{error}</p> : null}

      {result ? (
        <article className={`result-card tone-${scoreTone(result.score)}`} aria-live="polite">
          <header>
            <h2>Decision Result</h2>
            <span className="score">{result.score}/10</span>
          </header>

          <p><strong>Issues:</strong> {result.issues.join(' | ')}</p>
          <p><strong>Small Improvement:</strong> {result.improvement}</p>
          <p><strong>Better Alternative:</strong> {result.alternative}</p>
          <p><strong>Why:</strong> {result.explanation}</p>
          <p><strong>Regret Prediction:</strong> {result.feeling}</p>
        </article>
      ) : null}
    </section>
  );
}
