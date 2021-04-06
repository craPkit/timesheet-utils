// ==UserScript==
// @name         Fill day
// @namespace    https://adesso.at/
// @version      0.1
// @description  Time Reporting, Bitch!
// @author       Yourself
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js
// @match        https://aproda.adesso.at/arbeitszeit/arbeitszeit.jsf
// ==/UserScript==


var inline_src = (<><![CDATA[
// script here
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
