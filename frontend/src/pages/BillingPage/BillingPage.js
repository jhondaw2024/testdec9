import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './BillingPage.scss';
import {Link } from "react-router-dom"

const BillingPage = () => {
  const [currentPlan, setCurrentPlan] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const token = localStorage.getItem('token'); // Use the token from local storage

  const fetchCurrentPlan = useCallback(async () => {
    try {
      const response = await axios.get('http://100.26.44.242:8000/billing/current-plan', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentPlan(response.data);
    } catch (error) {
      console.error("Error fetching current plan:", error);
    }
  }, [token]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/billing/payment-methods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaymentMethods(response.data.payment_methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get('http://54.147.36.203:8000/billing/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentPlan();
    fetchPaymentMethods();
    fetchTransactions();
  }, [fetchCurrentPlan, fetchPaymentMethods, fetchTransactions]);

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://54.147.36.203:8000/billing/payment-methods',
        { paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchPaymentMethods(); // Refresh the payment methods
    } catch (error) {
      console.error("Error adding payment method:", error);
    }
  };

  const handleDownloadPDF = async (transactionId) => {
    try {
      const response = await axios.get(`http://54.147.36.203:8000/billing/transactions/${transactionId}/download-pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for downloading files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="billing-page">
      <h1>Billing & Invoices</h1>

      <div className="plan-payment-section">
        <section className="current-plan">
          <h2>Current Plan</h2>
          <p>Plan: {currentPlan.name}</p>
          <p>Price: ${currentPlan.price}/month</p>
          <p>Next Billing Date: {new Date(currentPlan.nextBillingDate * 1000).toLocaleDateString()}</p>
          
          <Link to="/pricing"><button>Update Plan</button></Link>
        </section>

        {/* <section className="payment-methods"> */}
          {/* <h2>Payment Methods</h2> */}
          {/* <form onSubmit={handleAddPaymentMethod}>
            <input
              type="text"
              placeholder="Card Number"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <button type="submit">Add Payment Method</button>
          </form> */}
          {/* <ul>
            {paymentMethods.map((pm) => (
              <li key={pm.id}>
                {pm.brand} ****{pm.last4}, Exp: {pm.exp_month}/{pm.exp_year}
              </li>
            ))}
          </ul>
        </section> */}
      </div>

      <section className="transaction-history">
        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date * 1000).toLocaleDateString()}</td>
                <td>${transaction.amount}</td>
                <td>{transaction.status}</td>
                <td>
                  <button className="download-btn" onClick={() => handleDownloadPDF(transaction.id)}>
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="refund-policy">
        <h2>Refund Policy</h2>
        <p>
          We offer a 30-day money-back guarantee on all subscriptions. If you're not satisfied with our service,
          please contact our support team for a full refund within 30 days of your purchase.
        </p>
      </section>
    </div>
  );
};

export default BillingPage;
