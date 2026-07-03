import type { LoopChannel, LoopChannelMember, LoopTeamUnread } from "../loop-client/index.js";

export function mentionScore(member: LoopChannelMember) {
  return (
    (member.urgent_mention_count ?? 0) * 1000 +
    (member.mention_count ?? 0) * 100 +
    (member.mention_count_root ?? 0) * 10 +
    (member.msg_count ?? 0)
  );
}

export function summarizeMentionState(
  member: LoopChannelMember,
  channel?: LoopChannel,
) {
  return {
    channel_id: member.channel_id,
    user_id: member.user_id,
    mention_count: member.mention_count ?? 0,
    mention_count_root: member.mention_count_root ?? 0,
    urgent_mention_count: member.urgent_mention_count ?? 0,
    msg_count: member.msg_count ?? 0,
    msg_count_root: member.msg_count_root ?? 0,
    last_viewed_at: member.last_viewed_at,
    channel: channel
      ? {
          id: channel.id,
          team_id: channel.team_id,
          type: channel.type,
          name: channel.name,
          display_name: channel.display_name,
        }
      : null,
  };
}

export function hasMentions(member: LoopChannelMember) {
  return (
    (member.mention_count ?? 0) > 0 ||
    (member.mention_count_root ?? 0) > 0 ||
    (member.urgent_mention_count ?? 0) > 0
  );
}

export function summarizeTeamMentionUnread(unread?: LoopTeamUnread) {
  return {
    team_id: unread?.team_id ?? null,
    mention_count: unread?.mention_count ?? 0,
    mention_count_root: unread?.mention_count_root ?? 0,
    msg_count: unread?.msg_count ?? 0,
    msg_count_root: unread?.msg_count_root ?? 0,
    thread_count: unread?.thread_count ?? 0,
    thread_mention_count: unread?.thread_mention_count ?? 0,
    thread_urgent_mention_count: unread?.thread_urgent_mention_count ?? 0,
  };
}
