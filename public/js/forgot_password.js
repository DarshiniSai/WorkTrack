async function sendOTP() {
  const email = document.getElementById("email").value.trim();

  if (!email) return showToast("Please enter a valid email", "error");
  console.log("sendOTP function revoked");

  const res = await fetch(`${BACKEND_URL}/api/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (res.ok) {
    showToast("OTP sent to your email", "success");

    if (data.previewURL) {
      const previewDiv = document.getElementById("preview-link");
      previewDiv.innerHTML = `
        <p><strong>Access the email:</strong> 
        <a href="${data.previewURL}" target="_blank">View Email</a></p>`;
    }

    // Show OTP section
    document.getElementById("otp-section").style.display = "block";
  } else {
    showToast("Error: " + data.error, "error");
  }
}

async function verifyOTP() {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  const newPassword = document.getElementById("new-password").value.trim();

  if (!email || !otp || !newPassword) {
    return showToast("All fields are required", "error");
  }

  const res = await fetch(`${BACKEND_URL}/api/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  console.log("Fetch response:", res);
  const data = await res.json();
  

  if (res.ok) {
    showToast("Password successfully updated", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else {
    showToast("Error: " + data.error, "error");
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
