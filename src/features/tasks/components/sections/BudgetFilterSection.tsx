import { useMemo } from "react";
import { NumberInput } from "@input/number-input/NumberInput";
import { Sections } from "@layout/sections/Sections";
import { useTranslation } from "../../../../i18n";
import type { TaskFilters } from "../../domain/others";
import { FaMoneyBill } from "react-icons/fa6";
import styles from "../drawers/task-filter-drawer/Drawer.module.scss";

type BudgetFilterKey = "budgetMin" | "budgetMax" | "budgetCurrency";

type BudgetFilterSectionProps = {
  filters: Pick<TaskFilters, BudgetFilterKey>;
  onChange: (partial: Partial<Pick<TaskFilters, BudgetFilterKey>>) => void;
};

export function BudgetFilterSection({
  filters,
  onChange,
}: BudgetFilterSectionProps) {
  const { t } = useTranslation();

  const fields = useMemo(
    () => [
      {
        key: "budgetMin" as const,
        label: t.tasks.budgetMin,
        placeholder: 0,
      },
      {
        key: "budgetMax" as const,
        label: t.tasks.budgetMax,
        placeholder: 10000,
      },
    ],
    [t],
  );

  return (
    <Sections.Section>
      <Sections.Section.Icon>
        <FaMoneyBill size={15} aria-hidden />
      </Sections.Section.Icon>
      <Sections.Section.Title>
        {t.tasks.filterSections.budget}
      </Sections.Section.Title>
      <Sections.Section.Content>
        <div className={styles.row}>
          {fields.map(({ key, label, placeholder }) => (
            <NumberInput
              key={key}
              icon={<FaMoneyBill />}
              label={label}
              currency={filters.budgetCurrency}
              currencyOptions={["USD", "EUR", "RUB", "GBP"]}
              onCurrencyChange={(budgetCurrency) => onChange({ budgetCurrency })}
              grouping={true}
              fractionDigits={2}
              value={filters[key]}
              onChange={(value) => onChange({ [key]: value })}
              placeholder={placeholder}
            />
          ))}
        </div>
      </Sections.Section.Content>
    </Sections.Section>
  );
}
