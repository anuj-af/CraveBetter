import React, { useMemo } from 'react';
import { MealEntry, PlanItem } from '../../types/cravebetter';

interface PlanPanelProps {
  meals: MealEntry[];
}

function buildPlan(meals: MealEntry[]): PlanItem[] {
  const recentHealthy = meals.filter((meal) => meal.tag === 'healthy').slice(0, 3);

  if (recentHealthy.length === 0) {
    return [
      { meal: 'Breakfast', suggestion: 'Protein yogurt, fruit, and oats.' },
      { meal: 'Lunch', suggestion: 'Grilled bowl with rice, vegetables, and lean protein.' },
      { meal: 'Dinner', suggestion: 'Light stir-fry with veggies and tofu/chicken.' },
      { meal: 'Snack', suggestion: 'Fruit and nuts instead of fried snack.' },
    ];
  }

  return [
    { meal: 'Breakfast', suggestion: `Repeat a balanced start like: ${recentHealthy[0].food}.` },
    { meal: 'Lunch', suggestion: 'Build around whole grains + protein + one vegetable.' },
    { meal: 'Dinner', suggestion: 'Keep dinner lighter and avoid heavy fried options late.' },
    { meal: 'Snack', suggestion: 'Use one sweet craving swap: yogurt + fruit or dark chocolate + nuts.' },
  ];
}

export default function PlanPanel({ meals }: PlanPanelProps): React.ReactElement {
  const plan = useMemo(() => buildPlan(meals), [meals]);

  return (
    <section className="panel">
      <h2>Plan</h2>
      <p className="panel-subtitle">Lightweight AI-style daily guidance, no heavy rule engine.</p>

      <div className="plan-grid">
        {plan.map((item) => (
          <article key={item.meal}>
            <h3>{item.meal}</h3>
            <p>{item.suggestion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
