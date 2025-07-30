document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

 
  if (username === "admin" && password === "1234") {
    window.location.href = "home.html"; 
  } else {
    alert("Invalid username or password. Try again.");
  }
});
