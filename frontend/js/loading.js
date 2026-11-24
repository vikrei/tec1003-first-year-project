const SKELETON_DELAY_MS = 300;

export function startLoading(element) {
    element.setAttribute("aria-busy", "true");
    const timer = window.setTimeout(() => element.classList.add("skeleton"), SKELETON_DELAY_MS);

    return () => {
        window.clearTimeout(timer);
        element.classList.remove("skeleton");
        element.removeAttribute("aria-busy");
    };
}