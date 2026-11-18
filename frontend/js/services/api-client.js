const API_BASE_URL = "/api";

export async function request(path, { method = "GET", body } = {}) {
    const options = {
        method,
        headers: { Accept: "application/json" },
    };

    if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, options);
    let data;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.error || data?.Error || `Request failed (${response.status})`);
    }

    return data;
}
