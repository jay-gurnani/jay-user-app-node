export function createResponse(statusCode, body) {
  console.log(`Creating response with statusCode: ${statusCode}, body: ${JSON.stringify(body)}`);
  return {
    statusCode,
    body: body ? JSON.stringify(body) : null,
  };
}
