import { useState, useEffect } from "react";
import peerLinkSymbol from "../assets/onlyIcon.svg";
import peerLinkFull from "../assets/images/fullLogo.svg";
import peerLinkLogoRounded from "../assets/logoRounded.png";
import appstoreIcon from "../assets/images/appstoreIcon.svg";
import googleplayIcon from "../assets/images/googleplayIcon.svg";
import solflareIcon from "../assets/images/solflareIcon.svg";
import phantomIcon from "../assets/images/phantomIcon.svg";

import { Check, ChevronDown, Copy, LogOut, X, XCircle } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import { v4 as uuidv4 } from "uuid";
import {
  clearUserSignMsg,
  clearUserTransaction,
  createSession,
  deleteSessionById,
  deleteSessionToUser,
  setUserSignMsg,
  setUserTransaction,
} from "../hooks/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Toast } from "../components/toast";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const ConnectionPage = () => {
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=aa904a60-705f-4811-beab-cb00d288cc65");

  const [isModalOpen, setModalOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(isModalOpen);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [signMsgModal, setSignMsgModal] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const [genratingSession, setGenratingSession] = useState(false);

  const [openingTransactionModal, setOpeningTransactionModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [signature, setSignature] = useState("");
  const [connectedSessionDetails, setConnectedSessionDetails] = useState<{
    visible_wallet: { pk: string; walletApp: string };
    pk: string;
    session: string;
    ConnectedUserId: string;
  }>();
  const generateSessionId = () => {
    // Generate a new UUID
    const newSessionId = uuidv4();
    return newSessionId;
    // Here, you would also handle storing the new session ID in your database
    // and any other logic needed to create a new session
  };

  const toggleModal = () => setModalOpen(!isModalOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500); // Automatically hide the toast after 3 seconds
  };

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
  const disconnect = async () => {
    const statusA = await deleteSessionById(sessionId);
    const statusB = await deleteSessionToUser(sessionId, connectedSessionDetails?.ConnectedUserId || "");
    if (!statusA || !statusB) {
      alert("Error disconnecting");
      return;
    }
  };
  useEffect(() => {
    const loadStorage = () => {
      const savedSessionJSON = localStorage.getItem("connectedSession");

      const savedSession = savedSessionJSON ? JSON.parse(savedSessionJSON) : null;
      if (savedSession) {
        setConnectedSessionDetails(savedSession);
        setSessionId(savedSession?.session);
      }
    };
    loadStorage();
  }, []);
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
          if (pk) {
            const sessionD = {
              visible_wallet: {
                pk: sessionDetails.connectedWallet?.pk,
                walletApp: sessionDetails.connectedWallet?.walletApp,
              },
              pk: sessionDetails.proxyWallet?.pk,
              session: sessionId,
              ConnectedUserId: sessionDetails?.ConnectedUserId,
            };
            setConnectedSessionDetails(sessionD);
            localStorage.setItem("connectedSession", JSON.stringify(sessionD));
            setShouldRender(false);
            setModalOpen(false);
          }
          console.log("Connected wallet: ", sessionDetails.connectedWallet?.pk);
        } else {
          console.log("No such document/disconnected!");
          setConnectedSessionDetails(undefined);
          setModalOpen(false);
          localStorage.removeItem("connectedSession");
          showToast("User disconnected");
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
    if (!connectedSessionDetails?.ConnectedUserId || !isTransactionModalOpen) {
      console.log("Required conditions not met for setting up the signature listener");
      return;
    }

    const UserRef = doc(db, "users", connectedSessionDetails.ConnectedUserId);

    const unsubscribe = onSnapshot(UserRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        console.log("Listening to user data changes", userData);

        if (!isTransactionModalOpen) return;
        if (userData.tx.tx === "") {
          setTransactionModalOpen(false);
        }
        const txSignature = userData?.tx?.signature;
        if (txSignature) {
          console.log("Signature updated:", txSignature);
          setSignature(txSignature);
          // Trigger any additional actions needed after signature update
        }
      } else {
        console.log("User document not found");
      }
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts or dependencies change
  }, [connectedSessionDetails?.ConnectedUserId, isTransactionModalOpen]);

  useEffect(() => {
    if (!connectedSessionDetails?.ConnectedUserId || !signMsgModal) {
      console.log("Required conditions not met for setting up the signature listener");
      return;
    }

    const UserRef = doc(db, "users", connectedSessionDetails.ConnectedUserId);

    const unsubscribe = onSnapshot(UserRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        console.log("Listening to user data changes", userData);

        if (!signMsgModal) return;
        if (userData.signMsg.msg === "") {
          setSignMsgModal(false);
        }
        const tSignature = userData?.signMsg?.signature;
        if (tSignature) {
          console.log("Signature updated:", tSignature);
          setSignature(tSignature);
          // Trigger any additional actions needed after signature update
        }
      } else {
        console.log("User document not found");
      }
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts or dependencies change
  }, [connectedSessionDetails?.ConnectedUserId, signMsgModal]);
  const walletsIcons: { [key: string]: any } = {
    solflare: solflareIcon,
    phantom: phantomIcon,
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
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return (
      <div className="w-screen md:h-full flex items-center justify-center bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
        <h1>Sorry,we are not supporting mobile yet...</h1>
      </div>
    );
  }
  return (
    <>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      <div className="w-screen md:h-full flex items-center justify-center bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
        {connectedSessionDetails ? (
          <div className="flex flex-row self-center justify-between">
            <div className="relative mr-5">
              <button
                onClick={toggleDropdown}
                className="flex flex-row items-center px-4 py-4 bg-textLight text-backgroundLight rounded-xl  ">
                <img src={walletsIcons[connectedSessionDetails.visible_wallet.walletApp]} className="w-6 h-6" />
                <h1 className="ml-2 text-left text-base text-backgroundLight font-medium">
                  {shortenSolanaAddress(connectedSessionDetails.visible_wallet.pk)}
                </h1>
                <ChevronDown color="white" />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-1/2 mt-2 p-3 w-60 bg-boxesLight rounded-xl shadow-xl z-10 transform -translate-x-1/2">
                  <div
                    onClick={async () => {
                      await navigator.clipboard.writeText(connectedSessionDetails.visible_wallet.pk);
                      showToast("Copied!");
                    }}
                    className="flex flex-row text-textLight px-4 py-2 hover:bg-textDark hover:bg-boxesLight-200 cursor-pointer rounded-lg">
                    <Copy />
                    <h1 className="ml-2 text-left text-base font-medium">Copy address</h1>
                  </div>

                  <div
                    onClick={disconnect}
                    className="flex flex-row text-textLight px-4 py-2 hover:bg-boxesLight-200 cursor-pointer rounded-lg">
                    <LogOut color="#fd4a4a" />
                    <h1 className="ml-2 text-left text-base text-ourRed font-medium">Disconnect</h1>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={async () => {
                setIsDropdownOpen(false);
                setOpeningTransactionModal(true);
                console.log("Attempting to open transaction modal");
                const pk = new PublicKey(connectedSessionDetails.visible_wallet.pk);
                let transaction = new Transaction().add(
                  SystemProgram.transfer({
                    fromPubkey: pk,
                    toPubkey: new PublicKey("Gsvfc45PCxYnByjNfoujWjLc6a9wh8vxdTaujx2MQoJm"),
                    lamports: 100,
                  })
                );
                transaction.feePayer = pk;
                console.log("Getting recent blockhash");
                const anyTransaction: any = transaction;
                anyTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                const serializedTransaction = transaction.serialize({
                  requireAllSignatures: false,
                });
                const encodedTransaction = Buffer.from(serializedTransaction).toString("base64");
                console.log("Tx:", encodedTransaction);
                await setUserTransaction(encodedTransaction, connectedSessionDetails?.ConnectedUserId || "", sessionId);
                setOpeningTransactionModal(false);
                setTransactionModalOpen(true);
              }}
              className="flex flex-row items-center px-4 py-4 bg-textLight text-backgroundLight rounded-xl mr-5">
              {openingTransactionModal && (
                <div
                  className="spinner-border animate-spin inline-block w-5 h-5 border-4 rounded-full mr-1"
                  role="status"
                />
              )}
              <h1 className="ml-1 text-left text-base text-backgroundLight font-medium">
                {openingTransactionModal ? "Loading..." : "Send transaction"}
              </h1>
            </button>

            <button
              onClick={async () => {
                setSignMsgModal(true);
                const msg = `Welcome to ${document.title}!
Click to sign in and accept the ${document.title} Terms of Service (https://example.com/tos) and Privacy Policy (https://example.com/privacy).

This request will not trigger a blockchain transaction or cost any network fees.

Wallet address:
${connectedSessionDetails.pk}

On behalf of : 
${connectedSessionDetails.visible_wallet.pk}
`;
                await setUserSignMsg(msg, connectedSessionDetails?.ConnectedUserId || "", sessionId);
              }}
              className="flex flex-row items-center px-4 py-4 bg-textLight text-backgroundLight rounded-xl ">
              <h1 className="ml-1 text-left text-base text-backgroundLight font-medium">Sign Message</h1>
            </button>
          </div>
        ) : (
          <button
            onClick={connectSession}
            className="flex flex-row px-4 py-4  bg-textLight text-backgroundLight rounded-xl hover:bg-textDark hover:border border-backgroundLight transition duration-150 ease-in-out">
            {genratingSession ? (
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status" />
            ) : (
              <img src={peerLinkSymbol} className="w-6 h-6" />
            )}
            <h1 className="ml-1 text-left text-base text-backgroundLight font-medium">Connect with peerlink</h1>
          </button>
        )}
      </div>

      {shouldRender && (
        <div
          onClick={closeModalAndResetSession}
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
              <XCircle className="h-6 text-textLight cursor-pointer" onClick={closeModalAndResetSession} />
            </div>
            <div className="flex flex-row bg-boxesLight p-4 rounded-xl mb-2 ">
              <div className="flex flex-col w-72 mr-14 justify-between">
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

      {isTransactionModalOpen && (
        <div
          onClick={async () => {
            setTransactionModalOpen(false);
            setSignature("");
            await clearUserTransaction(connectedSessionDetails?.ConnectedUserId || "");
          }}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
          style={{
            animation: `${isTransactionModalOpen ? "fadeIn" : "fadeOut"} 0.5s ease-out forwards`,
          }}>
          <div onClick={(e) => e.stopPropagation()} className="bg-backgroundLight rounded-2xl p-4">
            <div className="flex flex-row justify-between mb-4">
              <img src={peerLinkFull} className="h-6" />
              <XCircle
                className="h-6 text-textLight cursor-pointer"
                onClick={async () => {
                  setTransactionModalOpen(false);
                  setSignature("");
                  await clearUserTransaction(connectedSessionDetails?.ConnectedUserId || "");
                }}
              />
            </div>
            <div className="bg-boxesLight py-16 px-20 rounded-xl mb-2 flex flex-col items-center justify-center">
              {signature != "" && signature != "rejected" ? (
                <Check size={75} color={"#217EFD"} />
              ) : signature === "rejected" ? (
                <X size={75} color={"#fd4a4a"} />
              ) : (
                <div className="loader"></div>
              )}
              <h1 className="text-base font-semibold text-center">
                {signature != "" && signature != "rejected"
                  ? "Transaction completed"
                  : signature === "rejected"
                    ? `User rejected the transaction`
                    : "waiting for confirmation..."}
              </h1>
              {signature != "" && signature != "rejected" && (
                <h1
                  onClick={() => window.open(`https://solscan.io/tx/${signature}`, "_blank", "noopener,noreferrer")}
                  className="text-primary text-sm font-medium text-center cursor-pointer mt-0">
                  View transaction
                </h1>
              )}
            </div>
            {signature === "" && (
              <h1 className="text-xs font-semibold text-center mt-4">Proceed in the peerlink app</h1>
            )}
          </div>
        </div>
      )}

      {signMsgModal && (
        <div
          onClick={async () => {
            setSignMsgModal(false);
            setSignature("");
            await clearUserSignMsg(connectedSessionDetails?.ConnectedUserId || "");
          }}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
          style={{
            animation: `${signMsgModal ? "fadeIn" : "fadeOut"} 0.5s ease-out forwards`,
          }}>
          <div onClick={(e) => e.stopPropagation()} className="bg-backgroundLight rounded-2xl p-4">
            <div className="flex flex-row justify-between mb-4">
              <img src={peerLinkFull} className="h-6" />
              <XCircle
                className="h-6 text-textLight cursor-pointer"
                onClick={async () => {
                  setSignMsgModal(false);
                  setSignature("");
                  await clearUserSignMsg(connectedSessionDetails?.ConnectedUserId || "");
                }}
              />
            </div>
            <div className="bg-boxesLight py-16 px-36 rounded-xl mb-2 flex flex-col items-center justify-center">
              {signature != "" ? <Check size={75} color={"#217EFD"} /> : <div className="loader"></div>}
              <h1 className="text-base font-semibold text-center">{signature != "" ? "Signed!" : "Signing..."}</h1>
            </div>
            {signature === "" && (
              <h1 className="text-xs font-semibold text-center mt-4">Proceed in the peerlink app</h1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionPage;

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
