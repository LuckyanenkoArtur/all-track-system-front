import { useEffect, useMemo, useRef } from "react";
import { FiClock } from "react-icons/fi";
import type { TaskHistoryEntry } from "../../../domain/others.ts";
import { Thread } from "@feed/thread/Thread.tsx";
import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { formatCommentDate } from "../../../utils/commentUtils.ts";
import { formatTimeSpent } from "../../../utils/timeTrackingUtils.ts";
import { useTranslation } from "../../../../../i18n/index.ts";
import { TaskDetailsTabPlaceholder } from "../../placeholders/TaskDetailsTabPlaceholder.tsx";
import styles from "./TimeThread.module.scss";

type TimeThreadProps = {
  entries: TaskHistoryEntry[];
};

function scrollThreadToEnd(node: HTMLElement | null) {
  if (!node) return;

  let parent = node.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      parent.scrollTop = parent.scrollHeight;
      return;
    }
    parent = parent.parentElement;
  }
}

export function TimeThread({ entries }: TimeThreadProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;
  const endRef = useRef<HTMLDivElement>(null);

  const orderedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [entries],
  );

  useEffect(() => {
    if (orderedEntries.length === 0) return;
    scrollThreadToEnd(endRef.current);
  }, [orderedEntries.length]);

  return (
    <Thread aria-label={labels.tabs.time}>
      {orderedEntries.length === 0 ? (
        <TaskDetailsTabPlaceholder
          nested
          icon={<FiClock size={22} aria-hidden />}
          title={labels.tabs.time}
          message={labels.tabs.timeEmpty}
        />
      ) : (
        orderedEntries.map((entry) => {
          const isTracked = entry.type === "time_tracked";
          const duration =
            entry.minutesAdded != null
              ? formatTimeSpent(entry.minutesAdded)
              : null;
          const entryNote = entry.description?.trim();

          return (
            <FeedItem key={entry.id}>
              <FeedItem.Avatar>{entry.authorInitials}</FeedItem.Avatar>
              <FeedItem.Body>
                <FeedItem.Header>
                  <FeedItem.Meta>
                    <FeedItem.Author>{entry.author}</FeedItem.Author>
                    <FeedItem.Badge variant={isTracked ? "accent" : "muted"}>
                      {isTracked
                        ? labels.tabs.timeEntryTracked
                        : labels.tabs.timeEntryManual}
                    </FeedItem.Badge>
                  </FeedItem.Meta>
                  <FeedItem.Time dateTime={entry.createdAt}>
                    {formatCommentDate(entry.createdAt)}
                  </FeedItem.Time>
                </FeedItem.Header>

                {duration && <FeedItem.Title>{duration}</FeedItem.Title>}

                {entryNote ? (
                  <FeedItem.Content className={styles.entryContent}>
                    {entryNote}
                  </FeedItem.Content>
                ) : null}
              </FeedItem.Body>
            </FeedItem>
          );
        })
      )}
      {orderedEntries.length > 0 ? <div ref={endRef} aria-hidden /> : null}
    </Thread>
  );
}
