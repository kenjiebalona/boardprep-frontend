import React, { useState, ReactNode, useEffect } from 'react';
import { FaTh, FaBars, FaUser, FaSignOutAlt, FaMoneyCheckAlt, FaForumbee } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { SiGoogleclassroom } from "react-icons/si";
import { MdAssignment } from "react-icons/md";
import { PiExam } from "react-icons/pi";
import { NavLink, useNavigate } from 'react-router-dom';
import profileImage from "../assets/16.png";
import { signOut, selectUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import axiosInstance from '../axiosInstance';
import "../styles/sidebar.scss";

interface SidebarProps {
    children: ReactNode;
}

interface MenuItem {
    path: string;
    name: string;
    icon: JSX.Element;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [openProfile, setOpenProfile] = useState(false);
    const [details, setDetails] = useState<any>({});
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const userType = user.token.type;
    const navigate = useNavigate();
    const toggle = () => setIsOpen(!isOpen);

    const menuItems: MenuItem[] = (() => {
        if (userType === 'T') {
            return [
                { path: "/dashboard", name: "Overview", icon: <FaTh /> },
                { path: "/classes", name: "Classes", icon: <SiGoogleclassroom /> },
                { path: "/assignments", name: "Assignments", icon: <MdAssignment /> },
                { path: "/exams", name: "Exams", icon: <PiExam /> },
            ];
        } else if (userType === 'C') {
            return [
                { path: "/dashboard", name: "Overview", icon: <FaTh /> },
                { path: "/content", name: "Content", icon: <SiGoogleclassroom /> },
                { path: "/assignments", name: "Question Bank", icon: <MdAssignment /> },
            ];
        } else {
            return [
                { path: "/dashboard", name: "Overview", icon: <FaTh /> },
                { path: "/classes", name: "Classes", icon: <SiGoogleclassroom /> },
                { path: "/assignments", name: "Assignments", icon: <MdAssignment /> },
                { path: "/exams", name: "Exams", icon: <PiExam /> },
                { path: "/challenges", name: "Challenges", icon: <TbTargetArrow /> },
            ];
        }
    })();

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
        <div className="container">
            <div className={`sidebar ${isOpen ? "" : "collapsed"}`}>
                <div className="top_section">
                    <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">BoardPrep</h1>
                    <div style={{ marginLeft: isOpen ? "28px" : "0px", marginBottom: isOpen ? "22px" : "20px" }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {menuItems.map((item, index) => (
                    <NavLink 
                        to={item.path} 
                        key={index} 
                        className={({ isActive }) => isActive ? "link active" : "link"}
                    >
                        <div className="icon">{item.icon}</div>
                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
                    </NavLink>
                ))}
                <div className="profile-container" style={{ marginTop: 'auto' }}>
                    <div style={{ display: isOpen ? "block" : "block" }} className="profile-pic2">
                        <img
                            src={profileImage}
                            className="logo"
                            alt="Profile"
                            onClick={() => setOpenProfile((prev) => !prev)}
                        />
                        <span style={{ display: isOpen ? "block" : "none" }} className="profile-name">
                            {details.first_name} {details.last_name}
                        </span>
                        {openProfile && (
                            <div className={`dropDownProfile ${isOpen ? "" : "collapsed"}`}>
                                <ul className="d-items">
                                    <li className="d-item" onClick={handleProfile}>
                                        <FaUser className="icon-two" /> 
                                        <span style={{ display: isOpen ? "block" : "none" }} className="link_text-two">Profile</span>
                                    </li>
                                    <li className="d-item" onClick={handleForum}>
                                        <FaForumbee className="icon-two" /> 
                                        <span style={{ display: isOpen ? "block" : "none" }} className="link_text-two">Forum</span>
                                    </li>
                                    {!details.is_premium && userType === 'S' && (
                                        <li className="d-item" onClick={handlePayment}>
                                            <FaMoneyCheckAlt className="icon-two" /> 
                                            <span style={{ display: isOpen ? "block" : "none" }} className="link_text-two">Upgrade</span>
                                        </li>
                                    )}
                                    <li className="d-item" onClick={handleLogout}>
                                        <FaSignOutAlt className="icon-two" /> 
                                        <span style={{ display: isOpen ? "block" : "none" }} className="link_text-two">Logout</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <span style={{ display: isOpen ? "block" : "none" }} className="profile-name-unique">
                        {details.user_name} 
                    </span>
                </div>
            </div>
            <main className="main-content">{children}</main>
        </div>
    );
};

export default Sidebar;
