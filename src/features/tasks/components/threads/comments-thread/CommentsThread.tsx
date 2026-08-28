import { useEffect, useRef } from "react";
import { FiDownload, FiMessageSquare, FiPaperclip } from "react-icons/fi";
import type { TaskComment } from "../../../domain/others.ts";
import { Thread } from "@feed/thread/Thread";
import { FeedItem } from "@feed/feed-item/FeedItem";
import {
  downloadAttachment,
  formatCommentDate,
  formatFileSize,
} from "../../../utils/commentUtils.ts";
import { RichText } from "@input/rich-text/RichText";
import { useTranslation } from "../../../../../i18n/index.ts";
import { TaskDetailsTabPlaceholder } from "../../placeholders/TaskDetailsTabPlaceholder.tsx";
import styles from "./CommentsThread.module.scss";

type CommentsThreadProps = {
  comments: TaskComment[];
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

export function CommentsThread({ comments }: CommentsThreadProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comments.length === 0) return;
    scrollThreadToEnd(endRef.current);
  }, [comments.length]);

  return (
    <Thread aria-label={labels.tabs.comments}>
      {comments.length === 0 ? (
        <TaskDetailsTabPlaceholder
          nested
          icon={<FiMessageSquare size={22} aria-hidden />}
          title={labels.tabs.comments}
          message={labels.tabs.commentsEmpty}
        />
      ) : (
        comments.map((comment) => {
          const isCompletion = comment.kind === "completion";
          const body = comment.body?.trim();
          const completionSteps = comment.completionSteps ?? [];

          return (
            <FeedItem key={comment.id}>
              <FeedItem.Avatar
                className={isCompletion ? styles.avatarCompletion : ""}
              >
                {comment.authorInitials}
              </FeedItem.Avatar>
              <FeedItem.Body
                className={isCompletion ? styles.bodyCompletion : ""}
              >
                <FeedItem.Header>
                  <FeedItem.Meta>
                    <FeedItem.Author>{comment.author}</FeedItem.Author>
                    {isCompletion ? (
                      <FeedItem.Badge
                        variant="accent"
                        className={styles.badgeCompletion}
                      >
                        {labels.completeTask}
                      </FeedItem.Badge>
                    ) : null}
                  </FeedItem.Meta>
                  <FeedItem.Time dateTime={comment.createdAt}>
                    {formatCommentDate(comment.createdAt)}
                  </FeedItem.Time>
                </FeedItem.Header>

                {body ? (
                  <FeedItem.Content className={styles.commentContent}>
                    <RichText value={body} />
                  </FeedItem.Content>
                ) : null}

                {completionSteps.length > 0 ? (
                  <div className={styles.completionSteps}>
                    <h4>{labels.completionSteps}</h4>
                    <ol>
                      {completionSteps.map((step) => (
                        <li key={step.id}>{step.text}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {comment.attachments.length > 0 ? (
                  <ul className={styles.attachmentList}>
                    {comment.attachments.map((attachment) => (
                      <li key={attachment.id}>
                        <button
                          type="button"
                          className={styles.attachmentChip}
                          onClick={() => downloadAttachment(attachment)}
                          disabled={!attachment.dataUrl}
                          aria-label={
                            attachment.dataUrl
                              ? attachment.name
                              : `${attachment.name}: ${labels.attachmentUnavailable}`
                          }
                          title={
                            attachment.dataUrl
                              ? attachment.name
                              : labels.attachmentUnavailable
                          }
                        >
                          <FiPaperclip size={14} aria-hidden />
                          <span className={styles.attachmentName}>
                            {attachment.name}
                          </span>
                          <span className={styles.attachmentSize}>
                            {formatFileSize(attachment.size)}
                          </span>
                          {attachment.dataUrl ? (
                            <FiDownload size={14} aria-hidden />
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </FeedItem.Body>
            </FeedItem>
          );
        })
      )}
      {comments.length > 0 ? <div ref={endRef} aria-hidden /> : null}
    </Thread>
  );
}
