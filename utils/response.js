class Response {
    constructor(data = null, message = null) {
        this.data = data
        this.message = message
    } 

    success(res) {
        return res.status(200).json({
            success: true,
            data: this.data,
            message: this.message ?? "Successful"
        })
    }

    created(res) {
        return res.status(201).json({
            success: true,
            data: this.data,
            message: this.message ?? "Successful"
        })
    }

    error500(res) {
        return res.status(500).json({
            success: false,
            data: this.data,
            message: this.message ?? "Failed"
        })
    }

    error400(res) {
        return res.status(400).json({
            success: false,
            data: this.data,
            message: this.message ?? "Failed"
        })
    }

    error401(res) {
        return res.status(401).json({
            success: false,
            data: this.data,
            message: this.message ?? "Please Login!"
        })
    }

    error404(res) {
        return res.status(404).json({
            success: false,
            data: this.data,
            message: this.message ?? "Failed"
        })
    }

    error429(res) {
        return res.status(429).json({
            success: false,
            data: this.data,
            message: this.message ?? "Too Many Requests!"
        })
    }

    unauthorized(res, message) {
        return res.status(403).json({
            success: false,
            message: message
        })
    }

}

module.exports = Response