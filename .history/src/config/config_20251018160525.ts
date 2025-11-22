import * as dotenv from "dotenv";
dotenv.config();

const MONGO_OPTIONS = {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  socketTimeoutMS: 30000,
  keepAlive: true,
  poolSize: 50,
  autoIndex: true,
  retryWrites: false,
};

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOST = process.env.MONGO_URL;
const API_KEY =
  process.env.API_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYXBwIiwidGl0bGUiOiJ0b2tlbiBmb3IgYXBpIGtleSIsImlhdCI6MTYzNjQ0ODczOH0.zmvB5qcMd5k_-A2igZjpZppjc-C_PYVb2Saapo38Gi4";
const API_KEY_SECRET = process.env.API_KEY_SECRET || "api_key_token_secret";

const MONGO = {
  host: MONGO_HOST,
  username: MONGO_USERNAME,
  password: MONGO_PASSWORD,
  options: MONGO_OPTIONS,
  url: "mongodb+srv://najeeb:Zeeshan123@cluster0.kqydbdc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
const SERVER_PORT = parseInt(process.env.SERVER_PORT!) || 8082;

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "access-secret-token";

const gmail = {
  user: process.env.GMAIL_ACCOUNT_USER,
  password: process.env.GMAIL_ACCOUNT_PASSWORD,
};

const SERVER = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT,
};

const SMS_API_SECRET = process.env.SMS_API_SECRET;
const SMS_API_TOKEN = process.env.SMS_API_TOKEN;

const config = {
  server: SERVER,
  mongo: MONGO,
  ACCESS_TOKEN_SECRET,
  gmail,
  API_KEY,
  API_KEY_SECRET,
  SMS_API_SECRET,
  SMS_API_TOKEN,
};

export default config;
