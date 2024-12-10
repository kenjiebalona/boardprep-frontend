import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUser, setPathname } from "../redux/slices/authSlice";

function PrivateRoute({ children }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const location = useLocation();
  useEffect(() => {
    dispatch(setPathname(location.pathname));
  }, [dispatch, location.pathname]);
  if (!user.isAuth) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default PrivateRoute;
