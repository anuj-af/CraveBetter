import React from 'react';
import { MealEntry } from '../../types/cravebetter';
import { averageScore, improvementTrend, lateNightFeedback } from '../../lib/insights';

interface DashboardPanelProps {
  meals: MealEntry[];
}

export default function DashboardPanel({ meals }: DashboardPanelProps): React.ReactElement {
  const avg = averageScore(meals);
  const trend = improvementTrend(meals);
  const lateNight = lateNightFeedback(meals);

  return (
    <section className="panel">
      <h2>Dashboard</h2>
      <p className="panel-subtitle">Minimal insights from your decision history.</p>

      <div className="insight-cards">
        <article>
          <h3>Avg Health Score</h3>
          <p className="big-number">{avg || '-'}</p>
        </article>

        <article>
          <h3>Improvement Trend</h3>
          <p>{trend}</p>
        </article>

        <article>
          <h3>Feedback</h3>
          <p>{lateNight}</p>
        </article>
      </div>
    </section>
  );
}
