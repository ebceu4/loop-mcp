export type LoopUser = {
  id: string;
  username: string;
  email?: string;
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
  delete_at?: number;
  message: string;
  type: string;
};

export type LoopPostsResponse = {
  order: string[];
  posts: Record<string, LoopPost>;
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
