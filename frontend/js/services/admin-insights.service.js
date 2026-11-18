import { request } from "./api-client.js";

export function getAdminInsights(slug) {
    return request(`/admin/insights/${encodeURIComponent(slug)}`);
}
