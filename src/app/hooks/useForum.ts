import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/apiClient";
import { createForumPost, fetchForumPosts, ForumPost } from "../services/forum";
import { useAuth } from "./useAuth";

const DEFAULT_LIMIT = 50;

const getApiErrorMessage = (error: ApiError) => {
  const details = error.details;
  if (details && typeof details === "object" && "error" in details) {
    const message = (details as { error?: unknown }).error;
    if (typeof message === "string") {
      return message;
    }
  }
  return null;
};

const mapSubmitError = (message: string | null) => {
  switch (message) {
    case "explicit content not allowed":
      return "Please avoid explicit sexual content.";
    case "content too short":
      return "Add a bit more detail before posting.";
    case "content too long":
      return "Keep posts under 500 characters.";
    case "invalid content":
      return "Write a short update before posting.";
    default:
      return "Unable to post right now.";
  }
};

export function useForum(limit = DEFAULT_LIMIT) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetchForumPosts(limit);
      setPosts(response.posts ?? []);
    } catch {
      setLoadError("Unable to load community posts.");
    } finally {
      setIsLoading(false);
    }
  }, [limit, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitPost = useCallback(
    async (content: string) => {
      if (!user) return false;
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await createForumPost(content);
        setPosts((prev) => [response.post, ...prev]);
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          setSubmitError(mapSubmitError(getApiErrorMessage(error)));
        } else {
          setSubmitError("Unable to post right now.");
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user]
  );

  return {
    posts,
    isLoading,
    isSubmitting,
    loadError,
    submitError,
    refresh,
    submitPost,
  };
}
