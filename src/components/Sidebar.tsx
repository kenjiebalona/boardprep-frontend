import React, { useState, ReactNode, useEffect } from 'react';
import { FaTh, FaBars, FaUser, FaSignOutAlt, FaMoneyCheckAlt, FaForumbee } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { SiGoogleclassroom } from "react-icons/si";
import { PiExam } from "react-icons/pi";
import { MdAssignment } from "react-icons/md";
import { NavLink, useNavigate } from 'react-router-dom';
import profileImage from "../assets/16.png";
import { signOut, selectUser } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { CiMedal } from "react-icons/ci";
import axiosInstance from '../axiosInstance';
import "../styles/sidebar.scss";

interface SidebarProps {
    children: ReactNode;
}

interface MenuItem {
    path: string;
    name: string;
    icon: JSX.Element;
    requiresClasses?: boolean;
}

interface Mastery {
    id: number;
    mastery_level: string;
    questions_attempted: number;
    last_updated: string;
    student: string;
    learning_objective: number;
  }

  interface Class {
    classId: number;
    className: string;
    classDescription: string;
    teacher_name: string;
    course: string;
    image: string;
    students: string[];
    classCode: string;
  }

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false); // Start closed
    const [openProfile, setOpenProfile] = useState(false);
    const [details, setDetails] = useState<any>({});
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const userType = user.token.type;
    const navigate = useNavigate();
    const [level, setLevel] = useState<string>('Beginner');
    const [hasPreassessment, setHasPreassessment] = useState(false);
     const [classes, setClasses] = useState<Class[]>([]);

    const menuItems: MenuItem[] = (() => {
        if (userType === 'T') {
            return [
                { path: "/dashboard", name: "Overview", icon: <FaTh /> },
                { path: "/classes", name: "Classes", icon: <SiGoogleclassroom /> },
            ];
        } else if (userType === 'C') {
            return [
                { path: "/dashboard", name: "Overview", icon: <FaTh /> },
                { path: "/content", name: "Content", icon: <SiGoogleclassroom /> },
                { path: "/question-bank", name: "Question Bank", icon: <MdAssignment /> },
                { path: "/mocktest", name: "Mocktest", icon: <PiExam /> },
            ];
        } else {
            return [
                { path: "/dashboard", name: "Overview", icon: <FaTh /> },
                { path: "/classes", name: "Classes", icon: <SiGoogleclassroom /> },
                { path: "/daily-challenge", name: "Challenges", icon: <TbTargetArrow /> },
                { path: "/postassessment", name: "Mocktest", icon: <PiExam />, requiresClasses: true },
            ];
        }
    })();

    useEffect(() => {
        if (!user.isAuth) {
            navigate('/home');
        }
        fetchClasses();
        fetchPreassessment();
        fetchMastery();
        getDetails();
    }, [user, navigate]);

    const fetchMastery = async () => {
        const id = user.token.id;
        try {
          const { data } = await axiosInstance.get(`/mastery/?student_id=${id}`);
          analyzeMastery(data);
          console.log(data);
        } catch (err) {
          console.log(err);
        }
      };

      const analyzeMastery = (data: Mastery[]) => {
        if (data.length === 0) return;

        let totalValue = 0;
        let count = 0;

        data.forEach((item) => {
          totalValue += parseFloat(item.mastery_level);
          count += 1;
        });

        const averageValue = totalValue / count;
        console.log("AVerage Level: ", averageValue)

        // Determine overall mastery level based on average value
        let finalMasteryLevel = 'Beginner'; // Default level
        if (averageValue >= 70) {
          finalMasteryLevel = 'Expert';
        } else if (averageValue >= 40) {
          finalMasteryLevel = 'Advanced';
        }

        setLevel(finalMasteryLevel);
        console.log(`Overall Mastery Level: ${finalMasteryLevel}`);
      };

      const fetchPreassessment = async () => {
        try {
          const response = await axiosInstance.get(
            `/studentPreassessmentAttempt/?student_id=${user.token.id}`
          );
          if (response.data.length > 0) {
            setHasPreassessment(true);
          }
        } catch (error) {
          console.error('Error fetching preassessment data:', error);
        }
      };

      const fetchClasses = async () => {
        try {
          const response = await axiosInstance.get(
            `/classes/?${user.token.type === "T" ? "teacher_id" : "student_id"}=${
              user.token.id
            }`
          );
          setClasses(response.data);
        } catch (err) {
          console.error(err);
        }
      };

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
            <div
                className={`sidebar ${isOpen ? "" : "collapsed"}`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <div className="top_section">
                    <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">BoardPrep</h1>
                    <div style={{ marginLeft: isOpen ? "28px" : "0px", marginBottom: isOpen ? "22px" : "20px" }} className="bars">
                        <FaBars />
                    </div>
                </div>
                { hasPreassessment && userType !== "T" && (
                    <div className="mastery_sidebar">
                        <div className="icon-mastery"><CiMedal /></div>
                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">Mastery Level: {level}</div>
                    </div>
                )}
                {menuItems
                .filter((item) => !(item.requiresClasses && classes.length === 0))
                .map((item, index) => (
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
