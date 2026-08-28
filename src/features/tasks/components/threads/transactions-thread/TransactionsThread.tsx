import { useEffect, useMemo, useRef } from "react";
import { FiDollarSign } from "react-icons/fi";
import type { BudgetTransaction } from "../../../domain/others.ts";
import { Thread } from "@feed/thread/Thread";
import { FeedItem } from "@feed/feed-item/FeedItem";
import { formatCommentDate } from "../../../utils/commentUtils.ts";
import { formatCurrency } from "../../../utils/taskDetailsUtils.ts";
import { useTranslation } from "../../../../../i18n/index.ts";
import { TaskDetailsTabPlaceholder } from "../../placeholders/TaskDetailsTabPlaceholder.tsx";
import { Initials } from "../../tabs/utils/Initials.ts";
import styles from "./TransactionsThread.module.scss";

type TransactionsThreadProps = {
  transactions: BudgetTransaction[];
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

export function TransactionsThread({ transactions }: TransactionsThreadProps) {
  const { t } = useTranslation();
  const labels = t.tasks.details;
  const endRef = useRef<HTMLDivElement>(null);

  const orderedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [transactions],
  );

  useEffect(() => {
    if (orderedTransactions.length === 0) return;
    scrollThreadToEnd(endRef.current);
  }, [orderedTransactions.length]);

  return (
    <Thread aria-label={labels.tabs.transactions}>
      {orderedTransactions.length === 0 ? (
        <TaskDetailsTabPlaceholder
          nested
          icon={<FiDollarSign size={22} aria-hidden />}
          title={labels.tabs.transactions}
          message={labels.tabs.transactionsEmpty}
        />
      ) : (
        orderedTransactions.map((transaction) => {
          const description = transaction.description?.trim();

          return (
            <FeedItem key={transaction.id}>
              <FeedItem.Avatar>{new Initials(transaction.author).get()}</FeedItem.Avatar>
              <FeedItem.Body>
                <FeedItem.Header>
                  <FeedItem.Meta>
                    <FeedItem.Author>{transaction.author}</FeedItem.Author>
                  </FeedItem.Meta>
                  <FeedItem.Time dateTime={transaction.createdAt}>
                    {formatCommentDate(transaction.createdAt)}
                  </FeedItem.Time>
                </FeedItem.Header>

                <FeedItem.Title>
                  {formatCurrency(transaction.amount)}
                </FeedItem.Title>

                {description ? (
                  <FeedItem.Content className={styles.entryContent}>
                    {description}
                  </FeedItem.Content>
                ) : null}
              </FeedItem.Body>
            </FeedItem>
          );
        })
      )}
      {orderedTransactions.length > 0 ? (
        <div ref={endRef} aria-hidden />
      ) : null}
    </Thread>
  );
}
