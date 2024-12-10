import React, { useState } from "react";
import "./SupportPage.scss";
import {Link} from "react-router-dom"

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
    comment: "",
  });

  const [contactFormVisible, setContactFormVisible] = useState(false);

  // Mock data
  const faqTopics = [
    { id: "account", name: "Account Issues" },
    { id: "chatbot", name: "Chatbot Usage Tips" },
    { id: "subscription", name: "Subscription Management" },
    { id: "billing", name: "Billing Questions" },
  ];

  const faqs = [
    {
      id: 1,
      topic: "account",
      question: "How do I reset my password?",
      answer:
        'You can reset your password by clicking on the "Forgot Password" link on the login page.',
    },
    {
      id: 2,
      topic: "chatbot",
      question: "How do I start a new chat?",
      answer:
        'To start a new chat, click on the "New Chat" button on your dashboard.',
    },
    {
      id: 3,
      topic: "subscription",
      question: "How do I upgrade my plan?",
      answer:
        "You can upgrade your plan by going to the Payments page and selecting a new plan.",
    },
    {
      id: 4,
      topic: "billing",
      question: "When will I be charged?",
      answer:
        "You will be charged on the same day each month, based on your subscription start date.",
    },
  ];

  //issue options
  const issueOptions = [
    "Positive Feedback",
    "Billing",
    "I have a question",
    "General Support",
    "Other",
  ];

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSupport = (e) => {
    e.preventDefault();
    // Send the contact form data to the backend
    fetch("https://stockproject-2c1r.onrender.com/api/contact-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm),
    }).then((response) => {
      if (response.ok) {
        alert("Your message has been sent!");
      } else {
        alert("Failed to send message.");
      }
    });
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTopic ? faq.topic === selectedTopic : true)
  );

  return (
    <div className="support-page">
      <h1>Support & Help Center</h1>

      <section className="search-bar">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </section>

      <section className="help-topics">
        <h2>Help Topics</h2>
        <div className="topic-buttons">
          {faqTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={selectedTopic === topic.id ? "active" : ""}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </section>

      <section className="faq-list">
        <h2>Frequently Asked Questions</h2>
        {filteredFaqs.map((faq) => (
          <div key={faq.id} className="faq-item">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>
   
      <button
  className="contact-support-button"
  onClick={() => setContactFormVisible(true)}
>
  Contact Support
</button>

      {contactFormVisible && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setContactFormVisible(false)}
            >
              &times;
            </span>
            <h2>Contact Support</h2>
            <form onSubmit={handleContactSupport}>
              <input
              className="box"
                type="text"
                name="name"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={handleContactFormChange}
                required
              />
              <input
              className="box"
                type="email"
                name="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={handleContactFormChange}
                required
              />
              <input
              className="box"
                type="tel"
                name="phone"
                placeholder="Your Phone (optional)"
                value={contactForm.phone}
                onChange={handleContactFormChange}
              />
              <select
                name="issue"
                value={contactForm.issue}
                onChange={handleContactFormChange}
                required
              >
                <option value="">Select an issue</option>
                {issueOptions.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {contactForm.issue === "Other" && (
                <textarea
                  name="comment"
                  placeholder="Describe your issue"
                  value={contactForm.comment}
                  onChange={handleContactFormChange}
                  required
                />
              )}
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}

      <section className="live-chat">
        <h2>Premium Support</h2>
        <p>As a premium user, you have access to our live chat support.</p>
        <Link to="/chat"><button>Start Live Chat</button></Link>
        
      </section>

      <section className="tutorial-videos">
        <h2>Tutorial Videos</h2>
        <div className="video-list">
          <div className="video-item">
            <h3>Getting Started</h3>
            <div className="video-placeholder">Video Player Placeholder</div>
          </div>
          <div className="video-item">
            <h3>Advanced Features</h3>
            <div className="video-placeholder">Video Player Placeholder</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
