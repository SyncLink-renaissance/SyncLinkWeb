import { useEffect, useState } from "react";
import logoText from "../assets/images/fullLogo.png";
import comingSoonBack from "../assets/images/comingSoonBack.png";
import xTwitterIcon from "../assets/images/xTwitterIcon.png";

import { ArrowRight, Check } from "lucide-react";
import { registerMailToUpdates } from "../hooks/firebase";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "SyncLink App";
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setError(""); // Clear error when input changes
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registered) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      if (!(await registerMailToUpdates(email))) {
        throw new Error("Error registering");
      }
      setRegistered(true);
    } catch (error) {
      console.error(error);
      alert("Error registering");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${comingSoonBack})`,
        backgroundPosition: "center",
      }}
      className="flex flex-col w-screen min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
      <nav className="top-0 w-full bg-transparent px-4 sm:px-6 py-5">
        <div className="container flex justify-between items-center mx-auto">
          <a href="" className="flex">
            <img src={logoText} className="h-10" alt="Logo" />
          </a>

          <div className="hidden md:flex md:w-auto" id="mobile-menu">
            {/*${isMobileMenuOpen ? "flex" : "hidden"} */}
            <ul className="flex mt-4 space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li>
                <a
                  href="#"
                  className="block py-2 pr-4 pl-3 text-textLight text-base font-medium hover:text-Gray-950 transition-colors duration-200"
                  aria-current="page">
                  {/* Connection demo */}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 pr-4 pl-3 text-textLight opacity-60 text-base font-medium hover:text-Gray-950 transition-colors duration-200">
                  {/* Proof demo */}
                </a>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-2 md:gap-9">
            <a href="https://twitter.com/sync_link" target="_blank">
              <img src={xTwitterIcon} className="h-4" alt="Twitter Icon" />
            </a>
            <a
              href="https://cal.com/synclink/synclink-meeting"
              target="_blank"
              className="flex px-3 md:px-7 py-3 bg-primary hover:bg-primary-700 text-backgroundLight rounded-2xl border-backgroundLight transition duration-200 ease-in-out">
              <h1 className="text-center text-sm md:text-base font-medium">Book a demo</h1>
            </a>
          </div>
        </div>
      </nav>

      <div className="flex flex-col justify-center items-center pt-48 pb-4 mx-auto max-w-4xl">
        {/* Top padding is based on navbar height */}
        <h1 className="text-textLight opacity-60 text-center font-medium">Coming soon!!!</h1>
        <h1 className=" text-lg md:text-2xl text-primary text-center font-semibold my-2">
          The Future of wallet connectivity
        </h1>
        <p className="text-3xl md:text-4xl mb-14 text-textLight text-center font-medium">
          All your wallets, all your dApp connections, seamlessly united under one digital roof
        </p>
        <h1 className={`text-textLight opacity-80 text-center font-medium ${registered && "mb-3"}`}>
          {registered ? "You are signed up for SyncLink updates :)" : " Want to test SyncLink before everyone else?"}
        </h1>
        {!registered && (
          <h1 className="text-sm text-textLight opacity-60 text-center font-medium mb-5">Sign up here for updates</h1>
        )}
        {/* Email Form */}
        <form
          onSubmit={handleSubmit}
          className={`flex bg-backgroundLight border rounded-xl items-center w-full max-w-md ${
            error && "border-ourRed"
          }`}>
          <input
            type="text"
            placeholder="Enter email address..."
            className="flex-1 h-12 bg-backgroundLight text-textLight font-medium px-4 rounded-l-xl focus:outline-none"
            value={email}
            onChange={handleChange}
            disabled={registered}
          />
          <button
            type="submit"
            className="btn bg-primary hover:bg-primary-700 transform duration-200 text-white font-bold h-12 px-4 rounded-r-xl">
            {registered ? <Check /> : <ArrowRight />}
          </button>
        </form>
        {error && <p className="text-ourRed mt-2">{error}</p>} {/* Display error message */}
      </div>
    </div>
  );
};

export default ComingSoon;
