"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
function GrowingCounter() {
    var _a = react_1["default"].useState(0), count = _a[0], setCount = _a[1];
    console.log(['count'], count);
    function increase() {
        console.log(['increase']);
        setCount(function (c) { return c + 1; });
    }
    function decrease() {
        console.log(['decrease']);
        setCount(function (c) {
            return c - 1;
        });
    }
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("button", { onClick: increase }, "increase size"),
        react_1["default"].createElement("span", { style: { fontSize: 30 + count + "px", margin: "10px" } }, count.toString()),
        react_1["default"].createElement("button", { onClick: decrease }, "decrease size")));
}
function App() {
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("h1", null, "My Own React App!"),
        react_1["default"].createElement(GrowingCounter, null),
        react_1["default"].createElement(GrowingCounter, null),
        react_1["default"].createElement(GrowingCounter, null)));
}
exports["default"] = App;
