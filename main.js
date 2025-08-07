import app from './app.js';
import AWSXRay from 'aws-xray-sdk-core';
const PORT = process.env.PORT || 3000;

const segment = AWSXRay.getSegment(); // gets the current X-Ray segment
const traceId = segment?.trace_id || 'no-trace-id';

app.listen(PORT, () => {
  console.log(`[trace-id: ${traceId}] Server running at http://localhost:${PORT}`);
});
 