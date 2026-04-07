import React, { useEffect, useState } from 'react';
import './App.css';
import HomePanel from './components/cravebetter/HomePanel';
import TrackPanel from './components/cravebetter/TrackPanel';
import PlanPanel from './components/cravebetter/PlanPanel';
import DashboardPanel from './components/cravebetter/DashboardPanel';
import { getMeals, saveMeal } from './lib/storage';
import { MealEntry } from './types/cravebetter';

type Tab = 'home' | 'track' | 'plan' | 'dashboard';

function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [meals, setMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    setMeals(getMeals());
  }, []);

  const onMealLogged = (meal: MealEntry) => {
    const updated = saveMeal(meal);
    setMeals(updated);
  };

  return (
    <div className="app-shell">
      <div className="bg-layer" aria-hidden="true" />

      <header className="top-nav" role="banner">
        <div className="brand">
          <span className="brand-dot" />
          <strong>CraveBetter</strong>
        </div>

        <nav aria-label="Primary navigation">
          <button aria-label="Go to Home" className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
            Home
          </button>
          <button aria-label="Go to Track" className={activeTab === 'track' ? 'active' : ''} onClick={() => setActiveTab('track')}>
            Track
          </button>
          <button aria-label="Go to Plan" className={activeTab === 'plan' ? 'active' : ''} onClick={() => setActiveTab('plan')}>
            Plan
          </button>
          <button aria-label="Go to Dashboard" className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'home' ? <HomePanel onMealLogged={onMealLogged} /> : null}
        {activeTab === 'track' ? <TrackPanel meals={meals} /> : null}
        {activeTab === 'plan' ? <PlanPanel meals={meals} /> : null}
        {activeTab === 'dashboard' ? <DashboardPanel meals={meals} /> : null}
      </main>
    </div>
  );
}

export default App;
