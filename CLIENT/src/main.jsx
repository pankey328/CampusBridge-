import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          className: "campus-toast",
          style: {
            borderRadius: "20px",
            fontSize: "13.5px",
            fontWeight: "600",
            padding: "12px 18px",
          },
          success: {
            iconTheme: {
              primary: "#049669",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4500,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <App />
    </Provider>
  </StrictMode>,
);
