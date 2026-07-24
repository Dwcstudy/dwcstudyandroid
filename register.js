import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Form Submit Handler
async function handleRegister(event) {
  event.preventDefault();

  // HTML Inputs se values lein
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("roleSelect").value; // 'student', 'teacher', ya 'other'

  try {
    // 1. Firebase Auth se account banayein
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Firestore ke "users" collection mein data + Role save karein
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: role,
      createdAt: new Date()
    });

    alert("Registration Successful!");
    
    // 3. Register hote hi sahi Dashboard par bhej dein
    redirectToPage(role);

  } catch (error) {
    console.error("Error:", error.message);
    alert("Error: " + error.message);
  }
}