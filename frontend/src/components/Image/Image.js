import React from "react";
import styles from "./Image.scss";

export const Image = ({ url }) => {
  return (
    <div className={styles.messageWrapper}>
      {url !== "You have reached the limit for today." ? (
        <img
          className={styles.messageImg}
          src={url}
          alt="dalle generated"
          loading="lazy"
        />
      ) : (
        <p className={styles.messageText}>You have reached the limit for today.</p>
      )}
    </div>
  );
};
