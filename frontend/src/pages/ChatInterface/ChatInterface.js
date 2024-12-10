import React, {useState} from 'react'
import './ChatInterface.scss';

    

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [answerType, setAnswerType] = useState('short');

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Add message to chat history
    setChatHistory([...chatHistory, { type: 'user', content: message }]);
    // TODO: Send message to backend and get response
    setMessage('');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  return (
    <div className="chat-interface">
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <div className="controls">
          <select value={answerType} onChange={(e) => setAnswerType(e.target.value)}>
            <option value="short">Short Answer</option>
            <option value="long">Long Answer</option>
          </select>
          <button type="submit">Send</button>
          <button type="button" onClick={handleExport}>Export</button>
        </div>
      </form>
    </div>

    
  )
}

export default ChatInterface
