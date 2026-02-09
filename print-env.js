// Print the environment variables
require('dotenv').config();

console.log("Environment Variables:");
console.log("CREATE_AI_API_TOKEN:", process.env.CREATE_AI_API_TOKEN ? `${process.env.CREATE_AI_API_TOKEN.substring(0, 20)}...` : "undefined");
console.log("CREATE_AI_PROJECT_TOKEN:", process.env.CREATE_AI_PROJECT_TOKEN ? `${process.env.CREATE_AI_PROJECT_TOKEN.substring(0, 20)}...` : "undefined");
console.log("CREATE_AI_API_ENDPOINT:", process.env.CREATE_AI_API_ENDPOINT || "undefined");
console.log("CREATE_AI_PROJECT_ENDPOINT:", process.env.CREATE_AI_PROJECT_ENDPOINT || "undefined");
console.log("CREATE_AI_PROJECT_ID:", process.env.CREATE_AI_PROJECT_ID || "undefined");