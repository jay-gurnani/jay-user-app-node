export function createResponse(statusCode, body = {}, headers = {}, multiValueHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://de0vedacxf.execute-api.ap-south-1.amazonaws.com,http://localhost:3000', 
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    },
    multiValueHeaders,
    body: JSON.stringify(body),
  };
}
