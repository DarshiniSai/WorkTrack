function showToast(message, isSuccess = true) {
  const toastEl = document.getElementById("toast");
  const toastBody = document.getElementById("toastMessage");

  toastBody.textContent = message;

  if (isSuccess) {
    toastEl.classList.remove("text-bg-danger");
    toastEl.classList.add("text-bg-success");
  } else {
    toastEl.classList.remove("text-bg-success");
    toastEl.classList.add("text-bg-danger");
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

window.handleGoogleLogin = async function (response) {
  try {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    const email = payload.email;

    const res = await fetch(`${BACKEND_URL}/api/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("user_id", JSON.stringify(data.user.id));
      showToast("Google Sign-In successful");

      setTimeout(() => {
        window.location.href = data.user.role === "admin" ? "dashboard.html" : "employee_dashboard.html";
      }, 1000);
    } else {
      showToast( data.message, false);
    }
  } catch (err) {
    console.error("Google login error", err);
    showToast("Something went wrong with Google Sign-In", false);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const signInButton = document.querySelector(".btn-signin");

  signInButton.addEventListener("click", async function (e) {
    e.preventDefault();
    let isValid = true;
    let errorMessage = "";

    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailInput.value.trim()) {
      isValid = false;
      errorMessage += "Email is required.\n";
      emailInput.classList.add("is-invalid");
    } else if (!emailPattern.test(emailInput.value.trim())) {
      isValid = false;
      errorMessage += "Please enter a valid email address.\n";
      emailInput.classList.add("is-invalid");
    }

    if (!passwordInput.value.trim()) {
      isValid = false;
      errorMessage += "Password is required.\n";
      passwordInput.classList.add("is-invalid");
    }

    if (!isValid) {
      showToast(errorMessage.trim(), false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", JSON.stringify(data.user.id));
        showToast("Login successful ");

        setTimeout(() => {
          window.location.href = data.user.role === "admin" ? "dashboard.html" : "employee_dashboard.html";
        }, 1000);
      } else {
        showToast( data.message, false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      showToast("Something went wrong. Please try again.", false);
    }
  });
});
