import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { getKnowledgeFeedPage } from "../lib/knowledgeFeed";
import type { KnowledgeFeedEntry } from "../types/knowledge";
import { useMobileMasonry } from "../features/knowledge-feed/useMobileMasonry";
import KnowledgeFeedCard from "./KnowledgeFeedCard";

const PAGE_SIZE = 4;

export default function KnowledgeFeed({
  entries,
  onOpen,
}: {
  entries: KnowledgeFeedEntry[];
  onOpen: (entry: KnowledgeFeedEntry) => void;
}) {
  const [feed, setFeed] = useState(() =>
    getKnowledgeFeedPage(entries, null, PAGE_SIZE),
  );
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useMobileMasonry(feed.items.length);

  const loadMore = useCallback(() => {
    if (!feed.nextCursor || isPending) return;
    startTransition(() => {
      setFeed((current) => {
        if (!current.nextCursor) return current;
        const next = getKnowledgeFeedPage(
          entries,
          current.nextCursor,
          PAGE_SIZE,
        );
        return {
          items: [...current.items, ...next.items],
          nextCursor: next.nextCursor,
        };
      });
    });
  }, [entries, feed.nextCursor, isPending]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !feed.nextCursor || !("IntersectionObserver" in window))
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadMore();
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feed.nextCursor, loadMore]);

  return (
    <section className="knowledge-feed" aria-busy={isPending}>
      <div className="knowledge-feed-grid" ref={gridRef}>
        {feed.items.map((entry) => (
          <KnowledgeFeedCard
            key={entry.card.id}
            entry={entry}
            onOpen={() => onOpen(entry)}
          />
        ))}
      </div>
      <div className="knowledge-feed-loader" ref={sentinelRef}>
        {feed.nextCursor ? (
          <button
            type="button"
            className="secondary"
            onClick={loadMore}
            disabled={isPending}
          >
            <ArrowDown size={18} weight="regular" aria-hidden="true" />
            {isPending ? "正在加载…" : "加载更多知识卡片"}
          </button>
        ) : (
          <p className="muted" role="status">
            已经看完当前全部内置卡片
          </p>
        )}
        <span className="knowledge-feed-count" aria-live="polite">
          已加载 {feed.items.length} / {entries.length} 张
        </span>
      </div>
    </section>
  );
}
