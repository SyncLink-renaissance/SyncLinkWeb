import React, { useState, useEffect } from "react";
import peerLinkSymbol from "../assets/onlyIcon.svg";
import peerLinkFull from "../assets/images/fullLogo.svg";
import peerLinkLogoRounded from "../assets/logoRounded.png";
import appstoreIcon from "../assets/images/appstoreIcon.svg";
import googleplayIcon from "../assets/images/googleplayIcon.svg";
import { XCircle } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import { v4 as uuidv4 } from "uuid";
import { createSession, deleteSessionById } from "../hooks/firebase";

const HomePage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(isModalOpen);
  const [sessionId, setSessionId] = useState("");
  const [genratingSession, setGenratingSession] = useState(false);

  const generateSessionId = () => {
    // Generate a new UUID
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    return newSessionId;
    // Here, you would also handle storing the new session ID in your database
    // and any other logic needed to create a new session
  };
  const toggleModal = () => setModalOpen(!isModalOpen);

  const onClickButton = async () => {
    setGenratingSession(true);
    const newSessionId = generateSessionId();
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

  const closeModal = async () => {
    const status = await deleteSessionById(sessionId);
    console.log("status:", status);
    setSessionId("");
    setModalOpen(false);
  };
  useEffect(() => {
    if (isModalOpen) setShouldRender(true);
  }, [isModalOpen]);

  const onAnimationEnd = () => {
    if (!isModalOpen) setShouldRender(false);
  };
  const handleModalContentClick = (e: any) => {
    e.stopPropagation();
  };
  return (
    <>
      <div className="w-screen md:h-full flex items-center justify-center bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
        <button
          onClick={onClickButton}
          className="flex flex-row px-4 py-4 bg-textLight text-backgroundLight rounded-xl hover:bg-textDark hover:border border-backgroundLight transition duration-150 ease-in-out">
          {genratingSession ? (
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status" />
          ) : (
            <img src={peerLinkSymbol} className="w-6 h-6" />
          )}
          <h1 className="ml-1 text-left text-base text-backgroundLight font-medium">Connect with peerlink</h1>
        </button>
      </div>

      {shouldRender && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
          style={{
            animation: `${isModalOpen ? "fadeIn" : "fadeOut"} 0.5s ease-out forwards`,
          }}
          onAnimationEnd={onAnimationEnd}>
          <div
            onClick={handleModalContentClick}
            className="bg-backgroundLight rounded-2xl p-4"
            style={{
              transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
              opacity: isModalOpen ? 1 : 0,
              transform: isModalOpen ? "translateY(0)" : "translateY(-20px)",
            }}>
            <div className="flex flex-row justify-between mb-4">
              <img src={peerLinkFull} className="h-6" />
              <XCircle className="h-6 text-textLight cursor-pointer" onClick={closeModal} />
            </div>
            <div className="flex flex-row bg-boxesLight p-4 rounded-xl mb-2 ">
              <div className="flex flex-col w-72 mr-7 justify-between">
                <div>
                  <h1 className="text-xl font-semibold">Scan QR code</h1>
                  <p className="text-lg mt-1 text-textLight opacity-80 ">
                    To connect, simply open your Peerlink mobile app and scan this QR code.
                  </p>
                </div>
                <div>
                  <h1 className="text-base font-semibold mb-2">Don't have the Peerlink app?</h1>
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

export default HomePage;

// Add these keyframes to your global styles or CSS file
// fadeIn and fadeOut animations for the backdrop
// Adjust the keyframes as necessary to match your desired effect
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
*/
