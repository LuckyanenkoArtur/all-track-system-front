import "./Title.scss";

export type TitleAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TitleProps = {
  text: string;
  className?: string;
  title?: string;
  as?: TitleAs;
  underline?: boolean;
  id?: string;
};

const TITLE_CLASS_NAME: Record<TitleAs, string> = {
  h1: "title-h1",
  h2: "title-h2",
  h3: "title-h3",
  h4: "title-h4",
  h5: "title-h5",
  h6: "title-h6",
};

export default function Title({
  text,
  className,
  title,
  as,
  underline = false,
  id,
}: TitleProps) {
  return (
    <div
      id={id}
      className={[
        as ? TITLE_CLASS_NAME[as] : "title",
        underline ? "titleUnderline" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={title}
    >
      {text}
    </div>
  );
}
