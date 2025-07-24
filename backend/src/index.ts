import express, { Express } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";

const app: Express = express();
app.use(express.json());
export const prismaClient = new PrismaClient().$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          zipCode: true,
        },
        compute: (address) => {
          return `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.country} - ${address.zipCode}`;
        },
      },
    },
  },
});

app.use("/api", rootRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("App running on PORT: ", PORT);
});
