import { createBrowserRouter, Navigate } from "react-router-dom";
import Template from "../layouts/Template";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MemberIndex from "../pages/member/Index";
import BukuIndex from "../pages/buku/index";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("access_token") !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Template />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "member",
        element: <MemberIndex />
      },
      {
        path: "buku",
        element: <BukuIndex />
      }
    ]
  }
]);
