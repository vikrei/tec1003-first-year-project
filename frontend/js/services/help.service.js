import { request } from "./api-client.js";

export function askHelp(question) {
    return request("/help", { method: "POST", body: { question } });
}
