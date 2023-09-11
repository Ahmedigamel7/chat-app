const passwordInput = document.getElementById("passwordInput");
const confPasswordInput = document.getElementById("confPasswordInput");
const passwordToggle = document.getElementById("passwordToggle");
const confPasswordToggle = document.getElementById("confPasswordToggle");

passwordToggle?.addEventListener("click", function () {

    if (passwordInput.type === "password")
        passwordInput.type = "text";
    else
        passwordInput.type = "password";
});

confPasswordToggle?.addEventListener("click", function () {
    if (confPasswordInput.type === 'password')
        confPasswordInput.type = 'text'
    else
        confPasswordInput.type = 'password'
});
