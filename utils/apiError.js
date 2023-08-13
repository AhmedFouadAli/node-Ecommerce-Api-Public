
class APIError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        // This mean that i am the one how create the error for testing purposes
        this.isOperational = true;
    }
}
module.exports = APIError;