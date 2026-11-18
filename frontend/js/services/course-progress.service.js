import { request } from "./api-client.js";

export function getProgress(slug) {
    return request(`/progress/${encodeURIComponent(slug)}`);
}

export function saveStep(slug, position) {
    return request(`/progress/${encodeURIComponent(slug)}`, {
        method: "POST",
        body: { position },
    });
}

export function resetCourse(slug) {
    return request(`/progress/${encodeURIComponent(slug)}/reset`, { method: "POST" });
}
