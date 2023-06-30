import express, {Request, Response} from "express";
import cors from "cors";

import {Play} from "./game";

function main() {
    const app = express();
    app.use(express.json());
    app.use(cors({
        methods: "POST",
        origin: "*",
        optionsSuccessStatus: 200
    }))
    app.options("*", cors());

    app.post("/play", (req: Request, res: Response) => {
        res.send(Play(req.body))
    })

    const PORT= 3000;
    app.listen(PORT, () => console.log(`noughts and crosses backend started on port ${PORT}`));
}

main()