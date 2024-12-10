import React from "react";
import { ReactComponent as AiIcon } from "../../assets/ai-icon.svg";
import styles from "./Thinking.scss";

const Thinking = () => {
  return (
    <div className={styles.message}>
      <div className={styles.messageWrapper}>
        <div className={styles.iconWrapper}>
          <AiIcon />
        </div>

        <div className={styles.messageCreatedAt}>
          <div className={styles.messageThinking}>thinking...</div>
        </div>
      </div>
    </div>
  );
};

export default Thinking;
