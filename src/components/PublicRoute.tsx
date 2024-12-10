import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";

function PublicRoute({ children }: any) {
  const user = useAppSelector(selectUser);
  if (user.isAuth) {
    const previousLocation =
      user.token.type === "C"
        ? "/content"
        : user.pathname && user.pathname !== "/content"
        ? user.pathname
        : "/dashboard"; // change lang sa inyo route pag check
    return <Navigate to={previousLocation} replace />;
  }

  return children;
}

export default PublicRoute;
