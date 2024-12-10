import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import moment from "moment";
import { Image } from "../Image/Image";
import { ReactComponent as AiIcon } from "../../assets/ai-icon.svg";
import styles from "./Message.scss";

const Message = ({ message, picUrl }) => {
  const { id, createdAt, text, ai = false, selected } = message;

  return (
    <div key={id} className={`${ai ? styles.flexRowReverse : ""} ${styles.message}`}>
      {selected === "dalle" && ai ? (
        <Image url={text} />
      ) : (
        <div className={styles.messageWrapper}>
          <ReactMarkdown
            className={`${styles.messageMarkdown} ${ai ? styles.textLeft : styles.textRight}`}
            children={text}
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "language-js");
                return !inline && match ? (
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, "")}
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}{" "}
                  </code>
                );
              },
            }}
          />
          <div className={`${ai ? styles.textLeft : styles.textRight} ${styles.messageCreatedAt}`}>
            {moment(createdAt).calendar()}
          </div>
        </div>
      )}
      <div>
        {ai ? (
          <div className={styles.aiIconWrapper}>
            <AiIcon />
          </div>
        ) : (
          <img className={styles.aiIconWrapper} loading="lazy" src={picUrl} alt="profile pic" />
        )}
      </div>
    </div>
  );
};

export default Message;
