# Direct channel partner resolution

```yaml qa-scenario
id: direct-channel-partner-resolution
title: Direct channel partner resolution
surface: agent-chat
objective: Verify the agent can list direct-message channels and immediately surface human-readable counterpart names instead of raw ids from technical DM channel names.
successCriteria:
  - The agent checks the live tool inventory first.
  - The agent determines the active viewer and team.
  - The agent uses the channel listing flow and returns resolved partner names for direct chats.
docsRefs:
  - qa/tool-roadmap.md
  - qa/capability-map.md
codeRefs:
  - apps/mcp-server/src/tools/read/channelTools.ts
  - apps/mcp-server/src/tools/read/accountTools.ts
  - apps/mcp-server/src/tools/read/membershipTools.ts
execution:
  kind: codex-harness
  summary: Ask for direct chats with names and require a JSON-only result that proves DM counterpart resolution happened.
  prompt: |-
    Мне нужен список моих прямых чатов в Loop с именами собеседников.
    Не угадывай по коду и не опирайся на память: сначала проверь живой MCP-инструментарий в этой сессии.
    Потом определи текущего пользователя и доступную команду, используй current-user joined-channel tool, получи список каналов и оставь только direct-message каналы типа D.
    Для каждого прямого чата верни имя собеседника из данных инструмента, а не из технического channel name.
    Верни только JSON с ключами: viewer_user_id, viewer_username, team_id, direct_chat_count, direct_chats.
    В direct_chats верни не более 3 объектов с ключами: channel_id, resolved_name, opponent_id, opponent_username.
evaluation:
  expectTools:
    - loop_tool_inventory
    - loop_get_me
    - loop_list_teams
    - loop_list_my_team_channels
  expectJsonPaths:
    - viewer_user_id
    - viewer_username
    - team_id
    - direct_chat_count
    - direct_chats
    - direct_chats.0.channel_id
    - direct_chats.0.resolved_name
    - direct_chats.0.opponent_id
    - direct_chats.0.opponent_username
  expectTruthyPaths:
    - direct_chat_count
  expectNonEmptyPaths:
    - viewer_user_id
    - viewer_username
    - team_id
    - direct_chats
    - direct_chats.0.channel_id
    - direct_chats.0.resolved_name
    - direct_chats.0.opponent_id
    - direct_chats.0.opponent_username
```

Notes:

- This scenario exists to prevent regressions where the agent only sees technical direct-channel names like `userId__userId`.
- The intended happy path is that `loop_list_my_team_channels` returns resolved direct chat partner fields.
