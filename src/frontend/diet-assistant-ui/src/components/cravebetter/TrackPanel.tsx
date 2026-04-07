import React from 'react';
import { MealEntry } from '../../types/cravebetter';

interface TrackPanelProps {
  meals: MealEntry[];
}

export default function TrackPanel({ meals }: TrackPanelProps): React.ReactElement {
  return (
    <section className="panel">
      <h2>Track</h2>
      <p className="panel-subtitle">Recent meal decisions only. Keep it simple and consistent.</p>

      {meals.length === 0 ? (
        <p className="empty-state">No meals logged yet. Analyze your first meal from Home.</p>
      ) : (
        <ul className="meal-list">
          {meals.slice(0, 12).map((meal) => (
            <li key={meal.id}>
              <div>
                <h3>{meal.food}</h3>
                <p>{meal.goal} | {meal.time}</p>
              </div>
              <div className={`pill ${meal.tag}`}>
                {meal.score}/10 • {meal.tag}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
