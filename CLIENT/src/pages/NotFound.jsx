import React from "react";
import Logo from "./Logo";

const NotFound = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F1] dark:bg-slate-950 transition-colors duration-300 selection:bg-[#B6F596] selection:text-[#034D35]">
      {/* Logo Area */}
      <header className="px-6 py-6 lg:px-12 lg:py-8 w-full">
        <Logo className="h-8 lg:h-10 w-auto text-[#034D35] dark:text-white transition-colors duration-300" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12 lg:px-24 w-full max-w-[1400px] mx-auto gap-12 lg:gap-20">
        {/* Left Column: Typography & Actions */}
        <div className="flex-1 w-full max-w-xl space-y-6 z-10 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#121212] dark:text-white tracking-tight leading-[1.1]">
            Hmmm. Looks like nothing's growing here yet..
          </h1>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            The URL you entered doesn't exist on our site yet. If you're looking
            for a specific page, it might have been moved or deleted. Otherwise,
            maybe check your spelling? Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-extrabold text-[#121212] dark:text-white bg-transparent border-2 border-gray-300 hover:border-[#121212] dark:border-slate-700 dark:hover:border-white transition-all active:scale-95"
            >
              Go back
            </button>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg lg:max-w-xl relative flex items-center justify-center">
          <svg
            className="w-full h-auto drop-shadow-sm"
            viewBox="0 0 500 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M400,100 C400,100 430,130 430,180 C430,230 400,280 370,260 C340,240 370,140 400,100 Z"
              fill="#B6F596"
              opacity="0.6"
            />

            <path
              d="M120,150 C90,120 40,140 60,180 C80,220 130,230 150,200 C170,170 150,180 120,150 Z"
              stroke="#034D35"
              strokeWidth="2"
              fill="none"
              className="dark:stroke-[#B6F596]"
            />

            <path
              d="M180,300 C140,320 120,360 160,380 C200,400 240,380 250,340 C260,300 220,280 180,300 Z"
              fill="#034D35"
              className="dark:fill-[#B6F596]"
            />

            <path
              d="M280,320 C320,340 360,330 380,300 C400,270 380,240 340,250 C300,260 240,300 280,320 Z"
              fill="#B6F596"
              opacity="0.8"
            />

            <circle
              cx="280"
              cy="120"
              r="15"
              fill="#034D35"
              className="dark:fill-[#B6F596]"
            />
            <path
              d="M290,110 L340,130 L310,160 Z"
              fill="#F9F7F1"
              stroke="#034D35"
              strokeWidth="2"
              className="dark:stroke-[#B6F596] dark:fill-slate-950"
            />

            <path
              d="M370,330 Q375,345 390,350 Q375,355 370,370 Q365,355 350,350 Q365,345 370,330 Z"
              stroke="#034D35"
              strokeWidth="1.5"
              fill="none"
              className="dark:stroke-[#B6F596]"
            />

            <text
              x="50%"
              y="58%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="180"
              letterSpacing="-8px"
              fill="#034D35"
              className="dark:fill-white"
            >
              404
            </text>

            <path
              d="M220,210 C260,180 280,150 270,120 C260,90 220,110 200,150 C180,190 180,240 220,210 Z"
              fill="#B6F596"
              opacity="0.4"
              style={{ mixBlendMode: "multiply" }}
            />
          </svg>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
