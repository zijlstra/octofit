# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: change last,  implement the fetch/useState-driven UI behavior in App.tsx and the feature components
- Logic tier decision: change second, Implement the service methods in octofitService.ts:
activity creation with existence checks and 4xx validation on bad IDs
team creation with required name validation
leaderboard total points ordered by team
workout suggestions based on user goal/activity pattern and unknown-user handling
- Data tier decision:change first, Fix the required field validation in the four Mongoose models
Confirm the seeded demo data remains idempotent and preserves existing data in seed.ts
- Activity tracking approach: Validate user/team IDs and existence, then save activity with computed points and timestamp.
- Team management approach: Require a team name, preserve its mascot and members, and return a clear 400 for invalid input.
- Leaderboard approach: Sum activity points per team, sort highest first, and assign 1-based ranks.
- Workout suggestions approach: Match suggestions to the user’s goal or recent activity, explain the match, and return a 4xx for unknown users.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
Result: 4 failed, 1 passed
Failures are in data.contract.test.ts
The failing assertions are all the same pattern: “expected undefined to be defined” for required fields on User, Team, Activity, and Workout
This tells us the schemas are still too permissive and do not enforce the required fields the API/data contract expects
- API command: `npm run test:api --prefix octofit-tracker/backend`
octofitService.ts explicitly throws 501 for createActivity and createTeam
getLeaderboard returns an empty array
suggestWorkouts returns only one random workout
- Frontend command: `npm test --prefix octofit-tracker/frontend`
Result: the suite is failing broadly across the presentation checks in app.contract.test.tsx
The DOM shows “Implementation pending” rather than real data, loading states, empty states, or alerts
A route-level failure pattern is clear: the app is not yet rendering the actual sections or handling error/loading states required by the contrac
- Backend build command: `npm run build --prefix octofit-tracker/backend`
Both builds succeeded: the backend TypeScript check and the frontend TypeScript and Vite production build each exited with code 0.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
Both builds succeeded: the backend TypeScript check and the frontend TypeScript and Vite production build each exited with code 0.
