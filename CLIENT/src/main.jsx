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
        toastOptions={{
          style: {
            background: "#112240",
            color: "#CCD6F6",
            border: "1px solid #00ED64",
          },
        }}
      />
      <App />
    </Provider>
  </StrictMode>,
);
