import { normalizedName, usernameToAuthEmail } from "../lib/auth/username";

const name = process.argv.slice(2).join(" ");

if (!normalizedName(name) || normalizedName(name).length > 120) {
  console.error("Indica un nombre de entre 1 y 120 caracteres.");
  process.exit(1);
}

console.log(usernameToAuthEmail(name));
