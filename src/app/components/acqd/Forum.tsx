import { useMemo, useState } from "react";
import { ChevronLeft, MessageCircle, RefreshCw } from "lucide-react";
import { useForum } from "../../hooks/useForum";
import { containsExplicitContent, sanitizeContent } from "../../utils/contentFilter";

interface ForumProps {
  onBack: () => void;
}

const MIN_CONTENT_LENGTH = 12;
const MAX_CONTENT_LENGTH = 500;

const formatPostTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export function Forum({ onBack }: ForumProps) {
  const { posts, isLoading, isSubmitting, loadError, submitError, refresh, submitPost } = useForum();
  const [draft, setDraft] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const sanitizedDraft = useMemo(() => sanitizeContent(draft), [draft]);
  const charCount = sanitizedDraft.length;
  const isExplicit = containsExplicitContent(sanitizedDraft);
  const isTooShort = charCount < MIN_CONTENT_LENGTH;
  const isTooLong = charCount > MAX_CONTENT_LENGTH;
  const canSubmit =
    charCount >= MIN_CONTENT_LENGTH &&
    charCount <= MAX_CONTENT_LENGTH &&
    !isExplicit &&
    !isSubmitting;

  const showValidation = hasSubmitted || draft.trim().length > 0;
  let validationMessage = "";

  if (showValidation) {
    if (charCount === 0) {
      validationMessage = "Write a short update before posting.";
    } else if (isExplicit) {
      validationMessage = "Please avoid explicit sexual content.";
    } else if (isTooShort) {
      validationMessage = `Add ${MIN_CONTENT_LENGTH - charCount} more characters.`;
    } else if (isTooLong) {
      validationMessage = `Trim ${charCount - MAX_CONTENT_LENGTH} characters.`;
    }
  }

  const handleSubmit = async () => {
    setHasSubmitted(true);
    if (!canSubmit) return;
    const success = await submitPost(sanitizedDraft);
    if (success) {
      setDraft("");
      setHasSubmitted(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      <div className="h-12" />

      <div className="px-6 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#00F0FF]" />
              <h1 className="text-2xl text-white tracking-tight">Forum</h1>
            </div>
            <p className="text-sm text-[#A6A6A6]">Share experiences and support others.</p>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#A6A6A6] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white">Start a post</h3>
            <span className="text-xs text-[#A6A6A6]">
              {charCount}/{MAX_CONTENT_LENGTH}
            </span>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Share what is helping you today..."
            maxLength={MAX_CONTENT_LENGTH}
            className="w-full min-h-[110px] bg-[#0B0B0D] rounded-[14px] p-3 text-sm text-white placeholder:text-[#6B6B6B] outline-none border border-transparent focus:border-[#00F0FF]/30"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[#A6A6A6]">Posts are visible to the community.</span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="text-xs text-[#0B0B0D] bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] px-4 py-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
          {validationMessage && (
            <p className="text-xs text-[#FFB84D] mt-2">{validationMessage}</p>
          )}
          {submitError && !validationMessage && (
            <p className="text-xs text-[#FF5A6E] mt-2">{submitError}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Latest posts</h3>
          {isLoading && <span className="text-xs text-[#A6A6A6]">Refreshing...</span>}
        </div>
        {loadError && <p className="text-xs text-[#FF5A6E] mb-3">{loadError}</p>}
        {posts.length === 0 && !isLoading ? (
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-sm text-[#A6A6A6]">
            No posts yet. Be the first to share an update.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-[#1C1C1E] rounded-[18px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{post.author}</span>
                  <span className="text-xs text-[#A6A6A6]">{formatPostTime(post.createdAt)}</span>
                </div>
                <p className="text-sm text-[#E6E6E6] leading-relaxed">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
