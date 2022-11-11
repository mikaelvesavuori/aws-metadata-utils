# aws-metadata-utils

**`aws-metadata-utils` is a small utility library that helps you extract helpful metadata from your AWS `event` and `context` objects.**

This library is what drives the majority of contextual metadata generated in [MikroLog](https://github.com/mikaelvesavuori/mikrolog), [MikroTrace](https://github.com/mikaelvesavuori/mikrotrace), and [MikroMetric](https://github.com/mikaelvesavuori/mikrometric) outputs.

---

## Usage

Here's an example of running `aws-metadata-utils` in AWS Lambda and just returning back the metadata.

```ts
import { createDynamicMetadata } from 'aws-metadata-utils';

export async function handler(event: any, context: any) {
  // Pass in your AWS event and context objects, such as from API Gateway
  const metadata = createDynamicMetadata(event, context);

  return {
    statusCode: 200,
    body: JSON.stringify(metadata)
  };
}
```

`aws-metadata-utils` will attempt to pick certain values.

Resulting in an object with the following shape:

```json
{
  "accountId": "123412341234",
  "correlationId": "6c933bd2-9535-45a8-b09c-84d00b4f50cc",
  "functionMemorySize": "1024",
  "functionName": "somestack-FunctionName",
  "functionVersion": "$LATEST",
  "region": "eu-north-1",
  "resource": "/functionName",
  "runtime": "AWS_Lambda_node16.x",
  "stage": "shared",
  "timestampRequest": "1657389598171",
  "user": "some user",
  "viewerCountry": "SE"
}
```

## Dynamic metadata

The dynamic metadata fields are picked up automatically if you pass them in during instantiation. Most of those metadata fields will relate to unique value types available in AWS, primarily Lambda.

If these values are not available, they will be dropped at the time of log output. In effect, this means you won't have to deal with them (being empty or otherwise) if you use MikroLog in another type of context.

| Field                | Type   | Description                                               |
| -------------------- | ------ | --------------------------------------------------------- |
| `accountId`          | string | The AWS account ID that the system is running in.         |
| `correlationId`      | string | Correlation ID for this function call.                    |
| `functionMemorySize` | string | Memory size of the current function.                      |
| `functionName`       | string | The name of the function.                                 |
| `functionVersion`    | string | The version of the function.                              |
| `region`             | string | The region of the responding function/system.             |
| `resource`           | string | The resource (channel, URL path...) that is responding.   |
| `runtime`            | string | What runtime is used?                                     |
| `stage`              | string | What AWS stage are we in?                                 |
| `timestampRequest`   | string | Request time in Unix epoch of the incoming request.       |
| `user`               | string | The user in this log context.                             |
| `viewerCountry`      | string | Which country did AWS CloudFront infer the user to be in? |
