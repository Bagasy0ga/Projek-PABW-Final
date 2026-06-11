// Helper functions for API responses

export function successResponse({ message = "Success", data = null, statusCode = 200 }) {
    return {
        status: "success",
        statusCode,
        message,
        data
    };
}

export function errorResponse({ message = "Error", statusCode = 400, data = null }) {
    return {
        status: "error",
        statusCode,
        message,
        data
    };
}
