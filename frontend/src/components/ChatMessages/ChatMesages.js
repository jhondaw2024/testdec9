import React, { useEffect, useRef } from "react";
import Message from "../Message/Message";
import Thinking from "../Thinking/Thinking";
import styles from "./ChatMessages.scss";

export const ChatMessages = ({ messages, thinking, picUrl }) => {
  const messagesEndRef = useRef();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatMessages}>
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <Message key={message.id} message={message} picUrl={picUrl} />
        ))}

        {messages.length > 0 && thinking && <Thinking />}

        <span ref={messagesEndRef}></span>
      </div>
    </div>
  );
};
