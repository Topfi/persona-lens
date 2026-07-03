import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@fontsource/archivo-black/400.css";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./styles/global.css";
import App from "./App";
import HomePage from "./pages/HomePage";
import ShareViewPage from "./pages/ShareViewPage";
import RedditCallbackPage from "./pages/RedditCallbackPage";
import DemoPage from "./pages/DemoPage";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/demo", element: <DemoPage /> },
      { path: "/s/:slug", element: <ShareViewPage /> },
      { path: "/reddit-callback", element: <RedditCallbackPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
