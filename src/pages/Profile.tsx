import { useState, useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';
import '../styles/profile.scss';
import axiosInstance from '../axiosInstance';

const Profile = () => {
  const user = useAppSelector(selectUser);
  const [activeButton, setActiveButton] = useState('personal');
  const [details, setDetails] = useState<any>({});
  const [editedDetails, setEditedDetails] = useState<any>({});
  const [subscription, setSubscription] = useState<any>({});
  const [isSaveActive, setIsSaveActive] = useState(false);

  useEffect(() => {
    getDetails();
    getSubscription();
  }, []);

  const handleButtonClick = (buttonType: any) => {
    setActiveButton(buttonType);
  };

  const getDetails = async () => {
    try {
      const res = await axiosInstance.get('/get/user/', {
        params: {
          username: user.token.id,
        },
      });
      setDetails(res.data);
      setEditedDetails(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedDetails({ ...editedDetails, [name]: value });

    const isValueChanged = value !== details[name];

    setIsSaveActive(isValueChanged);
  };

  const handleSaveButton = async () => {
    try {
      const res = await axiosInstance.put(
        `/update/user/?username=${user.token.id}`,
        editedDetails
      );
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
    console.log(editedDetails);
  };

  const getSubscription = async () => {
    try {
      const res = await axiosInstance.get(`/subscriptions/${user.token.id}`);
      console.log(res.data);
      setSubscription(res.data);
    } catch (err) {
      console.log(err);
    }
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
    <div className="profile">
      <div className="account-details">
        <div>
          <h3>Account Details</h3>
          <div className="account-details-choice">
            <button
              className={activeButton === 'personal' ? 'active' : ''}
              onClick={() => handleButtonClick('personal')}
            >
              Personal Information
            </button>
            <button
              className={activeButton === 'account' ? 'active' : ''}
              onClick={() => handleButtonClick('account')}
            >
              Account Information
            </button>
          </div>
        </div>
      </div>
      <div className="account-details-content">
        {activeButton === 'personal' && (
          <div className="personal-information">
            <h2>Personal Information</h2>
            <div className="input-container">
              <label className="input-label">First Name</label>
              <input
                className="details"
                type="text"
                name="first_name"
                value={editedDetails.first_name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-container">
              <label className="input-label">Last Name</label>
              <input
                className="details"
                type="text"
                name="last_name"
                value={editedDetails.last_name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-container">
              <label className="input-label">Email</label>
              <input
                className="details"
                type="email"
                name="email"
                value={editedDetails.email || ''}
                onChange={handleInputChange}
              />
            </div>
            {/* <button
            className="save-button"
            onClick={handleSaveButton}
            disabled={!isSaveActive}
          >
            Save
          </button> */}
          </div>
        )}

        {activeButton === 'account' && (
          <div className="account-information">
            <h2>Account Information</h2>

            <div className="subscription">
              <h3>Subscription</h3>
              <div className="sub-details">
                {details.is_premium ? (
                  <div className="details">
                    {subscription.subscription_type === 'M' ? (
                      <h2>Monthly</h2>
                    ) : subscription.subscription_type === 'H' ? (
                      <h2>Half-Year</h2>
                    ) : (
                      <h2>Yearly</h2>
                    )}
                    <p className="expiry">
                      Expires on{' '}
                      <span>{formatDate(subscription.end_date)}</span>
                    </p>
                  </div>
                ) : (
                  <h1>Free</h1>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
