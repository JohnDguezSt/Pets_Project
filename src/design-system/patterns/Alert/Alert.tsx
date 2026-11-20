import type { ReactNode } from "react";
import { getMessages } from "@/i18n";
import { Icon } from "../../icons";
import styles from "./Alert.module.css";

type AlertProps = {
  tone?: "info" | "success" | "warning" | "danger";
  title?: ReactNode;
  children?: ReactNode;
  /**
   * `polite`: se anuncia al aparecer (resultado de una acción).
   * Por defecto no se anuncia: es un aviso que ya estaba en la página.
   */
  announce?: "polite" | "off";
};

/**
 * Aviso dentro de la página. El tono se comunica con icono, texto y color,
 * nunca solo con color. Sin animaciones ni parpadeos (doc. 20 §13).
 */
export function Alert({ tone = "info", title, children, announce = "off" }: AlertProps) {
  const toneLabel = getMessages().ui.status[tone];
  return (
    <div className={styles.alert} data-tone={tone} role={announce === "polite" ? "status" : undefined}>
      <Icon name={tone} className={styles.icon} />
      <div className={styles.content}>
        {title ? (
          <p className={styles.title}>
            <span className="visuallyHidden">{toneLabel}: </span>
            {title}
          </p>
        ) : (
          <span className="visuallyHidden">{toneLabel}: </span>
        )}
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
    </div>
  );
}
