import React from "react";

export default function Logo({
  className = "h-10 sm:h-12 w-auto text-[#049669] dark:text-white transition-colors duration-300",
}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 70"
      fill="none"
    >
      <defs>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap');
            .brevo-exact-font {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-weight: 700;
              letter-spacing: -2.5px;
            }
          `}
        </style>
      </defs>

      <text
        x="0"
        y="54"
        className="brevo-exact-font"
        fontSize="60"
        fill="currentColor"
      >
        CampusBridge
      </text>
    </svg>
  );
}
