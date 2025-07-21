# Games Management

The Games Management feature provides comprehensive tools for scheduling, managing, and tracking games and matches within the sports organization. This module handles game creation, team assignments, score tracking, and integration with the live scoreboard system.

## Overview

The games management system serves as the central hub for all game-related activities, from initial scheduling to final score reporting. It integrates with team management and provides real-time updates for players, coaches, and fans.

**Location**: `/app/dashboard/games/`

**Access Level**: Admin only (currently)

## Core Features

### 📅 Game Scheduling
- Create and manage game schedules
- Team assignment for home/away games
- Date, time, and venue management
- Season-based game organization

### ⚽ Score Tracking
- Real-time score updates during games
- Final score recording and management
- Game statistics and performance metrics
- Historical score tracking

### 🏟️ Venue Management
- Game location tracking
- Home/away game designation
- Venue information and details
- Travel coordination support

### 📊 Game Analytics
- Team performance tracking
- Season statistics compilation
- Win/loss records
- Player performance integration

## Technical Architecture

### Main Components

#### `GameManager` (`components/game-manager.tsx`)
The central component for game operations:
- Game list display and management
- Game creation and editing interface
- Real-time score updates
- Integration with team data

```typescript
interface GameManagerProps {
  teams: Team[];
  initialGames: Game[];
  organizationId: string;
}
```

### Data Model

Games are structured with comprehensive tracking:

#### `games`
```typescript
interface Game {
  id: string;
  organization_id: string;
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  game_time: string;
  venue?: string;
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  season?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  home_team: Team;
  away_team: Team;
}
```

## Security & Access Control

### Administrator Access
Currently restricted to admin users:
```typescript
if (!userOrgRole || userOrgRole.role !== "admin") {
  return <p>Admin access required</p>;
}
```

### Organization Scoping
All games are scoped to the user's organization:
```typescript
const { data: games } = await supabase
  .from("games")
  .select("*")
  .eq("organization_id", userOrgRole.organization_id);
```

## Usage Patterns

### Creating a New Game
1. Navigate to `/dashboard/games`
2. Click "Add Game" or "Schedule Game"
3. Select home and away teams
4. Set date, time, and venue
5. Save game to schedule

### Managing Game Scores
1. Find the game in the games list
2. Click "Update Score" or similar action
3. Enter current or final scores
4. Update game status as needed
5. Save changes for real-time updates

## Integration Points

### Team Management
- **Team Selection**: Games require home and away team assignment
- **Team Rosters**: Integration with player assignments
- **Coach Notifications**: Automatic game notifications to coaches

### Live Scoreboard
- **Real-Time Updates**: Scores update live during games
- **Public Display**: Scores visible on public site
- **Mobile Integration**: Mobile app score updates

### Communications
- **Game Reminders**: Automated game reminder messages
- **Score Notifications**: Post-game score announcements
- **Schedule Updates**: Changes communicated to teams

## Future Enhancements

### Planned Features
- **Coach Access**: Allow coaches to manage their team's games
- **Player Statistics**: Individual player performance tracking
- **Referee Management**: Referee assignment and communication
- **Live Streaming**: Game broadcast integration
- **Fan Engagement**: Public commenting and interaction

### Technical Improvements
- **Real-Time Updates**: WebSocket integration for live scores
- **Mobile Optimization**: Enhanced mobile game management
- **Calendar Integration**: Sync with external calendar systems
- **Notification System**: Automated game-related notifications
- **Advanced Analytics**: Detailed game and player statistics

## Related Documentation
- [Team Management](../admin/teams/README.md) - Team creation and assignment
- [Dashboard Home](../README.md) - Game quick actions and overview
- [Site Customizer](../site-customizer/README.md) - Public game display customization