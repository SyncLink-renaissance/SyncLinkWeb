import SyncLinkFull from "../assets/images/fullLogo.png";
import peerLinkLogoRounded from "../assets/logoRounded.png";
import appstoreIcon from "../assets/images/appstoreIcon.svg";
import googleplayIcon from "../assets/images/googleplayIcon.svg";
import solflareIcon from "../assets/images/solflareIcon.svg";
import phantomIcon from "../assets/images/phantomIcon.svg";

import { SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  createSession,
  deleteSessionById,
  deleteSessionToUser,
  getCategoryDetails,
  getUserConnectedWallets,
  sessionDetails,
  setconnectedWallet,
} from "../hooks/firebase";
import { Check, ChevronDown, Copy, XCircle } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const generateSessionId = () => {
  // Generate a new UUID
  const newSessionId = uuidv4();
  return newSessionId;
  // Here, you would also handle storing the new session ID in your database
  // and any other logic needed to create a new session
};

function shortenSolanaAddress(address: string): string {
  // Check if the address length is more than 8 characters to require shortening
  if (address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  } else {
    // If the address is already short, return it as is
    return "Undifined";
  }
}
const walletsIcons: { [key: string]: any } = {
  solflare: solflareIcon,
  phantom: phantomIcon,
};

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
export const ConnectButton = ({
  connectedSessionDetails,
  sessionId,
  setConnectedSessionDetails,
  setSessionId,
  setStartConnection,
  startConnection,
  openDropDown,
  setOpenDropDown,
}: Props) => {
  const [genratingSession, setGenratingSession] = useState(false);
  console.log(genratingSession);
  const [categoryDetails, setCategoryDetails] = useState<{
    category: string;
    color: string;
    wallets: { name: string; pk: string; session: string; sharedSecret: string }[];
  }>();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUseMobile, setIsUseMobile] = useState(true);
  const toggleModal = () => setModalOpen(!isModalOpen);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setOpenDropDown(!isDropdownOpen);
  };

  useEffect(() => {
    if (openDropDown) {
      setIsDropdownOpen(true);
    }
  }, [openDropDown]);

  const [copiedIndex, setCopiedIndex] = useState(-1);
  /*Connect & disconnect Modal handling */

  const connectSession = async () => {
    setGenratingSession(true);
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    const linkElements = document.getElementsByTagName("link");
    let icon = "";
    for (let i = 0; i < linkElements.length; i++) {
      const relValue = linkElements[i].rel.toLowerCase();
      if (relValue.includes("icon")) {
        icon = linkElements[i].href;
      }
    }
    const status = await createSession(newSessionId, window.location.hostname, icon, document.title);
    console.log("status:", status);
    setGenratingSession(false);

    toggleModal();
  };
  const closeModalAndResetSession = async () => {
    console.log("Session id is,", sessionId);
    const status = await deleteSessionById(sessionId);
    console.log("status:", status);
    setSessionId("");
    setModalOpen(false);
    setStartConnection(false);
  };

  //disconnect from dapp
  const disconnect = async () => {
    const statusA = await deleteSessionById(sessionId);
    const statusB = await deleteSessionToUser(sessionId, connectedSessionDetails?.ConnectedUserId || "");
    if (!statusA || !statusB) {
      alert("Error disconnecting");
      return;
    }
  };

  // get category wallets
  useEffect(() => {
    const fetchCategoryWallets = async () => {
      console.log("fetching");
      if (!connectedSessionDetails) return;
      console.log("fetching for real", connectedSessionDetails.connectedCategory);
      if (connectedSessionDetails.connectedCategory === "All") {
        const connectedW = await getUserConnectedWallets(connectedSessionDetails.ConnectedUserId);
        setCategoryDetails({
          category: "All",
          color: "",
          wallets: JSON.parse(connectedW),
        });
        return;
      }
      const tCategoryDetails = await getCategoryDetails(
        connectedSessionDetails.ConnectedUserId,
        connectedSessionDetails.connectedCategory
      );
      console.log("tCategoryDetails", tCategoryDetails);
      setCategoryDetails({
        category: tCategoryDetails.category,
        color: tCategoryDetails.color,
        wallets: JSON.parse(tCategoryDetails.wallets),
      });
    };
    fetchCategoryWallets();
  }, [connectedSessionDetails]);
  /* Connection listner*/

  useEffect(() => {
    if (!sessionId) {
      console.log("Session id empty");
      return;
    }

    console.log("Setting up listener for session:", sessionId);
    const documentRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(
      documentRef,
      (doc) => {
        if (doc.exists()) {
          console.log("doc alright");
          const sessionDetails = doc.data();
          console.log("doc det:", sessionDetails);
          const pk = sessionDetails.connectedWallet?.pk;
          const connectedCategory = sessionDetails.connectedCategories[0];
          if (pk) {
            const sessionD = {
              selected_wallet: {
                pk: sessionDetails.connectedWallet?.pk,
                walletApp: sessionDetails.connectedWallet?.walletApp,
              },
              connectedCategory: connectedCategory,
              session: sessionId,
              ConnectedUserId: sessionDetails?.ConnectedUserId,
            };
            setConnectedSessionDetails(sessionD);
            localStorage.setItem("connectedSession", JSON.stringify(sessionD));
            setModalOpen(false);
            setStartConnection(false);
          }
          console.log("Connected wallet: ", sessionDetails.connectedWallet?.pk);
        } else {
          console.log("No such document/disconnected!");
          setConnectedSessionDetails(undefined);
          setModalOpen(false);
          setStartConnection(false);
          localStorage.removeItem("connectedSession");
        }
      },
      (error) => {
        console.log("Error getting document:", error);
      }
    );

    return () => {
      // Clean up the listener when the component unmounts or sessionId changes
      unsubscribe();
    };
  }, [sessionId]);

  useEffect(() => {
    if (startConnection && !connectedSessionDetails) {
      connectSession();
    }
  }, [startConnection]);

  return (
    <>
      {!connectedSessionDetails ? (
        <button
          onClick={connectSession}
          className="flex flex-row px-7 py-3 bg-textLight text-backgroundLight rounded-2xl   border-backgroundLight transition duration-150 ease-in-out">
          <h1 className="text-center text-base text-backgroundLight font-medium">Connect</h1>
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => toggleDropdown()}
            className="flex flex-row items-center px-3 py-3 bg-textLight text-backgroundLight rounded-xl  ">
            <img src={walletsIcons[connectedSessionDetails.selected_wallet?.walletApp]} className="w-6 h-6" />
            <h1 className="ml-2 text-left text-base text-backgroundLight font-medium">
              {shortenSolanaAddress(connectedSessionDetails.selected_wallet?.pk)}
            </h1>
            <ChevronDown className="ml-3" color="white" />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-96 px-4 py-5 bg-boxesLight rounded-2xl mt-2 right-0">
              <div className="flex flex-row  justify-between items-center mb-5">
                <div
                  className={`flex flex-row  rounded-full px-3 py-1 justify-center items-center ${
                    categoryDetails?.category === "All" && "bg-boxesLight-50"
                  }`}
                  style={{
                    backgroundColor: `${categoryDetails?.category != "All" && `${categoryDetails?.color}35`}`,
                  }}>
                  <div
                    className={`w-2 h-2 rounded-full ${categoryDetails?.category === "All" && "bg-textLight"}`}
                    style={{
                      backgroundColor: `${categoryDetails?.category != "All" && `${categoryDetails?.color}`}`,
                    }}
                  />
                  <h1
                    className={`text-sm font-medium ml-1 ${categoryDetails?.category === "All" && "text-textLight"}`}
                    style={{
                      color: `${categoryDetails?.category != "All" && `${categoryDetails?.color}`}`,
                    }}>
                    {categoryDetails?.category}
                  </h1>
                </div>

                <div className="bg-gray-300 rounded-full flex">
                  {/* Mobile button */}
                  <div
                    className={`w-1/2 text-center text-textLight font-medium text-sm px-3  rounded-full transition cursor-pointer ${
                      isUseMobile ? "bg-white py-1" : "py-1"
                    }`}
                    onClick={() => setIsUseMobile(true)}>
                    Mobile
                  </div>

                  {/* Browser button */}
                  <div
                    className={`w-1/2 text-center text-textLight font-medium text-sm px-3 rounded-full transition cursor-pointer ${
                      !isUseMobile ? "bg-white py-1" : "py-1"
                    }`}
                    onClick={() => alert("Soon!!!")}>
                    Browser
                  </div>
                </div>
              </div>
              <div className="max-h-36 overflow-y-auto mb-7 custom-rounded-scrollbar">
                {categoryDetails?.wallets.map((wallet, index) => (
                  <div
                    key={index}
                    className={`flex flex-row items-center mb-2 px-1 cursor-pointer rounded-lg py-1 hover:bg-boxesLight-200 ${
                      wallet.pk === connectedSessionDetails.selected_wallet.pk ? "bg-boxesLight-50" : ""
                    }`}
                    onClick={async () => {
                      // Assuming toggleDropdown should be called here might be incorrect based on your new requirements
                      const statusA = await setconnectedWallet({ pk: wallet.pk, walletApp: wallet.name }, sessionId);

                      if (!statusA) {
                        alert("Error switching wallet");
                      }
                    }}>
                    <img src={walletsIcons[wallet.name]} className="h-8 w-8" />
                    <div className="flex flex-col ml-3">
                      <div className="flex flex-row items-center">
                        {wallet.pk === connectedSessionDetails.selected_wallet.pk && (
                          <div className="w-2 h-2 mr-1 rounded-full bg-primary" />
                        )}
                        <h1
                          className={`text-sm text-left font-medium ${
                            wallet.pk === connectedSessionDetails.selected_wallet.pk ? "text-primary" : "text-textLight"
                          }`}>
                          {shortenSolanaAddress(wallet.pk)}
                        </h1>
                      </div>
                      <h1 className="text-xs text-textLight opacity-60 text-left ">{wallet.name}</h1>
                    </div>
                    <Copy
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from closing the dropdown
                        navigator.clipboard.writeText(wallet.pk).then(() => {
                          // Change the Copy icon to Check icon
                          // This assumes you have a state to track if copied, and a Check icon component
                          setCopiedIndex(index); // Assume you have a state to track the copied wallet's index
                          setTimeout(() => setCopiedIndex(-1), 1250); // Reset after 2 seconds
                        });
                      }}
                      className={`w-4 cursor-pointer hover:text-primary transition duration-200 ml-auto mr-0 ${
                        copiedIndex === index ? "hidden" : "block" // Hide Copy when copied
                      }`}
                    />
                    {copiedIndex === index && <Check className="w-4 text-primary ml-auto mr-0" />}
                    {/* Show check icon when copied */}
                  </div>
                ))}
              </div>
              <div
                onClick={disconnect}
                className="flex flex-row w-full h-11 rounded-xl  items-center justify-center bg-ourRed-300 text-center text-ourRed  cursor-pointer hover:bg-ourRed-200 transition duration-200  ">
                Disconnect
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div
          onClick={closeModalAndResetSession}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
          style={{
            animation: `${isModalOpen ? "fadeIn" : "fadeOut"} 0.5s ease-out forwards`,
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-backgroundLight rounded-2xl p-4"
            style={{
              transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
              opacity: isModalOpen ? 1 : 0,
              transform: isModalOpen ? "translateY(0)" : "translateY(-20px)",
            }}>
            <div className="flex flex-row justify-between mb-4">
              <img src={SyncLinkFull} className="h-6" />
              <XCircle className="h-6 text-textLight cursor-pointer" onClick={closeModalAndResetSession} />
            </div>
            <div className="flex flex-row bg-boxesLight p-4 rounded-xl mb-2 ">
              <div className="flex flex-col w-72 mr-14 justify-between">
                <div>
                  <h1 className="text-xl font-semibold">Scan QR code</h1>
                  <p className="text-md mt-1 text-textLight opacity-80 ">
                    To connect, simply open your SyncLink mobile app and scan this QR code.
                  </p>
                </div>
                <div>
                  <h1 className="text-base font-semibold mb-2">Don't have the SyncLink app?</h1>
                  <div className="flex flex-row">
                    <div className="flex flex-row bg-textLight rounded-lg items-center p-2  cursor-pointer">
                      <img src={appstoreIcon} className="w-5 h-5" />
                      <h1 className="text-backgroundLight text-sm font-medium ml-2">App store</h1>
                    </div>
                    <div className="flex flex-row bg-textLight rounded-lg items-center p-2  ml-2 cursor-pointer">
                      <img src={googleplayIcon} className="w-5 h-5" />
                      <h1 className="text-backgroundLight text-sm font-medium ml-2">Google play</h1>
                    </div>
                  </div>
                </div>
              </div>
              <QRCode
                size={220}
                fgColor={"#1E1E1E"}
                bgColor="#EDEDED"
                logoImage={peerLinkLogoRounded}
                logoWidth={50}
                logoPadding={3}
                eyeRadius={10}
                logoPaddingStyle="circle"
                qrStyle="dots"
                value={`exp://10.0.0.58:8081?action=connect&session=${sessionId}`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
