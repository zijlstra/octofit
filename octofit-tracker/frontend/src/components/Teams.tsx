import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamRecord = {
  _id?: string;
  name: string;
  mascot?: string;
  members?: unknown[];
};

type TeamsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'success'; teams: TeamRecord[] };

export default function Teams() {
  const [state, setState] = useState<TeamsState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ teams: TeamRecord[] }>('/api/teams')
      .then(({ teams }) => {
        if (active) setState(teams.length ? { status: 'success', teams } : { status: 'empty' });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Teams" description="Manage teams and members.">
      {state.status === 'loading' && <p role="status">Loading teams...</p>}
      {state.status === 'error' && <p role="alert">Unable to load teams.</p>}
      {state.status === 'empty' && <p role="status">No teams yet.</p>}
      {state.status === 'success' && (
        <ul className="list-group">
          {state.teams.map((team, index) => (
            <li className="list-group-item d-flex justify-content-between align-items-center gap-3" key={team._id ?? `${team.name}-${index}`}>
              <span>
                <strong>{team.name}</strong>
                {team.mascot && <span className="d-block text-body-secondary">Mascot: {team.mascot}</span>}
              </span>
              <span>{team.members?.length ?? 0} members</span>
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
