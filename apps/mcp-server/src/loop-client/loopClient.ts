import { sanitizeBaseUrl } from "../loop-shared/index.js";

import type {
  CreateLoopPostInput,
  LoopChannel,
  LoopChannelMember,
  LoopChannelStats,
  LoopClientConfig,
  LoopPost,
  LoopPostsResponse,
  LoopTeam,
  LoopTeamMember,
  LoopTeamUnread,
  LoopUser,
  LoopUserStatus,
} from "./types.js";

export class LoopClient {
  private readonly baseUrl: string;
  private readonly staticToken?: string;
  private readonly loginId?: string;
  private readonly password?: string;
  private cachedToken?: string;

  constructor(config: LoopClientConfig) {
    this.baseUrl = sanitizeBaseUrl(config.baseUrl);
    this.staticToken = config.token;
    this.loginId = config.loginId;
    this.password = config.password;
  }

  async getMe() {
    return this.requestJson<LoopUser>("/api/v4/users/me");
  }

  async getUser(userId: string) {
    return this.requestJson<LoopUser>(`/api/v4/users/${userId}`);
  }

  async getUsersByIds(userIds: string[]) {
    return this.requestJson<LoopUser[]>("/api/v4/users/ids", {
      method: "POST",
      body: JSON.stringify(userIds),
    });
  }

  async getUsersByUsernames(usernames: string[]) {
    return this.requestJson<LoopUser[]>("/api/v4/users/usernames", {
      method: "POST",
      body: JSON.stringify(usernames),
    });
  }

  async getUserStatusesByIds(userIds: string[]) {
    return this.requestJson<LoopUserStatus[]>("/api/v4/users/status/ids", {
      method: "POST",
      body: JSON.stringify(userIds),
    });
  }

  async getTeam(teamId: string) {
    return this.requestJson<LoopTeam>(`/api/v4/teams/${teamId}`);
  }

  async getTeamMember(teamId: string, userId: string) {
    return this.requestJson<LoopTeamMember>(
      `/api/v4/teams/${teamId}/members/${userId}`,
    );
  }

  async resolveTeamByName(teamName: string) {
    return this.requestJson<LoopTeam>(
      `/api/v4/teams/name/${encodeURIComponent(teamName)}`,
    );
  }

  async listTeams() {
    return this.requestJson<LoopTeam[]>("/api/v4/users/me/teams");
  }

  async listMyTeamUnreads() {
    return this.requestJson<LoopTeamUnread[]>("/api/v4/users/me/teams/unread");
  }

  async listTeamMembers(
    teamId: string,
    options: { page: number; perPage: number },
  ) {
    return this.requestJson<LoopTeamMember[]>(
      `/api/v4/teams/${teamId}/members?${this.paginationQuery(options)}`,
    );
  }

  async getChannel(channelId: string) {
    return this.requestJson<LoopChannel>(`/api/v4/channels/${channelId}`);
  }

  async listChannels(teamId: string) {
    return this.requestJson<LoopChannel[]>(
      `/api/v4/users/me/teams/${teamId}/channels`,
    );
  }

  async listTeamPublicChannels(
    teamId: string,
    options: { page: number; perPage: number },
  ) {
    return this.requestJson<LoopChannel[]>(
      `/api/v4/teams/${teamId}/channels?${this.paginationQuery(options)}`,
    );
  }

  async getChannelStats(channelId: string) {
    return this.requestJson<LoopChannelStats>(`/api/v4/channels/${channelId}/stats`);
  }

  async listChannelMembers(
    channelId: string,
    options: { page: number; perPage: number },
  ) {
    return this.requestJson<LoopChannelMember[]>(
      `/api/v4/channels/${channelId}/members?${this.paginationQuery(options)}`,
    );
  }

  async listMyTeamChannelMembers(teamId: string) {
    return this.requestJson<LoopChannelMember[]>(
      `/api/v4/users/me/teams/${teamId}/channels/members`,
    );
  }

  async getChannelMember(channelId: string, userId: string) {
    return this.requestJson<LoopChannelMember>(
      `/api/v4/channels/${channelId}/members/${userId}`,
    );
  }

