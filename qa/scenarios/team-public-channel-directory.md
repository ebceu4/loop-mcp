# Team public channel directory

```yaml qa-scenario
id: team-public-channel-directory
title: Team public channel directory
surface: agent-chat
objective: Verify the agent can distinguish the current user's joined channels from the full team-wide public channel directory.
successCriteria:
  - The agent checks the live tool inventory first.
  - The agent determines the active team.
  - The agent uses the team-wide public channel directory tool rather than the current-user joined-channel tool.
docsRefs:
  - qa/tool-roadmap.md
  - qa/capability-map.md
codeRefs:
  - apps/mcp-server/src/tools/read/channelTools.ts
  - packages/shared/src/catalog.ts
execution:
  kind: codex-harness
  summary: Ask for the full public channel directory of the active team, not just the viewer's own channels.
  prompt: |-
    Мне нужен список всех публичных каналов текущей команды в Loop, а не только моих доступных каналов.
    Не угадывай по коду и не опирайся на память: сначала проверь живой MCP-инструментарий в этой сессии.
    Потом определи мою команду и используй именно team-wide public channel directory tool.
    Верни только JSON с ключами: team_id, public_channel_count, public_channels.
    В public_channels верни не более 5 объектов с ключами: channel_id, channel_name, channel_type.
evaluation:
  expectTools:
    - loop_tool_inventory
    - loop_list_teams
    - loop_list_team_public_channels
  expectJsonPaths:
    - team_id
    - public_channel_count
    - public_channels
    - public_channels.0.channel_id
    - public_channels.0.channel_name
    - public_channels.0.channel_type
  expectTruthyPaths:
    - public_channel_count
  expectNonEmptyPaths:
    - team_id
    - public_channels
    - public_channels.0.channel_id
    - public_channels.0.channel_name
    - public_channels.0.channel_type
```

Notes:

- This scenario exists because `loop_list_my_team_channels` and the team-wide public channel directory have different semantics and should not be conflated.
- The expected happy path is `loop_list_team_public_channels`, not `loop_list_my_team_channels`.
