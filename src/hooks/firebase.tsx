import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
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
