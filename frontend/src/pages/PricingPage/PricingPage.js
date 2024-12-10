import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Check, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import PaymentForm from '../PaymentForm/PaymentForm';
import './PricingPage.scss';

const stripePromise = loadStripe("pk_test_51PaCuILCS3Ry0BK7y7OgqtacPymk8m5JcP0d87DbOkP6O1Ets6UeXk3PyijqOl2Mh9LgVRsYVNL6vkuhvtQgWiNP00ZofJCwuk")
const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("Authorization token not found");
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [plansRes, creditsRes, subRes] = await Promise.all([
          fetch('https://stockproject-2c1r.onrender.com/api/subscription/plans', { headers }),
          fetch('https://stockproject-2c1r.onrender.com/api/user/credits', { headers }),
          fetch('https://stockproject-2c1r.onrender.com/api/user/subscription', { headers }),
        ]);
        
        const plansData = await plansRes.json();
        const creditsData = await creditsRes.json();
        const subData = await subRes.json();
        
        setPlans(plansData);
        setUserCredits(creditsData.credits);
        setSubscription(subData);
      } catch (err) {
        console.error("Failed to load subscription data:", err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="container">
      {/* Credits Display */}
      <div className="credits">
        <h2 className="credits__title">Your Credits</h2>
        <div className="credits__info">
          <div className="credits__number">{userCredits}</div>
          <div className="credits__text">credits remaining</div>
        </div>
        {userCredits < 10 && (
          <Alert className="mt-4">
            <AlertTitle>Low Credits</AlertTitle>
            <AlertDescription>
              You're running low on credits. Consider upgrading your plan to continue using our services.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Subscription Plans */}
      <div className="plans-container">
        {Object.entries(plans).map(([planType, details]) => (
          <div
            key={planType}
            className={`plan ${selectedPlan === planType ? 'plan--selected' : ''}`}
            onClick={() => setSelectedPlan(planType)}
          >
            <h3 className="plan__title">{planType}</h3>
            <div className="plan__price">
              ${details.price}
              <span className="plan__frequency">
                {planType !== 'lifetime' ? `/${planType.slice(0, -2)}` : ''}
              </span>
            </div>
            <button
              className={`plan__button ${selectedPlan === planType ? 'plan__button--active' : ''}`}
            >
              {subscription?.plan_type === planType ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Initial Credits</td>
              <td>50</td>
              <td>Varies by plan</td>
            </tr>
            <tr>
              <td>Chat History Retention</td>
              <td>7 days</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Custom Chatbot Personas</td>
              <td><X className="feature__x" /></td>
              <td><Check className="feature__check" /></td>
            </tr>
            <tr>
              <td>Priority Support</td>
              <td><X className="feature__x" /></td>
              <td><Check className="feature__check" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Form */}
      {selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaymentForm plan={selectedPlan} />
        </Elements>
      )}
    </div>
  );
};

export default PricingPage;
