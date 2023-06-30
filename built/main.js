"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const game_1 = require("./game");
function main() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        methods: "POST",
        origin: "*",
        optionsSuccessStatus: 200
    }));
    app.options("*", (0, cors_1.default)());
    app.post("/play", (req, res) => {
        res.send((0, game_1.Play)(req.body));
    });
    const PORT = 3000;
    app.listen(PORT, () => console.log(`noughts and crosses backend started on port ${PORT}`));
}
main();
//# sourceMappingURL=main.js.map