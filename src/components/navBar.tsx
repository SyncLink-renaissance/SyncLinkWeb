import { SetStateAction } from "react";
import logoText from "../assets/images/fullLogo.png";
import "../styles/default.css";
import { ConnectButton } from "./connectButton";
import { sessionDetails } from "../hooks/firebase";

interface Props {
  startConnection: boolean;
  setStartConnection: React.Dispatch<SetStateAction<boolean>>;
  sessionId: string;
  setSessionId: React.Dispatch<SetStateAction<string>>;
  connectedSessionDetails: sessionDetails | undefined;
  setConnectedSessionDetails: React.Dispatch<SetStateAction<sessionDetails | undefined>>;
  openDropDown: boolean;
  setOpenDropDown: React.Dispatch<SetStateAction<boolean>>;
}
function NavBar({
  startConnection,
  connectedSessionDetails,
  sessionId,
  setConnectedSessionDetails,
  setSessionId,
  setStartConnection,
  openDropDown,
  setOpenDropDown,
}: Props) {
  return (
    <nav className="top-0 w-full bg-backgroundLight   sm:px-6 py-5">
      <div className="container flex justify-center md:justify-between items-center ">
        <a href="#" className="flex">
          <img src={logoText} className="h-10 " />
        </a>

        {/* <button
          data-collapse-toggle="mobile-menu"
          type="button"
          className="inline-flex items-center p-2 ml-3 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded="true"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Hamburger toggled={isMobileMenuOpen} toggle={setIsMobileMenuOpen} />
        </button> */}
        <div className={` hidden w-full md:block md:w-auto`} id="mobile-menu">
          {/*${isMobileMenuOpen ? "flex" : "hidden"} */}
          <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
            <li>
              <a
                href="#"
                className="block py-2 pr-4 pl-3 text-textLight text-base font-medium  md:bg-transparent md:p-0 hover:text-Gray-950 transition-colors duration-200"
                aria-current="page">
                Connection demo
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pr-4 pl-3 text-textLight opacity-60 text-base font-medium  md:bg-transparent md:p-0 hover:text-Gray-950 transition-colors duration-200">
                Proof demo
              </a>
            </li>
          </ul>
        </div>

        <ConnectButton
          connectedSessionDetails={connectedSessionDetails}
          sessionId={sessionId}
          setConnectedSessionDetails={setConnectedSessionDetails}
          setSessionId={setSessionId}
          setStartConnection={setStartConnection}
          startConnection={startConnection}
          openDropDown={openDropDown}
          setOpenDropDown={setOpenDropDown}
        />
      </div>
    </nav>
  );
}

export default NavBar;
