import type { LoopClient } from "../loop-client/index.js";

export async function resolveTeamId(client: LoopClient, teamId?: string) {
  if (teamId) {
    return teamId;
  }

  const teams = await client.listTeams();
  if (teams.length === 0) {
    throw new Error("No Loop teams available for this user.");
  }

  return teams[0].id;
}
