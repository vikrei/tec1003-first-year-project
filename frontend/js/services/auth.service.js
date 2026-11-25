import { request } from "./api-client.js";

export function login(role) {
    return request("/login", { method: "POST", body: { role } });
}

export function getCurrentUser() {
    return request("/me");
}

export function logout() {
    return request("/logout", { method: "POST" });
}
