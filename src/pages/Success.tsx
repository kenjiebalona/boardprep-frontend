import React, { useState, useEffect } from 'react';
import '../styles/success.scss';
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  interface SubscriptionData {
    subscriptionID: number;
    subscription_type: string;
    start_date: string;
    end_date: string;
    user: string;
  }

  const user = useAppSelector(selectUser);
  const userName = user.token.id; // Ensure this is the correct identifier for the user
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const res = await axiosInstance(`/subscriptions/${userName}/`);
      setSubscription(res.data);
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    }
  };

  const handleButtonClick = () => {
    navigate('/classes');
  };

  const formatDate = (dateString: any) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="success-containerStyles">
      <div className="success-shokoy">
        <h2>Payment Successful!</h2>
        <div className="success-cardStyles centered-content">
          {subscription ? (
            <div className="subscription-detalye">
              <p>
                Subscription Type:{' '}
                {subscription.subscription_type === 'M'
                  ? 'Monthly'
                  : subscription.subscription_type === 'H'
                  ? 'Half-Year'
                  : 'Yearly'}
              </p>
              <p>Start Date: {formatDate(subscription.start_date)}</p>
              <p>End Date: {formatDate(subscription.end_date)}</p>
              <button className="bittin" onClick={handleButtonClick}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            <p>Loading subscription details...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;
