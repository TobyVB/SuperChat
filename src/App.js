import "./App.css";
import { useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  collection,
  serverTimestamp,
  getFirestore,
  orderBy,
  query,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
///////////////////////////////////////////////////////////
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

////////////////////////////////////////////////////////////////
const firebaseConfig = {
  apiKey: "AIzaSyBFE2CWttn53ML22nGyWI8MDoGtHbQEeNI",
  authDomain: "superchat-aa35f.firebaseapp.com",
  projectId: "superchat-aa35f",
  storageBucket: "superchat-aa35f.appspot.com",
  messagingSenderId: "82690819358",
  appId: "1:82690819358:web:960fafd045315f28f1b50f",
  measurementId: "G-JYMXR7SRPG",
};
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
const auth = getAuth();
////////////////////////////////////////////////////////////////
function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>{user ? <Chatroom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const googleProvider = new GoogleAuthProvider();
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider);
  };
  // const signInWithFacebook = () => {
  //   const facebookProvider = new auth.FacebookAuthProvider();
  //   auth.signInWithPopup(facebookProvider);
  // };
  return (
    <>
      <button onClick={signInWithGoogle}> Sign in with Google </button>
      {/* <button onClick={signInWithFacebook}> Sign in with Facebook </button> */}
    </>
  );
}
function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}
function Chatroom() {
  const db = getFirestore();
  const dummy = useRef();
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"));
  const [messages] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  console.log(messages && messages.length);

  if (messages && messages.length > 25) {
    const docRef = doc(db, "messages", messages[0].id);
    deleteDoc(docRef).then(() => {
      console.log("notification deleted");
    });
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await addDoc(messagesRef, {
      text: formValue,
      uid: uid,
      createdAt: serverTimestamp(),
      photoURL: photoURL,
    }).then(() => {
      onSnapshot(q, async (snapshot) => {
        snapshot.docs.forEach((document) => {
          const docRef = doc(db, "messages", document.id);
          if (document.data().text === formValue) {
            updateDoc(docRef, {
              id: document.id,
            });
          }
        });
      });
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />
        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          alt="user"
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}
export default App;
