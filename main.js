// main.js
// This file contains the typing animation logic for the DinoYoshi website.
// Linked from index.html.


// type logic
const text = "Darien Chau";
const typed = document.getElementById("typed");
let i = 0;
function type() {
  if (i <= text.length) {
    typed.textContent = text.slice(0, i);
    i++;
    setTimeout(type, 120); // Adjust speed as desired
  }
}
type();
