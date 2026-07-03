export type LoopUser = {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  position?: string;
  locale?: string;
  roles?: string;
};

export type LoopTeam = {
  id: string;
  name: string;
  display_name: string;
};

export type LoopChannel = {
  id: string;
  team_id: string;
  type: string;
  name: string;
  display_name: string;
  header?: string;
  purpose?: string;
};

export type LoopChannelStats = {
  channel_id: string;
  member_count: number;
  guest_count?: number;
  pinnedpost_count?: number;
  files_count?: number;
};

export type LoopChannelMember = {
  channel_id: string;
  user_id: string;
  roles?: string;
  last_viewed_at?: number;
  msg_count?: number;
  mention_count?: number;
  mention_count_root?: number;
  urgent_mention_count?: number;
  msg_count_root?: number;
  notify_props?: Record<string, string>;
  last_update_at?: number;
  scheme_guest?: boolean;
  scheme_user?: boolean;
  scheme_admin?: boolean;
  explicit_roles?: string;
};

export type LoopTeamMember = {
  team_id: string;
  user_id: string;
  roles?: string;
  delete_at?: number;
  scheme_guest?: boolean;
  scheme_user?: boolean;
  scheme_admin?: boolean;
  explicit_roles?: string;
};

export type LoopUserStatus = {
  user_id: string;
  status: string;
  manual?: boolean;
  last_activity_at?: number;
  dnd_end_time?: number;
};

export type LoopTeamUnread = {
  team_id: string;
  msg_count?: number;
  mention_count?: number;
  mention_count_root?: number;
  msg_count_root?: number;
  thread_count?: number;
  thread_mention_count?: number;
  thread_urgent_mention_count?: number;
};

export type LoopPost = {
  id: string;
  user_id: string;
  channel_id: string;
  root_id: string;
  create_at: number;
  update_at?: number;
  edit_at?: number;
  delete_at?: number;
  is_pinned?: boolean;
  message: string;
  type: string;
  has_reactions?: boolean;
  reply_count?: number;
  last_reply_at?: number;
  metadata?: {
    reactions?: LoopPostReaction[];
  };
};

export type LoopPostReaction = {
  user_id: string;
  post_id: string;
  emoji_name: string;
  create_at: number;
  update_at?: number;
  delete_at?: number;
  remote_id?: string;
  channel_id?: string;
};

export type LoopPostsResponse = {
  order: string[];
  posts: Record<string, LoopPost>;
  next_post_id?: string;
  prev_post_id?: string;
  has_next?: boolean;
  first_inaccessible_post_time?: number;
  last_reaction_updateat?: number;
};

export type LoopClientConfig = {
  baseUrl: string;
  token?: string;
  loginId?: string;
  password?: string;
};

export type CreateLoopPostInput = {
  channelId: string;
  message: string;
  rootId?: string;
};
