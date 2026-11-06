import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type LeaderboardState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'success'; entries: LeaderboardEntry[] };

export default function Leaderboard() {
  const [state, setState] = useState<LeaderboardState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then(({ leaderboard }) => {
        if (active) setState(leaderboard.length ? { status: 'success', entries: leaderboard } : { status: 'empty' });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals.">
      {state.status === 'loading' && <p role="status">Loading leaderboard...</p>}
      {state.status === 'error' && <p role="alert">Unable to load leaderboard.</p>}
      {state.status === 'empty' && <p role="status">No leaderboard entries yet.</p>}
      {state.status === 'success' && (
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr>
            </thead>
            <tbody>
              {state.entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.teamName}`}>
                  <td>{entry.rank}</td>
                  <th scope="row">{entry.teamName}</th>
                  <td>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CapabilityCard>
  );
}
