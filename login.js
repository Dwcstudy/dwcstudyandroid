import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHw2ceBKirLjpBx0soxJD0GHWwXnrxo4Y",
  authDomain: "thar-e5879.firebaseapp.com",
  databaseURL: "https://thar-e5879-default-rtdb.firebaseio.com",
  projectId: "thar-e5879",
  storageBucket: "thar-e5879.firebasestorage.app",
  messagingSenderId: "1004657134263",
  appId: "1:1004657134263:web:a2d8844554000981659b32"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 1. Toast Notification Helper
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  container.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type === 'error' ? 'error' : ''}`;
  
  const iconClass = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
  toast.innerHTML = `<i class="fa-solid ${iconClass}" style="font-size: 16px;"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideDownCenter 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// 2. Language Switcher Engine
const langBtn = document.getElementById('langSelectorBtn');
const langDropdown = document.getElementById('langDropdown');

if (langBtn && langDropdown) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    langDropdown.classList.remove('show');
  });
}

window.changeLanguage = function(code, name) {
  const currentLangText = document.getElementById('currentLangText');
  if (currentLangText) currentLangText.innerText = name;
  if (langDropdown) langDropdown.classList.remove('show');
  showToast(`Language changed to ${name}`, 'success');
};

// 3. Toggle Password Visibility
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', function() {
    const passInput = document.getElementById('loginPassword');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      this.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passInput.type = 'password';
      this.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
}

// 4. Role Based Redirection Logic
function redirectUserRole(role) {
  showToast(`Verified! Redirecting to ${role.toUpperCase()} Dashboard...`, 'success');
  setTimeout(() => {
    if (role === 'student') window.location.href = 'student.html';
    else if (role === 'teacher') window.location.href = 'teacher.html';
    else if (role === 'other') window.location.href = 'otheruser.html';
    else window.location.href = 'student.html';
  }, 1200);
}

// 5. Main Login Form Submit Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userInput = document.getElementById('loginUserInput').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();
    const btn = document.getElementById('btnLogin');

    btn.innerText = "Verifying...";
    btn.disabled = true;

    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `users`));

      if (snapshot.exists()) {
        const users = snapshot.val();
        let matchedUser = null;

        // Compare string types properly to prevent data-type mismatches
        for (let key in users) {
          const user = users[key];
          
          const dbMobile = user.mobile ? String(user.mobile).trim() : "";
          const dbEmail = user.email ? String(user.email).trim().toLowerCase() : "";
          const dbKey = String(key).trim();

          if (dbKey === userInput || dbMobile === userInput || (dbEmail && dbEmail === userInput.toLowerCase())) {
            matchedUser = user;
            break;
          }
        }

        if (matchedUser) {
          const dbPassword = String(matchedUser.password || '').trim();
          
          if (dbPassword === pass) {
            redirectUserRole(matchedUser.role || 'student');
          } else {
            showToast("Incorrect Password!", "error");
            btn.innerHTML = '<span>SIGN IN</span> <i class="fa-solid fa-arrow-right"></i>';
            btn.disabled = false;
          }
        } else {
          showToast("No account found with this Mobile or Email!", "error");
          btn.innerHTML = '<span>SIGN IN</span> <i class="fa-solid fa-arrow-right"></i>';
          btn.disabled = false;
        }
      } else {
        showToast("No user records found in Database!", "error");
        btn.innerHTML = '<span>SIGN IN</span> <i class="fa-solid fa-arrow-right"></i>';
        btn.disabled = false;
      }
    } catch (err) {
      showToast("Firebase Error: " + err.message, "error");
      btn.innerHTML = '<span>SIGN IN</span> <i class="fa-solid fa-arrow-right"></i>';
      btn.disabled = false;
    }
  });
}

// 6. OTP Modal Trigger Handler
const btnOtpTrigger = document.getElementById('btnOtpTrigger');
if (btnOtpTrigger) {
  btnOtpTrigger.addEventListener('click', () => {
    const userInput = document.getElementById('loginUserInput').value.trim();
    if (!userInput) {
      showToast("Please enter Mobile or Email first!", "error");
      return;
    }

    showToast(`6-Digit OTP sent to ${userInput}`, 'success');
    document.getElementById('otpSubText').innerText = `OTP sent to: ${userInput}`;
    document.getElementById('otpModal').classList.add('active');
  });
}

const btnCloseOtp = document.getElementById('btnCloseOtp');
if (btnCloseOtp) {
  btnCloseOtp.addEventListener('click', () => {
    document.getElementById('otpModal').classList.remove('active');
  });
}

// OTP Auto Focus Grid Logic
const otpBoxes = document.querySelectorAll('.otp-box');
otpBoxes.forEach((box, idx) => {
  box.addEventListener('keyup', (e) => {
    if (box.value.length === 1 && idx < otpBoxes.length - 1) {
      otpBoxes[idx + 1].focus();
    }
  });
});

// Verify OTP Event
const btnVerifyOtp = document.getElementById('btnVerifyOtp');
if (btnVerifyOtp) {
  btnVerifyOtp.addEventListener('click', async () => {
    let otpVal = "";
    otpBoxes.forEach(b => otpVal += b.value);

    if (otpVal.length < 6) {
      showToast("Enter full 6-digit OTP", "error");
      return;
    }

    const userInput = document.getElementById('loginUserInput').value.trim();
    document.getElementById('otpModal').classList.remove('active');

    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `users`));

      if (snapshot.exists()) {
        const users = snapshot.val();
        let matchedUser = null;

        for (let key in users) {
          const user = users[key];
          const dbMobile = user.mobile ? String(user.mobile).trim() : "";
          const dbEmail = user.email ? String(user.email).trim().toLowerCase() : "";

          if (key === userInput || dbMobile === userInput || (dbEmail && dbEmail === userInput.toLowerCase())) {
            matchedUser = user;
            break;
          }
        }

        redirectUserRole(matchedUser ? matchedUser.role : 'student');
      } else {
        redirectUserRole('student');
      }
    } catch (err) {
      redirectUserRole('student');
    }
  });
}

// 7. Forgot Password Reset Trigger
const btnForgotPass = document.getElementById('btnForgotPass');
if (btnForgotPass) {
  btnForgotPass.addEventListener('click', async (e) => {
    e.preventDefault();
    const userInput = document.getElementById('loginUserInput').value.trim();

    if (!userInput || !userInput.includes('@')) {
      showToast('Enter valid registered Email ID for password reset', 'error');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, userInput);
      showToast('Password reset link sent to registered Email!', 'success');
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  });
}

// 8. Google Sign-In Trigger
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
if (btnGoogleLogin) {
  btnGoogleLogin.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast(`Welcome ${result.user.displayName || 'User'}!`, 'success');
      redirectUserRole('student');
    } catch (error) {
      showToast('Google Sign In failed: ' + error.message, 'error');
    }
  });
}