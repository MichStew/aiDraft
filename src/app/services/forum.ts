import { apiFetch } from "./apiClient";

export interface ForumPost {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export async function fetchForumPosts(limit = 50) {
  return apiFetch<{ posts: ForumPost[] }>(`/forum?limit=${limit}`, {
    method: "GET",
  });
}

export async function createForumPost(content: string) {
  return apiFetch<{ post: ForumPost }>("/forum", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
