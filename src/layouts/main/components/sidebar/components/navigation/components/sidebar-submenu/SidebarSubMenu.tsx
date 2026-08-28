import type { SidebarNavItem } from "../../types/group-item";
import SidebarNode from "../sidebar-node/SidebarNode";
import styles from "./sidebar-submenu.module.scss";

type SidebarSubMenuProps = {
  children: SidebarNavItem[];
  isOpen: boolean;
  collapsed: boolean;
  depth: number;
};

export default function SidebarSubMenu({
  children,
  isOpen,
  collapsed,
  depth,
}: SidebarSubMenuProps) {
  const hidden = !isOpen || collapsed;

  return (
    <div
      className={[
        styles.subMenuWrap,
        isOpen && !collapsed ? styles.subMenuWrapOpen : "",
        collapsed ? styles.collapsed : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={hidden}
      inert={hidden}
    >
      <div className={styles.subMenuInner}>
        <div
          className={`${styles.subMenu} ${depth > 0 ? styles.subMenuNested : ""}`}
        >
          {children.map((child) => (
            <SidebarNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
