import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import "../styles/payment.scss";
import { useDispatch } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { useAppSelector } from "../redux/hooks";
import axiosInstance from "../axiosInstance";

// Replace with your Stripe public key
const stripePromise = loadStripe(
  "pk_test_51OKTa5IqhJdy9d5WDY3iC9qy1e0l2py5lbCmUNMq72gk4ZJEoZfMwQ8fADSq8PziXqOJJmvm1gQf8m1dGvW8aFTW00MlGGxUNi"
);

const Payment = () => {
  const user = useAppSelector(selectUser);
  const userName = user.token.id;
  const handleCheckout = async (
    priceId: string,
    planType: "M" | "H" | "Y",
    userName: string
  ) => {
    // Call your backend to create a checkout session
    const response = await axiosInstance.post(
      `/users/${userName}/create_payment_session/`,
      {
        priceId,
        planType,
        userName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const session = await response.data;

    // Get Stripe.js instance
    const stripe = await stripePromise;

    if (stripe) {
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.session_id,
      });

      if (result.error) {
        // Handle any errors that occur during the redirect
        console.error(result.error.message);
      }
    } else {
      console.error("Stripe couldn't be initialized.");
    }
  };

  return (
    <div className="payment-containerStyles">
      <div className="payment-shokoy">
        <h2>Pricing plans for all subscriptions</h2>
        <p className="p-payment">Choose an affordable plan that’s packed with the best features <br/>for engaging your audience.</p>
        <div className="payment-cardStyles-container">
          <div className="payment-cardStyles">
            <h3>Moissanite</h3>
            <p>The essentials to provide your best tools for learning.</p>
            <p>
              <span className="payment-value">₱100</span>/month
            </p>
            {/* Pass 'M' for monthly */}
            <button
              className="payment-buttonStyles"
              onClick={() =>
                handleCheckout("price_1OKX1fIqhJdy9d5WdIDKTK3f", "M", userName)
              }
            >
              Buy Monthly Plan
            </button>
          </div>
          <div className="payment-cardStyles">
            <h3>Diamond</h3>
            <p>A plan that scales with your rapidly growing learning.</p>
            <p>
              <span className="payment-value">₱250</span>/month
            </p>
            {/* Pass 'H' for half-yearly */}
            <button
              className="payment-buttonStyles"
              onClick={() =>
                handleCheckout("price_1OKX2fIqhJdy9d5WMiBbbrMg", "H", userName)
              }
            >
              Buy 6 Months Plan
            </button>
          </div>
          <div className="payment-cardStyles">
            <h3>Topaz</h3>
            <p>Dedicated support and boost your learning.</p>
            <p>
              <span className="payment-value">₱450</span>/month
            </p>
            {/* Pass 'Y' for yearly */}
            <button
              className="payment-buttonStyles"
              onClick={() =>
                handleCheckout("price_1OKX3eIqhJdy9d5W1jSpjSjd", "Y", userName)
              }
            >
              Buy Yearly Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
