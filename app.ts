import express, { Request, Response } from "express";
import connectDB from "./config/connectDB";
import credentials from "./middlewares/credentials";
import helmet from "helmet";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import mongosanitize from "express-mongo-sanitize";
import routes from "./routes/index";

const app = express();

const PORT = process.env.PORT || 8000;
connectDB();

app.use(express.json({ limit: "10kb" }));

app.use(credentials);

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});
app.use("/tawk", limiter);

app.use(mongosanitize());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// app.use(xss('<script>alert("xss");</script>'));

// app.use("/", express.static(path.join(__dirname, "public")));

//* Routes

app.use(routes);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "404 Not Found" });
});

app.use(errorHandler);

export default app;
