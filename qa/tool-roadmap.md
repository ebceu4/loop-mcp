# Loop MCP Tool Roadmap

This file is the QA-facing contract for the Loop MCP surface.

## Current contract

- `loop_tool_inventory` must expose the full live read/write surface and catalog metadata.
- Read flows must support:
  - viewer discovery
  - team discovery
  - channel discovery by current-user joined-channel list, by team-wide public directory, and by exact human-readable name
  - direct-message channel discovery with resolved counterpart names when available
  - post/thread inspection
- Write flows must support:
  - create a root post once `channelId` is known
  - reply to a thread
  - update a post
  - delete a post when the authenticated account has permission

## Routing expectations

- When the user says "find channel `<name>`", the agent should prefer `loop_resolve_channel_by_name`.
- When the user gives only a vague or partial channel reference within channels they have joined, the agent should inspect candidates via `loop_list_my_team_channels` before choosing.
- When the user asks for the team-wide public directory, the agent should use `loop_list_team_public_channels` rather than the current-user joined-channel list.
- When the user asks about direct-message channels, `loop_list_my_team_channels` should expose resolved counterpart names instead of forcing the agent to parse technical DM channel ids.
- When the user wants to post a new message to a channel, the agent should first resolve or confirm `channelId`, then call `loop_create_post`.
- When the user wants to answer in an existing thread, the agent should use `loop_reply_to_post` rather than creating a second root post.

## Known gaps

- Attachments are intentionally out of scope for v1.
- Search is intentionally out of scope for v1.
- Cross-team channel search is still modeled as an explicit team-aware flow.
