import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';


const firebaseConfig = {
  apiKey: 'AIzaSyBoi7xDtK_4mj99jEUSxDYr4C-pIfh8olo',
  authDomain: 'chat-store-b7047.firebaseapp.com',
  projectId: 'chat-store-b7047',
  storageBucket: 'chat-store-b7047.appspot.com',
  messagingSenderId: '518991927963',
  appId: '1:518991927963:web:9afcea1fc8a8c91d58043e',
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const auth = firebase.auth();

