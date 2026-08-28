import { useEffect, useRef } from "react";
import { FiClipboard } from "react-icons/fi";
import type { TaskHistoryEntry } from "../../../domain/others.ts";
import { Thread } from "@feed/thread/Thread.tsx";
import { FeedItem } from "@feed/feed-item/FeedItem.tsx";
import { formatCommentDate } from "../../../utils/commentUtils.ts";
import { RichText } from "@input/rich-text/RichText";
import { useTranslation } from "../../../../../i18n/index.ts";
import { TaskDetailsTabPlaceholder } from "../../placeholders/TaskDetailsTabPlaceholder.tsx";
import styles from "./NotesThread.module.scss";

type NotesThreadProps = {
  notes: TaskHistoryEntry[];
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

export function NotesThread({ notes }: NotesThreadProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notes.length === 0) return;
    scrollThreadToEnd(endRef.current);
  }, [notes.length]);

  return (
    <Thread aria-label={labels.tabs.notes}>
      {notes.length === 0 ? (
        <TaskDetailsTabPlaceholder
          nested
          icon={<FiClipboard size={22} aria-hidden />}
          title={labels.tabs.notes}
          message={labels.tabs.notesEmpty}
        />
      ) : (
        notes.map((note) => (
          <FeedItem key={note.id}>
            <FeedItem.Avatar>{note.authorInitials}</FeedItem.Avatar>
            <FeedItem.Body>
              <FeedItem.Header>
                <FeedItem.Meta>
                  <FeedItem.Author>{note.author}</FeedItem.Author>
                </FeedItem.Meta>
                <FeedItem.Time dateTime={note.createdAt}>
                  {formatCommentDate(note.createdAt)}
                </FeedItem.Time>
              </FeedItem.Header>

              {note.description.trim() ? (
                <FeedItem.Content className={styles.noteContent}>
                  <RichText value={note.description} />
                </FeedItem.Content>
              ) : null}
            </FeedItem.Body>
          </FeedItem>
        ))
      )}
      {notes.length > 0 ? <div ref={endRef} aria-hidden /> : null}
    </Thread>
  );
}
