import Title from "@primitive/title/Title.tsx";
import { useTranslation } from "../../i18n";

export default function CalendarPage() {
  const { t } = useTranslation();

  return <Title text={t.sidebar.calendar} />;
}
