"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var App_tsx_1 = __importDefault(require("./App.tsx"));
var react_1 = __importDefault(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
window.addEventListener('DOMContentLoaded', function () {
    react_dom_1["default"].render(react_1["default"].createElement(App_tsx_1["default"], null), document.getElementById('root'));
});
