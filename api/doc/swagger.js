const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./endpoints.js']

const doc = {
    info: {
        version: "1.0.0",
        title: "Smart Lecture Hall API",
        description: "Documentation for Smart Lecture Hall API"
    },
    host: "localhost:3000",
    basePath: "/",
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            "name": "Booking",
            "description": "Endpoints for bookings"
        },
        {
            "name": "User",
            "description": "Endpoints for users"
        }
    ],
    securityDefinitions: {
        api_key: {
            type: "apiKey",
            name: "api_key",
            in: "header"
        },
        petstore_auth: {
            type: "oauth2",
            authorizationUrl: "https://petstore.swagger.io/oauth/authorize",
            flow: "implicit",
            scopes: {
                read_pets: "read your pets",
                write_pets: "modify pets in your account"
            }
        }
    },
    definitions: {
        User: {
            type: "object",
            properties: {
                name: {
                    type: "string"
                },
                email: {
                    type: "string"
                },
                password: {
                    type: "string"
                }
            }
        },
        Booking: {
            type: "object",
            properties: {
              lh: {
                type: "string"
              },
              teacherName: {
                type: "string"
              },
              course: {
                type: "string"
              },
              explanation: {
                type: "string"
              },
              pdfFile: {
                type: "object",
                properties: {
                  data: {
                    type: "string",
                    format: "binary"
                  },
                  contentType: {
                    type: "string"
                  }
                }
              },
              createdDate: {
                type: "string",
                format: "date-time"
              }
            }
          }
          ,
        Error: {
            type: "object",
            properties: {
                message: {
                    type: "string"
                }
            }
        }
    },
    paths: {
        "/bookings/recent": {
            "get": {
                "tags": [
                    "Booking"
                ],
                "summary": "Endpoint to get the most recent booking",
                "responses": {
                    "200": {
                        "description": "The most recent booking",
                        "schema": {
                            "$ref": "#/definitions/Booking"
                        }
                    },
                    "500": {
                        "description": "Error retrieving booking from database",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            }
        },
        "/users": {
            "post": {
                "tags": [
                    "User"
                ],
                "summary": "Endpoint to create a new user",
                "parameters": [
                    {
                        "name": "name",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/User"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "User created successfully",
                        "schema": {
                            "$ref": "#/definitions/User"
                        }
                    },
                    "400": {
                        "description": "Bad request",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "get": {
                "tags": [
                    "User"
                ],
                "summary": "Endpoint to get all users",
                "responses": {
                    "200": {
                        "description": "List of all users",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/User"
                            }
                        }
                    },
                    "500": {
                        "description": "Error retrieving users from database",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                        }
                        }
                        }
                        }
                        }
                        };
                        
                        module.exports = doc;


swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index.js')
})

// const app = require('express')()
// const http = require('http')
// const swaggerUi = require('swagger-ui-express')
// const swaggerFile = require('./swagger_output.json')
