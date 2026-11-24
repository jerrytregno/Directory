export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing. Add it to your .env file.`);
  }
  return value;
}

export function getFirebaseConfig(): FirebaseWebConfig {
  return {
    apiKey: required("FIREBASE_API_KEY"),
    authDomain: required("FIREBASE_AUTH_DOMAIN"),
    projectId: required("FIREBASE_PROJECT_ID"),
    storageBucket: required("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: required("FIREBASE_MESSAGING_SENDER_ID"),
    appId: required("FIREBASE_APP_ID"),
  };
}
