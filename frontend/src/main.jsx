import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./components/auth/Login.jsx";
import { Signup } from "./components/auth/Signup.jsx";
import { Layout } from "./components/Layout.jsx";
import { Channel } from "./components/Channel.jsx";
import { NotFound } from "./components/NotFound.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />} path="/">
          <Route index element={<App />} path="/" />
          <Route element={<Channel />} path="/channel/:id" />
          <Route path="/auth">
            <Route element={<Login />} path="/auth/login" />
            <Route element={<Signup />} path="/auth/signup" />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
