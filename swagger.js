const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NodeLab API",
      version: "1.0.0",
      description: "API documentation for NodeLab case project"
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = options;