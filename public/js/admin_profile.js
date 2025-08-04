const userId = localStorage.getItem("user_id");

function previewImage(event) {
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("profile-pic-preview").src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

document.getElementById("changePassForm").addEventListener("submit", function (e) {
  e.preventDefault();
  changePassword();
});

async function loadProfile() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/users/${userId}`);
    const user = await res.json();

    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("role").value = user.role;
    const dropdown = document.querySelector(".dropdown-toggle");
    if (dropdown) {
      dropdown.innerHTML = `
        <img src="./images/profile.png" alt="Profile" class="rounded-circle me-2" width="40" height="40">
        ${user.name}
      `;
    }
    const greeting = document.querySelector("h2.text-center");
    if (greeting) {
      greeting.textContent = `${user.name}'s Profile`;
    }

    if (user.profile_image) {
      document.getElementById("profile-pic-preview").src = `data:image/jpeg;base64,${user.profile_image}`;
    }
  } catch (err) {
    alert("Error loading profile");
    console.error(err);
  }
}

document.getElementById("profileForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("phone", document.getElementById("phone").value);

  const fileInput = document.getElementById("profile");
  if (fileInput.files[0]) {
    formData.append("profile", fileInput.files[0]);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Failed to update profile");
  }
});

async function changePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    return alert("New passwords do not match!");
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/users/${userId}/change-password`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    const data = await res.json();
    alert(data.message);
    const modal = bootstrap.Modal.getInstance(document.getElementById("changePassModal"));
    modal.hide();

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
  } catch (err) {
    alert("Error changing password");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
