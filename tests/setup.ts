import dotenv from "dotenv";

// .env.test wins if it exists; .env is the fallback. Shell variables win over both.
dotenv.config({ path: ".env.test", quiet: true });
dotenv.config({ quiet: true }); // fallback
