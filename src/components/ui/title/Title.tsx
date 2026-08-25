import "./Title.scss";

export type TitleAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";

export type TitleProps = {
  text: string;
  className?: string;
  title?: string;
  as?: TitleAs;
  underline?: boolean;
  id?: string;
};

export default function Title({
  text,
  className,
  title,
  as = "div",
  underline = false,
  id,
}: TitleProps) {
  const Tag = as;
  const isPageHeading = as === "div";

  return (
    <Tag
      id={id}
      className={[
        isPageHeading ? "pageHeading" : "title",
        underline ? "titleUnderline" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={title}
    >
      {text}
    </Tag>
  );
}