  async getPost(postId: string) {
    return this.requestJson<LoopPost>(`/api/v4/posts/${postId}`);
  }

  async listChannelPosts(
    channelId: string,
    options: { page: number; perPage: number },
  ) {
    return this.requestJson<LoopPostsResponse>(
      `/api/v4/channels/${channelId}/posts?${this.paginationQuery(options)}`,
    );
  }

  async listPinnedPosts(channelId: string) {
    return this.requestJson<LoopPostsResponse>(`/api/v4/channels/${channelId}/pinned`);
  }

  async listReactionedPosts(
    userId: string,
    options: { perPage: number; lastReactionUpdateAt?: number },
  ) {
    const query = new URLSearchParams({ per_page: String(options.perPage) });
    if (options.lastReactionUpdateAt !== undefined) {
      query.set("last_reaction_updateat", String(options.lastReactionUpdateAt));
    }

    return this.requestJson<LoopPostsResponse>(
      `/api/v4/users/${userId}/posts/reactioned?${query.toString()}`,
    );
  }

  async getPostThread(postId: string) {
    return this.requestJson<LoopPostsResponse>(`/api/v4/posts/${postId}/thread`);
  }

  async resolveChannelByName(teamId: string, channelName: string) {
    return this.requestJson<LoopChannel>(
      `/api/v4/teams/${teamId}/channels/name/${encodeURIComponent(channelName)}`,
    );
  }

  async resolveUserByUsername(username: string) {
    return this.requestJson<LoopUser>(
      `/api/v4/users/username/${encodeURIComponent(username)}`,
    );
  }

  async createPost(input: CreateLoopPostInput) {
    return this.requestJson<LoopPost>("/api/v4/posts", {
      method: "POST",
      body: JSON.stringify({
        channel_id: input.channelId,
        message: input.message,
        root_id: input.rootId ?? "",
      }),
    });
  }

  async createDirectChannel(userId1: string, userId2: string) {
    return this.requestJson<LoopChannel>("/api/v4/channels/direct", {
      method: "POST",
      body: JSON.stringify([userId1, userId2]),
    });
  }

  async createGroupChannel(userIds: string[]) {
    return this.requestJson<LoopChannel>("/api/v4/channels/group", {
      method: "POST",
      body: JSON.stringify(userIds),
    });
  }

  async updatePost(postId: string, message: string) {
    return this.requestJson<LoopPost>(`/api/v4/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify({
        id: postId,
        message,
      }),
    });
  }

  async deletePost(postId: string) {
    await this.request(`/api/v4/posts/${postId}`, {
      method: "DELETE",
    });
  }

  private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.request(path, init);
    const text = await response.text();

    if (!text) {
      throw new Error(`Loop API request returned an empty JSON body for ${path}.`);
    }

    return JSON.parse(text) as T;
  }

  private paginationQuery(options: { page: number; perPage: number }) {
    return new URLSearchParams({
      page: String(options.page),
      per_page: String(options.perPage),
    }).toString();
  }

  private async request(path: string, init?: RequestInit) {
    const response = await this.fetchWithAuth(path, init);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Loop API request failed: ${response.status} ${response.statusText}\n${text}`,
      );
    }

    return response;
  }

  private async fetchWithAuth(path: string, init?: RequestInit) {
    const token = await this.getToken();
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);

    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });
  }

  private async getToken() {
    if (this.staticToken) {
      return this.staticToken;
    }

    if (this.cachedToken) {
      return this.cachedToken;
    }

    if (!this.loginId || !this.password) {
      throw new Error(
        "Loop credentials are missing. Set LOOP_TOKEN or LOOP_LOGIN_ID with LOOP_PASSWORD.",
      );
    }

    const response = await fetch(`${this.baseUrl}/api/v4/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_id: this.loginId,
        password: this.password,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Loop login failed: ${response.status} ${response.statusText}\n${text}`,
      );
    }

    const token = response.headers.get("token");
    if (!token) {
      throw new Error("Loop login succeeded but did not return a token header.");
    }

    this.cachedToken = token;
    return token;
  }
}
