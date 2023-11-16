export const getContentType = (suffix) => {
    if (suffix === "html") {
        return "text/html; charset=utf-8";
    }
    if (suffix === "js") {
        return "application/javascript; charset=utf-8";
    }
    if (suffix === "css") {
        return "text/css; charset=utf-8";
    }
    if (suffix === "png") {
        return "image/png";
    }
    if (suffix === "jpg" || suffix === "jpeg") {
        return "image/jpeg";
    }
    if (suffix === "gif") {
        return "image/gif";
    }
    if (suffix === "svg") {
        return "image/svg+xml";
    }
    if (suffix === "ico") {
        return "image/x-icon";
    }
    if (suffix === "json") {
        return "application/json";
    }
    return "text/plain; charset=utf-8";
}