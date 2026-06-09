const bcrypt = require("bcrypt");

const password = "Admin@777"; // change if needed

async function hashPassword() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Hashed Password:", hashedPassword);
}

hashPassword();
