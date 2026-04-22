import type {
  LoopChannel,
  LoopChannelMember,
  LoopChannelStats,
  LoopPost,
  LoopTeamMember,
} from "@carely/loop-client";

export function summarizeChannel(channel: LoopChannel) {
  return {
    id: channel.id,
    team_id: channel.team_id,
    type: channel.type,
    name: channel.name,
    display_name: channel.display_name,
    header: channel.header,
    purpose: channel.purpose,
  };
}

export function summarizePost(post: LoopPost) {
  return {
    id: post.id,
    channel_id: post.channel_id,
    user_id: post.user_id,
    root_id: post.root_id,
    create_at: post.create_at,
    update_at: post.update_at,
    delete_at: post.delete_at,
    message: post.message,
    type: post.type,
  };
}

export function summarizeChannelStats(stats: LoopChannelStats) {
  return {
    channel_id: stats.channel_id,
    member_count: stats.member_count,
    guest_count: stats.guest_count,
    pinnedpost_count: stats.pinnedpost_count,
    files_count: stats.files_count,
  };
}

export function summarizeChannelMember(member: LoopChannelMember) {
  return {
    channel_id: member.channel_id,
    user_id: member.user_id,
    roles: member.roles,
    last_viewed_at: member.last_viewed_at,
    msg_count: member.msg_count,
    mention_count: member.mention_count,
    mention_count_root: member.mention_count_root,
    urgent_mention_count: member.urgent_mention_count,
    msg_count_root: member.msg_count_root,
    last_update_at: member.last_update_at,
    scheme_guest: member.scheme_guest,
    scheme_user: member.scheme_user,
    scheme_admin: member.scheme_admin,
    explicit_roles: member.explicit_roles,
  };
}

export function summarizeTeamMember(member: LoopTeamMember) {
  return {
    team_id: member.team_id,
    user_id: member.user_id,
    roles: member.roles,
    delete_at: member.delete_at,
    scheme_guest: member.scheme_guest,
    scheme_user: member.scheme_user,
    scheme_admin: member.scheme_admin,
    explicit_roles: member.explicit_roles,
  };
}
