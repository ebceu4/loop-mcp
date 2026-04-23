# Loop MCP Tool Status

Legend:

- `[x]` implemented
- `[ ]` not implemented
- `tested: yes/no` reflects the latest local harness run
- `tested: blocked` means the tool was exercised but the real Loop server denied the action for this account

## Read Tools

- [x] `loop_tool_inventory` - tested: yes
- [x] `loop_get_me` - tested: yes
- [x] `loop_get_user` - tested: yes
- [x] `loop_get_users_by_ids` - tested: yes
- [x] `loop_get_users_by_usernames` - tested: yes
- [x] `loop_get_user_statuses_by_ids` - tested: yes
- [x] `loop_get_team` - tested: yes
- [x] `loop_get_team_member` - tested: yes
- [x] `loop_list_teams` - tested: yes
- [x] `loop_list_team_members` - tested: yes
- [x] `loop_resolve_team_by_name` - tested: yes
- [x] `loop_list_my_team_unreads` - tested: yes
- [x] `loop_get_my_channel_mention_state` - tested: yes
- [x] `loop_list_team_mentions` - tested: yes
- [x] `loop_list_all_mentions` - tested: yes
- [x] `loop_get_channel` - tested: yes
- [x] `loop_list_channels` - tested: yes
- [x] `loop_get_channel_stats` - tested: yes
- [x] `loop_list_my_team_channel_members` - tested: yes
- [x] `loop_list_channel_members` - tested: yes
- [x] `loop_get_channel_member` - tested: yes
- [x] `loop_get_post` - tested: yes
- [x] `loop_list_channel_posts` - tested: yes
- [x] `loop_list_pinned_posts` - tested: yes
- [x] `loop_get_post_thread` - tested: yes
- [x] `loop_resolve_channel_by_name` - tested: yes
- [x] `loop_resolve_user_by_username` - tested: yes

## Write Tools

- [x] `loop_create_post` - tested: yes
- [x] `loop_reply_to_post` - tested: yes
- [x] `loop_update_post` - tested: yes
- [x] `loop_delete_post` - tested: blocked
- [x] `loop_create_direct_channel` - tested: yes
- [x] `loop_create_group_channel` - tested: yes

## Notes

- Attachments are intentionally out of scope for v1.
- Search is intentionally out of scope for v1.
- Smoke channel can be guided with `LOOP_SMOKE_CHANNEL_NAME` in `.env` or `.env.local`.
- Latest live write smoke used channel `test-it-help`.
- `loop_delete_post` reached the real API twice and returned `403 Forbidden` for the `system_guest` account, so the implementation is present but cannot be fully validated with this user.
- Latest detail smoke also validated `loop_get_user`, `loop_get_team`, `loop_get_channel`, `loop_get_channel_stats`, `loop_list_channel_members`, `loop_get_channel_member`, `loop_get_post`, and `loop_create_direct_channel`.
- Latest batch2 smoke also validated `loop_get_users_by_ids`, `loop_list_team_members`, `loop_list_my_team_channel_members`, `loop_list_pinned_posts`, and `loop_create_group_channel`.
- Latest batch3 smoke also validated `loop_get_team_member`, `loop_resolve_team_by_name`, `loop_get_users_by_usernames`, `loop_get_user_statuses_by_ids`, and `loop_list_my_team_unreads`.
- Latest mentions smoke also validated `loop_get_my_channel_mention_state`, `loop_list_team_mentions`, and `loop_list_all_mentions`.
