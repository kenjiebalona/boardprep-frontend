import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dropdown.scss';
import { signOut, selectUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useDispatch } from 'react-redux';
import axiosInstance from '../axiosInstance';

const DropDownProfile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userType = user.token.type;
  const [details, setDetails] = React.useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.isAuth) {
      navigate('/home');
    }
    getDetails();
  }, [user, navigate]);

  const handleLogout = async (e: any) => {
    e.preventDefault();

    try {
      dispatch(signOut());
    } catch (err) {
      console.log('Error:', err); // Log any errors
    }
  };

  const getDetails = async () => {
    try {
      const res = await axiosInstance.get('/get/user/', {
        params: {
          username: user.token.id,
        },
      });
      setDetails(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePayment = () => {
    navigate('/payment');
  };

  const handleForum = () => {
    navigate('/forum');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="flex flex-col dropDownProfile">
      <ul className="d-items">
        <li className="d-item" onClick={handleProfile}>
          Profile
        </li>
        <li className="d-item" onClick={handleForum}>
          Forum
        </li>
        {!details.is_premium && userType === 'S' && (
          <li className="d-item" onClick={handlePayment}>
            Upgrade
          </li>
        )}
        <li className="d-item" onClick={handleLogout}>
          Logout
        </li>
      </ul>
    </div>
  );
};

export default DropDownProfile;
