import { useState, useEffect } from "react";

type themeTypes = "light" | "dark";

const useDarkMode = () => {
  // This function tries to fetch the theme from localStorage and falls back to the system theme
  const getInitialTheme = (): themeTypes => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    } else {
      return "light";
    }
  };

  const [theme, setTheme] = useState<themeTypes>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};

export default useDarkMode;
