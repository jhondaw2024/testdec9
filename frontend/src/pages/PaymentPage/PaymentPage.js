import React from 'react';
import './PaymentPage.scss';

const PaymentsPage = () => {
  const plans = [
    { name: 'Free', credits: 50, price: 0 },
    { name: 'Weekly', credits: 100, price: 9.99 },
    { name: 'Monthly', credits: 500, price: 29.99 },
    { name: 'Yearly', credits: 6000, price: 299.99 },
    { name: 'Lifetime', credits: 'Unlimited', price: 999.99 },
  ];

  return (
    <div className="payments-page">
      <h1>Subscription Plans</h1>
      
      <div className="plan-comparison">
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Credits</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={index}>
                <td>{plan.name}</td>
                <td>{plan.credits}</td>
                <td>${plan.price}</td>
                <td>
                  {plan.price > 0 ? (
                    <button className="upgrade-btn">Upgrade</button>
                  ) : (
                    'Current Plan'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="features-breakdown">
        <h2>Features</h2>
        <ul>
          <li>Longer chat history retention</li>
          <li>Priority support</li>
          <li>Custom chatbot personas</li>
          <li>Specialized investment tools</li>
        </ul>
      </div>

      <div className="payment-form">
        <h2>Secure Payment</h2>
        <form>
          <input type="text" placeholder="Card Number" required />
          <input type="text" placeholder="MM/YY" required />
          <input type="text" placeholder="CVC" required />
          <button type="submit">Process Payment</button>
        </form>
      </div>
    </div>
  );
};

export default PaymentsPage;