import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

type WorkoutsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'success'; suggestions: WorkoutSuggestion[] };

const userEmail = 'mona@example.com';

export default function Workouts() {
  const [state, setState] = useState<WorkoutsState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`)
      .then(({ suggestions }) => {
        if (active) setState(suggestions.length ? { status: 'success', suggestions } : { status: 'empty' });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
      {state.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
      {state.status === 'error' && <p role="alert">Unable to load workout suggestions.</p>}
      {state.status === 'empty' && <p role="status">No workout suggestions yet.</p>}
      {state.status === 'success' && (
        <ul className="list-group">
          {state.suggestions.map((suggestion, index) => (
            <li className="list-group-item" key={`${suggestion.title}-${index}`}>
              <strong>{suggestion.title}</strong>
              {suggestion.focus && <span className="d-block">Focus: {suggestion.focus}</span>}
              {suggestion.minutes !== undefined && <span className="d-block">{suggestion.minutes} min · {suggestion.difficulty}</span>}
              {suggestion.reason && <p className="mb-0 mt-2">{suggestion.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
