# Named channel routing

```yaml qa-scenario
id: named-channel-routing
title: Named channel routing
surface: agent-chat
objective: Verify the agent can discover the right Loop tools to find a channel by name and prepare a message for that channel without guessing.
successCriteria:
  - The agent checks the live tool inventory first.
  - The agent resolves the target channel from a human-readable channel name.
  - The response contains a non-empty draft message that is ready for posting.
docsRefs:
  - qa/tool-roadmap.md
  - qa/capability-map.md
codeRefs:
  - apps/mcp-server/src/tools/read/accountTools.ts
  - apps/mcp-server/src/tools/read/teamTools.ts
  - apps/mcp-server/src/tools/read/channelTools.ts
  - packages/shared/src/catalog.ts
execution:
  kind: codex-harness
  summary: Start from a user request that sounds like a posting flow, but require the model to route through the correct discovery tools first.
  prompt: |-
    Мне нужно подготовить короткое сообщение для канала test-it-help о том, что MCP smoke завершен успешно.
    Не угадывай по коду и не опирайся на память: сначала проверь живой MCP-инструментарий в этой сессии.
    Потом определи мою доступную команду, найди в ней канал с именем test-it-help и подготовь финальный текст сообщения для публикации.
    Ничего не публикуй.
    Верни только JSON с ключами: viewer_username, team_id, chosen_channel_name, resolved_channel_id, candidate_channel_names, draft_message.
evaluation:
  expectTools:
    - loop_tool_inventory
    - loop_get_me
    - loop_list_teams
    - loop_list_my_team_channels
    - loop_resolve_channel_by_name
  expectJsonPaths:
    - viewer_username
    - team_id
    - chosen_channel_name
    - resolved_channel_id
    - candidate_channel_names
    - draft_message
  expectNonEmptyPaths:
    - viewer_username
    - team_id
    - chosen_channel_name
    - resolved_channel_id
    - candidate_channel_names
    - draft_message
```

Notes:

- This scenario exists because model confusion was observed around the distinction between channel lookup and post-write tools.
- Keep the candidate channel names echoed in the output so failures are diagnosable.
