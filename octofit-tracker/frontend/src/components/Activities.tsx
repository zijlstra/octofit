import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type ActivityRecord = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
};

type ActivitiesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'success'; activities: ActivityRecord[] };

export default function Activities() {
  const [state, setState] = useState<ActivitiesState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ activities: ActivityRecord[] }>('/api/activities')
      .then(({ activities }) => {
        if (active) setState(activities.length ? { status: 'success', activities } : { status: 'empty' });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points.">
      {state.status === 'loading' && <p role="status">Loading activities...</p>}
      {state.status === 'error' && <p role="alert">Unable to load activities.</p>}
      {state.status === 'empty' && <p role="status">No activities yet.</p>}
      {state.status === 'success' && (
        <ul className="list-group">
          {state.activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
              {activity.type} · {activity.minutes} min · {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
