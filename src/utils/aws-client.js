import AWSXRay from 'aws-xray-sdk-core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const AWS = AWSXRay.captureAWS(require('aws-sdk'));

export default AWS;
