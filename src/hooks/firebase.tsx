import { arrayRemove, collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const sessionsRef = collection(db, "sessions");
export const createSession = async (sessionId: string, url: string, icon: string, name: string) => {
  // Reference to the document in the collection with a custom ID
  const sessionDocRef = doc(sessionsRef, sessionId);

  // Set the document with your desired data
  try {
    await setDoc(sessionDocRef, {
      // Your session data here
      createdAt: new Date(),
      dappMetadata: { name: name, url: url, icon: icon },
      connectedWallet: { pk: "", walletApp: "" },
      proxyWallet: { pk: "" },
      ConnectedUserId: "",
      // Include any other session-related data
    });

    console.log(`Session created with ID: ${sessionId}`);
    return true;
  } catch (error) {
    console.error("Error creating session document:", error);
    return false;
  }
};

export const deleteSessionById = async (sessionId: string) => {
  // Reference to the document in the sessions collection
  const sessionDocRef = doc(db, "sessions", sessionId);

  try {
    await deleteDoc(sessionDocRef);
    console.log(`Session with ID: ${sessionId} has been deleted.`);
    return true;
  } catch (error) {
    console.error("Error deleting session document:", error);
    return false;
  }
};

export const deleteSessionToUser = async (sessionId: string, userId: string) => {
  if (!userId || !sessionId || userId === "") return false;
  const UserRef = doc(db, "users", userId);

  try {
    await updateDoc(UserRef, {
      sessions: arrayRemove(sessionId),
    });
    console.log("Session deleted successfully.");
    return true;
  } catch (error) {
    console.error("Error delteing session to user:", error);
    return false;
  }
};

export const setUserTransaction = async (transaction: string, userId: string, sessionId: string) => {
  if (!userId || !sessionId || userId === "") return false;
  const UserRef = doc(db, "users", userId);

  const tx = {
    session: sessionId,
    tx: transaction,
    signature: "",
  };
  try {
    await updateDoc(UserRef, {
      tx,
    });
    console.log("tx updated successfully.");
    return true;
  } catch (error) {
    console.error("Error updating tx to user:", error);
    return false;
  }
};

export const clearUserTransaction = async (userId: string) => {
  if (!userId) return false;
  const UserRef = doc(db, "users", userId);

  // Prepare the update to reset or clear the transaction information
  const txReset = {
    session: "",
    tx: "", // Empty the transaction string or set it to whatever denotes "cleared" in your system
    signature: "",
  };

  try {
    await updateDoc(UserRef, {
      tx: txReset, // Update the document to reset the transaction information
    });
    console.log("Transaction cleared successfully.");
    return true;
  } catch (error) {
    console.error("Error clearing transaction for user:", error);
    return false;
  }
};
