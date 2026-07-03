# Loop MCP Capability Map

## User intent -> preferred tools

- "Who am I here?" -> `loop_get_me`
- "What teams can I access?" -> `loop_list_teams`
- "Find channel `<name>`" -> `loop_resolve_channel_by_name`
- "Show channels I have joined in this team" -> `loop_list_my_team_channels`
- "Show all public channels in this team" -> `loop_list_team_public_channels`
- "Show my DM chats with participant names" -> `loop_list_my_team_channels`
- "Prepare or send a message to this channel" -> `loop_create_post`
- "Reply in this thread" -> `loop_reply_to_post`
- "Edit my message" -> `loop_update_post`
- "Inspect a thread" -> `loop_get_post_thread`

## Notes

- `loop_tool_inventory` is the contract gate before downstream scenarios. The agent should use it when the request depends on the live tool surface.
- Channel routing is a distinct capability from message posting. The scenarios intentionally test them together because that is where model confusion has been observed.
