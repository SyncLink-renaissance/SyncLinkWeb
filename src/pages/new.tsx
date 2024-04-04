import { useEffect, useState } from "react";

import NavBar from "../components/navBar";
import { clearUserTransaction, sessionDetails, setUserTransaction } from "../hooks/firebase";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Check, X, XCircle } from "lucide-react";
import fullLogo from "../assets/images/fullLogo.png";

const NewPage = () => {
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=aa904a60-705f-4811-beab-cb00d288cc65");

  const [startConnection, setStartConnection] = useState(false);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [connectedSessionDetails, setConnectedSessionDetails] = useState<sessionDetails | undefined>();

  /// transacton
  const [openingTransactionModal, setOpeningTransactionModal] = useState(false);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [signature, setSignature] = useState("");

  /*Load connection storage */
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
  return (
    <div className="flex flex-col w-screen md:h-full px-32 bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
      <NavBar
        connectedSessionDetails={connectedSessionDetails}
        sessionId={sessionId}
        setConnectedSessionDetails={setConnectedSessionDetails}
        setSessionId={setSessionId}
        setStartConnection={setStartConnection}
        startConnection={startConnection}
        openDropDown={openDropDown}
        setOpenDropDown={setOpenDropDown}
      />
      <h1 className="text-4xl text-textLight font-bold text-left mb-2 mt-16  ">Connection Demo</h1>
      <h1 className="max-w-4xl text-xl text-textLight font-medium text-left mb-10  ">
        This a page demostrait a connection with SyncLink bla bla somthing cool , explaining what to do ,and letiing the
        user know something is i dont know what writung am i .
      </h1>
      <h1 className="text-xl text-textLight font-semibold text-left mb-2  ">1. Connect</h1>
      <h1 className="max-w-2xl text-base text-textLight  opacity-60 font-medium text-left mb-4  ">
        Connecting with SyncLink is super easy , this paragraph explain this and also explain evrything about it and
        trying to sell the prosdsuct
      </h1>
      <div className="w-full flex justify-start">
        <button
          onClick={() => setStartConnection(true)}
          className="px-7 py-3 bg-textLight text-backgroundLight rounded-2xl border-backgroundLight transition duration-150 ease-in-out mb-7">
          <h1 className="text-center text-base text-backgroundLight font-medium">
            {connectedSessionDetails ? "Connected" : "Connect"}
          </h1>
        </button>
      </div>
      <h1 className="text-xl text-textLight font-semibold text-left mb-2  ">2. Manage connection</h1>
      <h1 className="max-w-2xl text-base text-textLight  opacity-60 font-medium text-left mb-4  ">
        this will explain to the tester how to manage the connection,blajn uh dj sl;ldps plps
      </h1>
      <div className="w-full flex justify-start">
        <button
          onClick={() => setOpenDropDown(true)}
          className="px-7 py-3 bg-textLight text-backgroundLight rounded-2xl border-backgroundLight transition duration-150 ease-in-out mb-7">
          <h1 className="text-center text-base text-backgroundLight font-medium">Manage</h1>
        </button>
      </div>
      <h1 className="text-xl text-textLight font-semibold text-left mb-2  ">3. Send transaction</h1>
      <h1 className="max-w-2xl text-base text-textLight  opacity-60 font-medium text-left mb-4  ">
        This will initate a 0.00005 Sol transaction in your mobile eplain explain.
      </h1>
      <div className="w-full flex justify-start">
        <button
          onClick={async () => {
            setOpenDropDown(false);
            // setOpeningTransactionModal(true);
            console.log("Attempting to open transaction modal");
            if (!connectedSessionDetails) return;
            const pk = new PublicKey(connectedSessionDetails?.selected_wallet.pk);
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
          className="px-7 py-3 bg-textLight text-backgroundLight rounded-2xl border-backgroundLight transition duration-150 ease-in-out mb-7">
          <h1 className="text-center text-base text-backgroundLight font-medium">
            {openingTransactionModal ? "Opening..." : "Send"}
          </h1>
        </button>
      </div>
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
              <img src={fullLogo} className="h-6" />
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
    </div>
  );
};
export default NewPage;
