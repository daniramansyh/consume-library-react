import { createBrowserRouter, Navigate } from "react-router-dom";
import Template from "../layouts/Template";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MemberIndex from "../pages/member/Index";
import BukuIndex from "../pages/buku/index";
import PeminjamanIndex from "../pages/peminjaman/Index";
import DendaIndex from "../pages/denda/Index";

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
    path: "/register",
    element: <Register />
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
        path: "*",
        element: <Navigate to="/dashboard" />
      },
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
      },
      {
        path: "peminjaman",
        element: <PeminjamanIndex />
      },
      {
        path: "denda",
        element: <DendaIndex />
      }
    ]
  }
]);
