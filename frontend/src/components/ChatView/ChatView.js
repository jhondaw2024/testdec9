import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../ChatContext/ChatContext";
import { sendMessageToBot } from "../../services/message.service";
import { ChatIntro } from "../ChatIntro/ChatIntro";
import { ChatMessages } from "../ChatMessages/ChatMesages";
import { ChatForm } from "../ChatForm/ChatForm";
import  "./ChatView.scss";

const ChatView = () => {
  const inputRef = useRef();
  const [formValue, setFormValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const { messages, addMessage, setLimit } = useContext(ChatContext);


  const options = [
    { value: "ChatGPT", label: "ChatGPT" },
    { value: "DALL·E", label: "DALL·E" },
  ];
  const [selected, setSelected] = useState(options[0].value);

  const picUrl = "https://via.placeholder.com/150"; // Default profile picture
  const user_id = "123456789"; // Default user ID

  const updateMessage = (formValue, ai, aiModel) => {
    const id = Date.now() + Math.floor(Math.random() * 1000000);
    const newMsg = {
      id: id,
      createdAt: Date.now(),
      text: formValue,
      ai: ai,
      selected: `${aiModel}`,
    };

    addMessage(newMsg); 
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!formValue) {
      return;
    }

    updateMessage(formValue, false, selected);
    setFormValue("");
    setThinking(true);

    const aiModel = selected === options[0].value ? "davinci" : "dalle";

    const { data, error } = await sendMessageToBot(null, {
      prompt: formValue,
      user: user_id,
      aiModel: aiModel,
    });

    if (error) {
      const message = error.status === 429 ? "You have reached the limit for today." : "Something went wrong. Please try again later.";
      if (error.status === 429) setLimit(0);
      updateMessage(message, true, aiModel);
      setThinking(false);
      return;
    }

    const message = data?.bot;
    updateMessage(message, true, aiModel);
    setLimit(data.limit);
    setThinking(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="chatView">
      {Array.isArray(messages) && messages.length === 0 ? (
        <ChatIntro
          title={"GPT Chat"}
          setTemplateQuestion={setFormValue}
          className="chatIntro"
        />
      ) : (
        <ChatMessages
          messages={Array.isArray(messages) ? messages : []} // Ensure messages is an array
          thinking={thinking}
          picUrl={picUrl}
          className="chatMessages"
        />
      )}

      <ChatForm
        inputRef={inputRef}
        formValue={formValue}
        setFormValue={setFormValue}
        sendMessage={sendMessage}
        options={options}
        selected={selected}
        setSelected={setSelected}
        className="chatForm"
      />
    </div>
  );
};

export default ChatView;
