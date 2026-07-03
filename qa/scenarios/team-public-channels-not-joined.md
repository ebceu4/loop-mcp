# Team public channels not joined

```yaml qa-scenario
id: team-public-channels-not-joined
title: Team public channels not joined
surface: agent-chat
objective: Verify the agent can find public team channels that exist in the organization directory but are not joined by the current user.
successCriteria:
  - The agent checks the live tool inventory first.
  - The agent determines the active team and current user's joined channels.
  - The agent uses the team-wide public channel directory and subtracts the joined channel ids.
docsRefs:
  - qa/tool-roadmap.md
  - qa/capability-map.md
codeRefs:
  - apps/mcp-server/src/tools/read/channelTools.ts
  - packages/shared/src/catalog.ts
execution:
  kind: codex-harness
  summary: Ask for public organization/team channels the current user has not joined yet.
  prompt: |-
    Найди публичные каналы текущей команды Loop, к которым текущий пользователь еще не подключен.
    Не угадывай по коду и не опирайся на память: сначала проверь живой MCP-инструментарий в этой сессии.
    Потом определи текущего пользователя и команду.
    Получи список каналов текущего пользователя в этой команде через current-user joined-channel tool.
    Получи team-wide public channel directory.
    Верни только публичные каналы из team-wide directory, id которых отсутствует в списке каналов текущего пользователя.
    Верни только JSON с ключами: viewer_username, team_id, joined_channel_count, public_channel_count, not_joined_public_channel_count, not_joined_public_channels.
    В not_joined_public_channels верни не более 5 объектов с ключами: channel_id, channel_name, display_name, channel_type.
evaluation:
  expectTools:
    - loop_tool_inventory
    - loop_get_me
    - loop_list_teams
    - loop_list_my_team_channels
    - loop_list_team_public_channels
  expectJsonPaths:
    - viewer_username
    - team_id
    - joined_channel_count
    - public_channel_count
    - not_joined_public_channel_count
    - not_joined_public_channels
    - not_joined_public_channels.0.channel_id
    - not_joined_public_channels.0.channel_name
    - not_joined_public_channels.0.channel_type
  expectTruthyPaths:
    - not_joined_public_channel_count
  expectNonEmptyPaths:
    - viewer_username
    - team_id
    - joined_channel_count
    - public_channel_count
    - not_joined_public_channels
    - not_joined_public_channels.0.channel_id
    - not_joined_public_channels.0.channel_name
    - not_joined_public_channels.0.channel_type
```

Notes:

- This scenario exercises the specific directory-vs-joined-channel distinction needed to find public channels the user has not joined.
- The expected happy path needs both `loop_list_my_team_channels` and `loop_list_team_public_channels`.
