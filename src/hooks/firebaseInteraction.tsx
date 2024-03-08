import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { User } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export interface dbUser {
  email: string;
  phoneNumber: string;
  fName: string;
  sName: string;
  username: string;
  about: string;
  region: string;
  pfp: string;
  skills: string[];
  mainSkill: string;
  linkedSocials: { [key: string]: string }[];
  connections: string[];
  userScanedBy: string;
  externalLinks: { name: string; type: string; link: string }[];
}
export let userData: dbUser | undefined;
export let user: User | undefined;

export let userDocRef: DocumentReference<DocumentData, DocumentData> | undefined;

export async function createUser(params: { newUserCred: User; fName: string; sName: string }) {
  try {
    const { newUserCred, fName, sName } = params;
    // Ensure the collection name is "users"
    const userCollectionRef = collection(db, "users");

    // Use the provided ID as the document ID
    const userDocRef = doc(userCollectionRef, newUserCred.uid);

    const newUser: dbUser = {
      email: newUserCred.email ? newUserCred.email : "",
      phoneNumber: newUserCred.phoneNumber ? newUserCred.phoneNumber : "",
      fName,
      sName,
      username: "",
      about: "",
      pfp: "",
      region: "Israel", /// should get current location here
      skills: [],
      mainSkill: "",
      linkedSocials: [],
      connections: [],
      userScanedBy: "",
      externalLinks: [],
    };

    // Use setDoc to create or update the document
    await setDoc(userDocRef, newUser);

    userData = newUser;
  } catch (e) {
    // error reading value
    alert(`Error creating user ${e}`);
  }
}

export async function loadUser(newUser: User) {
  try {
    user = newUser;
    console.log("user uid : ", newUser.uid);
    userDocRef = doc(db, "users", newUser.uid);
    const docSnap = await getDoc(userDocRef);
    userData = docSnap.data() as dbUser;
    if (userData) {
      console.log(userData.email);
      return true;
    }
    return false;
  } catch (e) {
    // error reading value
    alert(`Error loading user ${e}`);
    return false;
  }
}
export async function getUserIdByUsername(username: string): Promise<string | undefined> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming usernames are unique, there should only be one document.
      const userDoc = querySnapshot.docs[0];
      return userDoc.id; // Return the document ID of the user.
    } else {
      console.log("No user found with that username.");
      return undefined; // No user found.
    }
  } catch (error) {
    console.error("Error getting user ID by username:", error);
    return undefined;
  }
}

export async function getUserData(newUser: User) {
  try {
    user = newUser;
    console.log("user uid : ", newUser.uid);
    userDocRef = doc(db, "users", newUser.uid);
    const docSnap = await getDoc(userDocRef);
    userData = docSnap.data() as dbUser;
    if (userData) {
      console.log(userData.email);
      return userData;
    }
    return false;
  } catch (e) {
    // error reading value
    alert(`Error loading user ${e}`);
    return false;
  }
}
export async function checkIfDocExists(docPath: string) {
  try {
    const userCollectionRef = collection(db, "users");
    const docRef = doc(userCollectionRef, docPath);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      // Document exists
      return true;
    } else {
      // Document does not exist
      return false;
    }
  } catch (error) {
    console.log("Error checking document existence:", error);
    return false;
  }
}
export async function logOutDb() {
  userData = undefined;
  user = undefined;
  userDocRef = undefined;
}
export async function getUserDataById(userId: string): Promise<dbUser | undefined> {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as dbUser;
      return userData;
    } else {
      console.error("No such document!");
      return undefined;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return undefined;
  }
}

export async function setFName(fName: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { fName });
    userData.fName = fName;
  } catch (e) {
    console.error("Error updating fName:", e);
  }
}

export async function setSName(sName: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { sName });
    userData.sName = sName;
  } catch (e) {
    console.error("Error updating sName:", e);
  }
}

export async function setUsername(username: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { username });
    userData.username = username;
  } catch (e) {
    console.error("Error updating username:", e);
  }
}

export async function setAbout(about: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { about });
    userData.about = about;
  } catch (e) {
    console.error("Error updating about:", e);
  }
}

export async function setProfilePicture(pfp: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { pfp });
    userData.pfp = pfp;
  } catch (e) {
    console.error("Error updating profile picture:", e);
  }
}

export async function setUserScanedBy(userScanedBy: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { userScanedBy });
    userData.userScanedBy = userScanedBy;
  } catch (e) {
    console.error("Error updating User scaned by:", e);
  }
}

export async function setExternalLinks(externalLinks: { name: string; type: string; link: string }[]) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { externalLinks });
    userData.externalLinks = externalLinks;
  } catch (e) {
    console.error("Error updating external links:", e);
  }
}

export async function addExsternalLink(newLink: { name: string; type: string; link: string }) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    const tArr = userData.externalLinks;
    tArr.push(newLink);
    await updateDoc(userDocRef, { externalLinks: tArr });
    userData.externalLinks = tArr;
  } catch (e) {
    console.error("Error updating User scaned by:", e);
  }
}

export async function deleteExsternalLink(index: number) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    const tArr = userData.externalLinks;
    tArr.splice(index, 1);
    await updateDoc(userDocRef, { externalLinks: tArr });
    userData.externalLinks = tArr;
  } catch (e) {
    console.error("Error updating User scaned by:", e);
  }
}

export async function deleteLinkedSocial(index: number) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    const tArr = userData.linkedSocials;
    tArr.splice(index, 1);
    await updateDoc(userDocRef, { linkedSocials: tArr });
    userData.linkedSocials = tArr;
  } catch (e) {
    console.error("Error updating linkedSocials:", e);
  }
}
export async function setExsternalUserScanedBy(userScanedBy: string, exsternalUserId: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    const userDocRef = doc(db, "users", exsternalUserId);

    await updateDoc(userDocRef, { userScanedBy });
    userData.userScanedBy = userScanedBy;
  } catch (e) {
    console.error("Error updating User scaned by:", e);
  }
}

export async function setSkills(skills: string[]) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { skills });
    userData.skills = skills;
  } catch (e) {
    console.error("Error updating skills:", e);
  }
}

export async function setMainSkill(mainSkill: string) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { mainSkill });
    userData.mainSkill = mainSkill;
  } catch (e) {
    console.error("Error updating skills:", e);
  }
}

export async function setlinkedSocials(linkedSocials: { [key: string]: string }[]) {
  if (!userDocRef || !userData) {
    console.log("Error:UserData empty");
    return false;
  }
  try {
    await updateDoc(userDocRef, { linkedSocials });
    userData.linkedSocials = linkedSocials;
  } catch (e) {
    console.error("Error updating linkedSocials:", e);
  }
}

export const isUsernameTaken = async (username: string) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  // If querySnapshot.size is greater than 0, then the username already exists
  return querySnapshot.size > 0;
};

export const uploadImageToFirebase = async (imageUri: string) => {
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response as Blob); // Asserting the type of xhr.response to Blob
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", imageUri, true);
    xhr.send(null);
  });

  const storage = getStorage();
  const storageRef = ref(storage, `profilePictures/${user?.uid}.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  uploadTask.on(
    "state_changed",
    () => {
      // Observe state change events such as progress, pause, and resume
      // You can use this to show upload progress
    },
    (error) => {
      // Handle unsuccessful uploads
      console.log(error);
    },
    () => {
      // Handle successful uploads on complete
      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        console.log("File available at", downloadURL);
        // Here you can call a function to update Firestore or Realtime Database with the image URL
        await setProfilePicture(downloadURL);
      });
    }
  );
};
