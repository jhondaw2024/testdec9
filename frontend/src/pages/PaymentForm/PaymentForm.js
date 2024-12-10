import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentForm = ({ plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState(null);

  // Retrieve token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken); // Set token if available in localStorage
      console.log("Retrieved token from localStorage:", storedToken);
    } else {
      console.log("No token found in localStorage.");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    if (!stripe || !elements) {
      setError("Stripe has not loaded.");
      setLoading(false);
      return;
    }

    try {
      // Log the initiation of the payment intent
      console.log("Creating payment intent with test Payment Method ID 'pm_card_visa'...");

      // Directly use the test Payment Method ID 'pm_card_visa' for backend request
      const response = await fetch('https://stockproject-2c1r.onrender.com/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_type: plan,
          payment_method_id: "pm_card_visa", // Use test payment method ID
        }),
      });

      const responseData = await response.json();
      const { client_secret } = responseData;

      if (response.ok) {
        // Confirm payment with Stripe using the client secret
        const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(client_secret, {
          payment_method: "pm_card_visa",
        });

        if (stripeError) {
          // setError(`Payment failed: ${stripeError.message}`);
        } else if (paymentIntent.status === "succeeded") {
          setSuccess(true);
          
        }
      } else {
        setError(responseData.detail || "Failed to create payment intent.");
      }
    } catch (err) {
      console.error("Error during payment intent creation:", err);
      setError(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div>
      {success ? (
        <div>Payment successful! Subscription activated.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Subscribe to {plan} plan</h2>
          <CardElement /> {/* You can leave this out since it's for testing */}
          {error && <div>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : `Subscribe to ${plan}`}
          </button>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
