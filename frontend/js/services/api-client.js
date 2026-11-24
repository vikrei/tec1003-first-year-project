const API_BASE_URL = "/api";
const REQUEST_TIMEOUT_MS = 10000;
const TIMEOUT_MESSAGE = "The server did not answer in time. Please check your connection and try again.";
const OFFLINE_MESSAGE = "We could not reach the server. Please check your connection and try again.";
const FALLBACK_MESSAGE = "Something went wrong. Please try again in a few minutes.";

export async function request(path, { method = "GET", body } = {}) {
    const options = {
        method,
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    };

    if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    let response;
    let data;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, options);
        data = await response.json();
    } catch (error) {
        if (error.name === "TimeoutError") {
            throw new Error(TIMEOUT_MESSAGE);
        }
        if (!response) {
            throw new Error(OFFLINE_MESSAGE);
        }
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.error || FALLBACK_MESSAGE);
    }

    return data;
}