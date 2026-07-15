// Keep this tiny Node-compatible adapter in sync with lib/auth/username.ts.
// The project runs this script before Next's TypeScript runtime is available.
const normalizedName = (value) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es-UY");
const usernameToAuthEmail = (value) => `${Buffer.from(normalizedName(value), "utf8").toString("base64url")}@temploapp.local`;

const name = process.argv.slice(2).join(" ");

if (!normalizedName(name) || normalizedName(name).length > 120) {
  console.error("Indica un nombre de entre 1 y 120 caracteres.");
  process.exit(1);
}

console.log(usernameToAuthEmail(name));
