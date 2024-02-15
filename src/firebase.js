import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut, updateProfile } from "firebase/auth";
import { addDoc, collection, deleteDoc, deleteField, doc, getFirestore, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { chats, groupChats, login, logout } from "./redux/userSlice";
import { store } from "../src/redux/store";
import { getStorage, ref, getDownloadURL, deleteObject } from "firebase/storage";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useSelector } from "react-redux";


const firebaseConfig = {
  apiKey: "AIzaSyAX6dSQdVhKaEtMkzJ5PM5f4ads0gmVblo",
  authDomain: "chatapplication-90440.firebaseapp.com",
  projectId: "chatapplication-90440",
  storageBucket: "chatapplication-90440.appspot.com",
  messagingSenderId: "506356892191",
  appId: "1:506356892191:web:41886f6dec2e935c2ccb2a",
  measurementId: "G-8WBR1S1VS8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)
export const storage = getStorage(app);


// User Phone Register

export const userRegister = async (value, username, downloadURL) => {
  try {
    await updateProfile(auth.currentUser, {
      displayName: username,
      phoneNumber: value,
    })
    await setDoc(doc(db, "users", username), {
      name: "",
      username: username,
      phone_number: value,
      description: "",
      photoURL: downloadURL,
      uid: auth.currentUser.uid,
      timeStamp: serverTimestamp()
    });

    await setDoc(doc(db, "userChats", auth.currentUser.uid), {
      
    });

    // await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
    //   createdAt: deleteField()
    // });

  } catch (error) {
    toast.error(error.message)
  }
}

export const setUpRecaptcha = (value) => {
  const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
  recaptchaVerifier.render();
  return signInWithPhoneNumber(auth, value, recaptchaVerifier)
}

// User Logout

export const userLogout = async () => {
  try {
    await signOut(auth)
    return auth
  } catch (error) {
    toast.error(error.message);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    store.dispatch(login(user))
  } else {
    store.dispatch(logout())
  }
})

// User Photo Add

export const getUserPhoto = () => {
  getDownloadURL(ref(storage, `images/users/${auth.currentUser.uid}`))
    .then((url) => {
      const img = document.getElementById('myimg');
      img.setAttribute('src', url);
      return url;
    })
    .catch((error) => {
      toast.error(error.message);
    });
}

export const getUserPhoto2 = () => {
  getDownloadURL(ref(storage, `images/users/${auth.currentUser.uid}`))
    .then((url) => {
      const img = document.getElementById('myimg2');
      img.setAttribute('src', url);
      return url;
    })
    .catch((error) => {
      toast.error(error.message);
    });
}


const userConverter = {
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)

    return {
      id: snapshot.id,
      ...data
    }

  }
}

export const GetUserProfile = () => {
  const [cart] = useCollectionData(collection(db, "users").withConverter(userConverter))
  return cart;
}

export const GetUserBlocks = () => {
  const activeUser = useSelector(state => state.users.user);

  const [cart] = useCollectionData(collection(db, `users/${activeUser.displayName}/blocks`).withConverter(userConverter))
  return cart;
}

export const GetSelectUserBlocks = () => {
  const selectUser = useSelector(state => state.users.selectUser);

  const [cart] = useCollectionData(collection(db, `users/${selectUser.username}/blocks`).withConverter(userConverter))
  return cart;
}

export const GetUserFriends = () => {
  const activeUser = useSelector(state => state.users.user);

  const [cart] = useCollectionData(collection(db, `users/${activeUser.displayName}/friends`).withConverter(userConverter))
  return cart;
}

// User Update

export const userUpdate = async (name, phone, desc, downloadURL) => {
  try {
    await setDoc(doc(db, "users", auth.currentUser.displayName), {
      uid: auth.currentUser.uid,
      name: name,
      phone_number: phone,
      username: auth.currentUser.displayName,
      description: desc,
      photoURL: downloadURL,
      timeStamp: serverTimestamp()
    });
    toast.success("Profile Updated")
  } catch (error) {
    toast.error(error.message)
  }
}

// User Account Delete



// export const UserDelete = async (user) => {

//   try {
//     // const storageRef = ref(storage, `images/users/${user.uid}`);

//     // deleteObject(storageRef)
//     if (cart.length > 0) {
//       await deleteDoc(doc(db, "users", `${user.username}/friends`))
//     }

//     if (blck.length > 0) {
//       await deleteDoc(doc(db, "users", `${user.username}/blocks`))
//     }

//     await deleteDoc(doc(db, "users", user.username))
//     await deleteDoc(doc(db, "usersChats", user.uid))

//   } catch (error) {
//     toast.error(error.message)
//   }
// }

// User Block

export const userBlock = async (user) => {
  try {
    await addDoc(collection(db, "users", `${auth.currentUser.displayName}/blocks`), {
      user: user,
      timeStamp: serverTimestamp()
    })
    // await addDoc(collection(db, "users", `${user.username}/blocks`), {
    //   user: {
    //     description: auth.currentUser.displayName,
    //     name: auth.currentUser.displayName,
    //     photoURL: auth.currentUser.photoURL,
    //     phone_number: auth.currentUser.phoneNumber,
    //     timeStamp: serverTimestamp(),
    //     uid: auth.currentUser.uid,
    //     username: auth.currentUser.displayName,
    //   },
    //   timeStamp: serverTimestamp()
    // })
    toast.success(`${user.username} blocked !`)
  } catch (error) {
    toast.error(error.message)
  }
}

// User Deblock

export const userDeblock = async (item) => {
  try {
    await deleteDoc(doc(db, "users", `${auth.currentUser.displayName}/blocks/${item.id}`))
    toast.success(`${item.user.username} Deblocked !`)
  } catch (error) {
    toast.error(error.message)
  }
}

// User Add Friends

export const userAddFriends = async (user) => {
  try {
    await addDoc(collection(db, "users", `${auth.currentUser.displayName}/friends`), {
      user: user,
      timeStamp: serverTimestamp()
    })
    toast.success(`${user.username} add friends !`)
  } catch (error) {
    toast.error(error.message)
  }
}

// User Delete Friends

export const userDeleteFriends = async (item) => {
  try {
    console.log(item);
    await deleteDoc(doc(db, "users", `${auth.currentUser.displayName}/friends/${item.id}`))
    toast.success(`${item.user.username} delete friends !`)
  } catch (error) {
    toast.error(error.message)
  }
}

export const getChats = async () => {
  try {
    const response = await onSnapshot(doc(db, "userChats", auth.currentUser.uid), (doc) => {
      return store.dispatch(chats(doc.data()));
    })
    return () => {
      response();
    }
  } catch (error) {
    toast.error(error.message)
  }
}


