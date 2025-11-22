var admin = require("firebase-admin");
import { FirebaseServiceAccount } from "./firebase-trader";

admin.initializeApp({
  credential: admin.credential.cert(FirebaseServiceAccount),
  databaseURL: "https://najeeb-trader.firebaseio.com",
});

export default admin;
