import { request } from "./api-client.js";

export function submitQuiz(slug, answers) {
    return request(`/quiz/${encodeURIComponent(slug)}`, {
        method: "POST",
        body: answers,
    });
}
