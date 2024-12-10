import React, { useState } from 'react';
import './CancellationPage.scss';

const CancellationPage = () => {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showRetentionOffer, setShowRetentionOffer] = useState(false);

  const handleCancellation = (e) => {
    e.preventDefault();
    // TODO: Implement cancellation logic
    setShowRetentionOffer(true);
  };

  const handleRetentionOffer = () => {
    // TODO: Implement retention offer acceptance logic
  };

  return (
    <div className="cancellation-page">
      <h1>We're sad to see you go</h1>
      <form onSubmit={handleCancellation}>
        <h2>Please tell us why you're leaving:</h2>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Select a reason</option>
          <option value="too_expensive">Too expensive</option>
          <option value="not_using">Not using the service enough</option>
          <option value="missing_features">Missing features</option>
          <option value="other">Other</option>
        </select>
        
        <h2>Any additional feedback?</h2>
        <textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your feedback helps us improve"
        />
        
        <button type="submit">Confirm Cancellation</button>
      </form>

      {showRetentionOffer && (
        <div className="retention-offer">
          <h2>Wait! We have a special offer for you</h2>
          <p>How about a 20% discount for the next 3 months?</p>
          <button onClick={handleRetentionOffer}>Accept Offer</button>
          <button onClick={() => setShowRetentionOffer(false)}>No, Thanks</button>
        </div>
      )}

      <div className="final-message">
        <p>We're sorry to see you go. You can always come back!</p>
        <a href="/dashboard">Return to Home</a>
      </div>
    </div>
  );
};

export default CancellationPage;