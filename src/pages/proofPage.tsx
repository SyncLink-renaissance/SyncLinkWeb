import peerLinkFull from "../assets/images/fullLogo.svg";
import appstoreIcon from "../assets/images/appstoreIcon.svg";
import googleplayIcon from "../assets/images/googleplayIcon.svg";

import { Check, ChevronDown, X, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { QRCode } from "react-qrcode-logo";
import { createProofSession, deleteProofSessionById } from "../hooks/firebase";
import { v4 as uuidv4 } from "uuid";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const ConnectionPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isProofing, setIsProofing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isModalOpen);
  const [status, setStatus] = useState({ status: "", description: "" });
  const [proofSessionId, setProofSessionId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNftDropdownOpen, setIsNftDropdownOpen] = useState(false);
  const [proffingType, setProffingType] = useState("");
  const [genratingProofSession, setGenratingProofSession] = useState(false);
  const toggleDropdown = () => {
    setIsNftDropdownOpen(false);
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleNftDropdown = () => {
    setIsDropdownOpen(false);
    setIsNftDropdownOpen(!isNftDropdownOpen);
  };
  const generateSessionId = () => {
    // Generate a new UUID
    const newSessionId = uuidv4();
    return newSessionId;
    // Here, you would also handle storing the new session ID in your database
    // and any other logic needed to create a new session
  };

  const proofToken = async (tokenAddress: string, proffingType: string, minAmountToCheck?: number) => {
    setProffingType(proffingType);
    setIsDropdownOpen(false);
    setIsNftDropdownOpen(false);
    setGenratingProofSession(true);
    const newSessionId = generateSessionId();
    setProofSessionId(newSessionId);

    const status = await createProofSession(newSessionId, tokenAddress, document.title, proffingType, minAmountToCheck);
    console.log("status:", status);
    setGenratingProofSession(false);

    setModalOpen(true);
  };

  const closeModalAndResetSession = async () => {
    const status = await deleteProofSessionById(proofSessionId);
    console.log("status:", status);
    setProofSessionId("");
    setModalOpen(false);
    setIsProofing(false);
  };

  useEffect(() => {
    if (isModalOpen) setShouldRender(true);
  }, [isModalOpen]);

  useEffect(() => {
    if (!proofSessionId) {
      console.log("Session id empty");
      return;
    }

    console.log("Setting up listener for session:", proofSessionId);
    const documentRef = doc(db, "proofSessions", proofSessionId);

    const unsubscribe = onSnapshot(
      documentRef,
      (doc) => {
        if (doc.exists()) {
          console.log("doc alright");
          const proofSessionDetails = doc.data();
          if (!proofSessionDetails.status) return;
          setStatus(proofSessionDetails.status);
          if (proofSessionDetails.status.status != "") {
            setIsProofing(true);
          }
        } else {
          console.log("No such document/disconnected!");
          setModalOpen(false);
          setIsProofing(false);
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
  }, [proofSessionId]);
  const onAnimationEnd = () => {
    if (!isModalOpen) setShouldRender(false);
  };
  const handleModalContentClick = (e: any) => {
    e.stopPropagation();
  };
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>(0);
  const tokens = [
    {
      name: "Solana",
      symbol: "SOL",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
      mintAddress: "So11111111111111111111111111111111111111112",
    },
    {
      name: "Jupiter",
      symbol: "JUP",
      icon: "https://static.jup.ag/jup/icon.png",
      mintAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    },
    {
      name: "Pyth",
      symbol: "PYTH",
      icon: "https://pyth.network/token.svg",
      mintAddress: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    },
    {
      name: "Bonk",
      symbol: "Bonk",
      icon: "https://quei6zhlcfsxdfyes577gy7bkxmuz7qqakyt72xlbkyh7fysmoza.arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
      mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    },
    {
      name: "JITO",
      symbol: "JTO",
      icon: "https://metadata.jito.network/token/jto/image",
      mintAddress: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    },
    {
      name: "dogwifhat",
      symbol: "$WIF",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/28752.png",
      mintAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    },
    {
      name: "Wen",
      symbol: "WEN",
      icon: "https://shdw-drive.genesysgo.net/GwJapVHVvfM4Mw4sWszkzywncUWuxxPd6s9VuFfXRgie/wen_logo.png",
      mintAddress: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk",
    },
    {
      name: "Orca",
      symbol: "ORCA",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png",
      mintAddress: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    },
  ];

  const nfts = [
    {
      name: "Mad lads",
      icon: "https://img-cdn.magiceden.dev/rs:fill:128:0:0/plain/https://creator-hub-prod.s3.us-east-2.amazonaws.com/mad_lads_pfp_1682211343777.png",
      mintAddress: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w",
    },
    {
      name: "Meggos",
      icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https://creator-hub-prod.s3.us-east-2.amazonaws.com/meegos_pfp_1692443263785.png",
      mintAddress: "HNv9G2NxgZEWLxmzFqSCWYk4moUYvNrWjbq6AY2AHJKF",
    },

    {
      name: "SMB Gen2",
      icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https://i.imgur.com/bMH6qNc.png",
      mintAddress: "SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W",
    },
    {
      name: "Famous Fox Federation",
      icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https://creator-hub-prod.s3.us-east-2.amazonaws.com/famous_fox_federation_pfp_1679672949828.gif",
      mintAddress: "BUjZjAS2vbbb65g7Z1Ca9ZRVYoJscURG5L3AkVvHP9ac",
    },
    {
      name: "Okay Bears",
      icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https://bafkreidgfsdjx4nt4vctch73hcchb3pkiwic2onfw5yr4756adchogk5de.ipfs.nftstorage.link/",
      mintAddress: "3saAedkM9o5g1u5DCqsuMZuC4GRqPB4TuMkvSsSVvGQ3",
    },
    {
      name: "Claynosaurz",
      icon: "https://creator-hub-prod.s3.us-east-2.amazonaws.com/claynosaurz_pfp_1679930706147.jpeg",
      mintAddress: "6mszaj17KSfVqADrQj3o4W3zoLMTykgmV37W4QadCczK",
    },
    {
      name: "y00ts",
      icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https://bafkreidc5co72clgqor54gpugde6tr4otrubjfqanj4vx4ivjwxnhqgaai.ipfs.nftstorage.link/",
      mintAddress: "4mKSoDDqApmF1DqXvVTSL6tu2zixrSSNjqMxUnwvVzy2",
    },

    {
      name: "Ovols",
      icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https://creator-hub-prod.s3.us-east-2.amazonaws.com/elixir_ovols_pfp_1700592508163.png",
      mintAddress: "9jnJWH9F9t1xAgw5RGwswVKY4GvY2RXhzLSJgpBAhoaR",
    },
  ];

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return (
      <div className="w-screen md:h-full flex items-center justify-center bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
        <h1>Sorry,we are not supporting mobile yet...</h1>
      </div>
    );
  }
  return (
    <>
      <div className="w-screen md:h-full flex  flex-col items-center justify-center bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
        <div className="flex flex-row">
          <div className="relative mr-5">
            <button
              onClick={toggleDropdown}
              className="flex flex-row justify-center items-center px-4 py-4  mt-10  bg-boxesLight text-backgroundLight rounded-xl hover:bg-textDark hover:border border-backgroundLight transition duration-150 ease-in-out">
              <img src={tokens[selectedTokenIndex].icon} className="h-7 rounded-full" />
              <h1 className="ml-2 text-center text-base text-textLight font-medium">
                {tokens[selectedTokenIndex].name} ({tokens[selectedTokenIndex].symbol})
              </h1>
              <ChevronDown color="#1E1E1E" />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute h-64 left-1/2 mt-2 p-3 w-60 bg-boxesLight rounded-xl shadow-xl z-10 transform -translate-x-1/2 overflow-y-auto"
                style={{ maxHeight: "20rem" }}>
                {tokens.map((token, index) => (
                  <div
                    key={index} // Make sure to include a unique key for each child in a list.
                    onClick={() => {
                      setSelectedTokenIndex(index);
                      toggleDropdown();
                    }}
                    className="flex flex-row text-textLight items-center px-4 py-2 hover:bg-textDark hover:bg-boxesLight-200 cursor-pointer rounded-lg">
                    <img src={token.icon} className="h-5 rounded-full" alt={token.symbol} />
                    <h1 className="ml-2 text-left text-base font-medium">
                      {token.name} ({token.symbol})
                    </h1>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => proofToken(tokens[selectedTokenIndex].mintAddress, "token")}
            className="flex flex-row justify-center px-4 py-4  mt-10  bg-textLight text-backgroundLight rounded-xl hover:bg-textDark hover:border border-backgroundLight transition duration-150 ease-in-out">
            <h1 className="ml-1 text-center text-base text-backgroundLight font-medium">
              {genratingProofSession ? "Loading..." : "Proof token holdings"}
            </h1>
          </button>
        </div>
        <div className="flex flex-row justify-between">
          <div className="relative mr-5">
            <button
              onClick={toggleNftDropdown}
              className="flex flex-row justify-center items-center px-4 py-4  mt-10  bg-boxesLight text-backgroundLight rounded-xl hover:bg-textDark hover:border border-backgroundLight transition duration-150 ease-in-out">
              <img src={nfts[selectedNftIndex].icon} className="h-7 rounded-full" />
              <h1 className="ml-2 text-center text-base text-textLight font-medium">{nfts[selectedNftIndex].name}</h1>
              <ChevronDown color="#1E1E1E" />
            </button>
            {isNftDropdownOpen && (
              <div
                className="absolute h-64 left-1/2 mt-2 p-3 w-60 bg-boxesLight rounded-xl shadow-xl z-10 transform -translate-x-1/2 overflow-y-auto"
                style={{ maxHeight: "20rem" }}>
                {nfts.map((nft, index) => (
                  <div
                    key={index} // Make sure to include a unique key for each child in a list.
                    onClick={() => {
                      setSelectedNftIndex(index);
                      toggleNftDropdown();
                    }}
                    className="flex flex-row text-textLight items-center px-4 py-2 hover:bg-textDark hover:bg-boxesLight-200 cursor-pointer rounded-lg">
                    <img src={nft.icon} className="h-5 rounded-full" alt={nft.mintAddress} />
                    <h1 className="ml-2 text-left text-base font-medium">{nft.name}</h1>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => proofToken(nfts[selectedNftIndex].mintAddress, "nft")}
            className="flex flex-row justify-center px-4 py-4  mt-10  bg-textLight text-backgroundLight rounded-xl hover:bg-textDark hover:border border-backgroundLight transition duration-150 ease-in-out">
            <h1 className="ml-1 text-center text-base text-backgroundLight font-medium">
              {genratingProofSession ? "Loading..." : "Proof NFT holdings"}
            </h1>
          </button>
        </div>
      </div>

      {shouldRender && status.status === "" && (
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
                    {`To verify your ${
                      proffingType === "nft" ? nfts[selectedNftIndex].name : tokens[selectedTokenIndex].name
                    } holdings, Open your Peerlink mobile app and scan this QR code.`}
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
                logoImage={proffingType === "nft" ? nfts[selectedNftIndex].icon : tokens[selectedTokenIndex].icon}
                logoWidth={50}
                logoPadding={3}
                eyeRadius={10}
                logoPaddingStyle="circle"
                qrStyle="dots"
                value={`exp://10.0.0.58:8081?action=proof&session=${proofSessionId}`}
              />
            </div>
          </div>
        </div>
      )}

      {isProofing && (
        <div
          onClick={closeModalAndResetSession}
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
          style={{
            animation: `${isProofing ? "fadeIn" : "fadeOut"} 0.5s ease-out forwards`,
          }}>
          <div onClick={(e) => e.stopPropagation()} className="bg-backgroundLight rounded-2xl p-4">
            <div className="flex flex-row justify-between mb-4">
              <img src={peerLinkFull} className="h-6" />
              <XCircle className="h-6 text-textLight cursor-pointer" onClick={closeModalAndResetSession} />
            </div>
            <div className="bg-boxesLight py-16 px-36 rounded-xl mb-2 flex flex-col items-center justify-center">
              {status.status === "pending" && <div className="loader"></div>}
              {status.status === "approved" && <Check size={75} color={"#217EFD"} />}
              {status.status === "not approved" && <X size={75} color={"#fd4a4a"} />}
              <h1 className="text-base font-semibold text-center">{status.status}</h1>
            </div>
            {status.status === "pending" && (
              <h1 className="text-xs font-semibold text-center mt-4">Proceed in the peerlink app</h1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionPage;
