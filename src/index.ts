/**
 * @note The unorthodox try-catch style for setting values is so that we get actual coverage for tests.
 * Using the pattern `event?.['something]` certainly looks nicer but will be deemed uncovered despite 100% coverage.
 */

/**
 * @description Set correlation ID.
 *
 * Check first if this is:
 * 1) via event;
 * 2) via header (API);
 * 3) set new one from AWS request ID;
 * else set it as empty.
 */
function produceCorrelationId(event: any, context: any): string {
  if (
    event &&
    event['detail'] &&
    event['detail']['metadata'] &&
    event['detail']['metadata']['correlationId']
  )
    return event['detail']['metadata']['correlationId'];
  else if (event && event['headers'] && event['headers']['x-correlation-id'])
    return event['headers']['x-correlation-id'];
  else if (context && context['awsRequestId']) return context['awsRequestId'];
  return '';
}

/**
 * @description Set the AWS region.
 */
function produceRegion(context: any): string {
  if (context && context['invokedFunctionArn']) return context['invokedFunctionArn'].split(':')[3];
  return process.env.AWS_REGION || '';
}

/**
 * @description Set the AWS Lambda runtime.
 */
function produceRuntime(): string {
  return process.env.AWS_EXECUTION_ENV || '';
}

/**
 * @description Set the AWS Lambda function name.
 */
function produceFunctionName(context: any): string {
  if (context && context['functionName']) return context['functionName'];
  return process.env.AWS_LAMBDA_FUNCTION_NAME || '';
}

/**
 * @description Set the AWS Lambda function memory size.
 */
function produceFunctionMemorySize(context: any): string {
  if (context && context['memoryLimitInMB']) return context['memoryLimitInMB'];
  return process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '';
}

/**
 * @description Set the AWS Lambda function version.
 */
function produceFunctionVersion(context: any): string {
  if (context && context['functionVersion']) return context['functionVersion'];
  return process.env.AWS_LAMBDA_FUNCTION_VERSION || '';
}

/**
 * @description Set the resource from `path` (Lambda) or `detail-type` (EventBridge).
 */
function produceResource(event: any): string {
  if (event && event['detail-type']) return event['detail-type'];
  else if (event && event['path']) return event['path'];
  return '';
}

/**
 * @description Set the active user in AWS Lambda scope.
 */
function produceUser(event: any): string {
  if (
    event &&
    event['requestContext'] &&
    event['requestContext']['identity'] &&
    event['requestContext']['identity']['user']
  )
    return event['requestContext']['identity']['user'];
  return '';
}

/**
 * @description Set the current AWS stage.
 * @note Will be unknown in EventBridge case; use metadata object?
 */
function produceStage(event: any): string {
  if (event && event['requestContext'] && event['requestContext']['stage'])
    return event['requestContext']['stage'];
  return '';
}

/**
 * @description Set the viewer country (via CloudFront, presumably).
 */
function produceViewerCountry(event: any): string {
  if (event && event['headers'] && event['headers']['CloudFront-Viewer-Country'])
    return event['headers']['CloudFront-Viewer-Country'];
  return '';
}

/**
 * @description Set the AWS account we are currently in scope of.
 */
function produceAccountId(event: any): string {
  // Typical Lambda case
  if (event && event['requestContext'] && event['requestContext']['accountId'])
    return event['requestContext']['accountId'];
  // EventBridge style
  if (event && event['account']) return event['account'];
  return '';
}

/**
 * @description Set the request time in Unix epoch format.
 */
function produceTimestampRequest(event: any): string {
  if (event && event['requestContext'] && event['requestContext']['requestTimeEpoch'])
    return event['requestContext']['requestTimeEpoch'].toString();
  return '';
}

/**
 * @description Get AWS metadata.
 */
export function getMetadata(event: any, context: any): DynamicMetadata {
  return {
    accountId: produceAccountId(event),
    correlationId: produceCorrelationId(event, context),
    functionMemorySize: produceFunctionMemorySize(context),
    functionName: produceFunctionName(context),
    functionVersion: produceFunctionVersion(context),
    region: produceRegion(context),
    resource: produceResource(event),
    runtime: produceRuntime(),
    stage: produceStage(event),
    timestampRequest: produceTimestampRequest(event),
    user: produceUser(event),
    viewerCountry: produceViewerCountry(event)
  };
}

/**
 * @description Dynamic AWS metadata.
 */
type DynamicMetadata = {
  /**
   * @description The AWS account ID that the system is running in.
   */
  accountId: string;
  /**
   * @description Correlation ID (AWS request ID) for this function call.
   */
  correlationId: string;
  /**
   * @description Memory size of the current function.
   */
  functionMemorySize: string;
  /**
   * @description The name of the function.
   */
  functionName: string;
  /**
   * @description The version of the function.
   */
  functionVersion: string;
  /**
   * @description The region of the responding function/system.
   */
  region: string;
  /**
   * @description The resource (channel, URL path...) that is responding.
   */
  resource: string;
  /**
   * @description What runtime is used?
   */
  runtime: string;
  /**
   * @description What AWS stage are we in?
   */
  stage: string;
  /**
   * @description Request time in Unix epoch of the incoming request.
   */
  timestampRequest: string;
  /**
   * @description The user in this context.
   */
  user: string;
  /**
   * @description Which country did AWS CloudFront infer the user to be in?
   */
  viewerCountry: string;
};
