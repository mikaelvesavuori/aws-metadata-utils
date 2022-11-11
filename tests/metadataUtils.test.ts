import test from 'ava';

import { createDynamicMetadata } from '../src';

import event from '../testdata/event.json';
import context from '../testdata/context.json';

/**
 * POSITIVE TESTS
 */
test.serial('It should return a fully formatted metadata object', (t) => {
  const expected = {
    accountId: '123412341234',
    correlationId: '6c933bd2-9535-45a8-b09c-84d00b4f50cc',
    functionMemorySize: '1024',
    functionName: 'somestack-FunctionName',
    functionVersion: '$LATEST',
    region: 'eu-north-1',
    resource: '/functionName',
    runtime: '',
    stage: 'shared',
    user: 'some user',
    viewerCountry: 'SE'
  };

  const response: any = createDynamicMetadata(event, context);

  t.not(response['timestampRequest'], undefined);

  delete response['timestampRequest'];

  t.deepEqual(response, expected);
});

test.serial('It should return an empty string for correlation ID if it is not set', (t) => {
  const _context: any = JSON.parse(JSON.stringify(event));
  delete _context.awsRequestId;

  const expected = '';
  const response = createDynamicMetadata(event, _context).correlationId;

  // @ts-ignore
  t.is(response, expected);
});

test.serial('It should set correlation ID from AWS request ID', (t) => {
  const expected = '6c933bd2-9535-45a8-b09c-84d00b4f50cc';
  const response = createDynamicMetadata(event, context).correlationId;

  t.is(response, expected);
});

test.serial('It should get correlation ID if given in headers', (t) => {
  const expected = 'asdf1234';

  const _event: any = JSON.parse(JSON.stringify(event));
  _event['headers'] = {
    'x-correlation-id': expected
  };
  const _context = JSON.parse(JSON.stringify(context));
  _context['awsRequestId'] = '';

  const response = createDynamicMetadata(_event, _context).correlationId;

  t.is(response, expected);
});

test.serial('It should set correlation ID if given in detail metadata', (t) => {
  const expected = 'asdf1234';

  const _event: any = JSON.parse(JSON.stringify(event));
  _event['detail'] = {
    metadata: {
      correlationId: expected
    }
  };
  const _context = JSON.parse(JSON.stringify(context));
  _context['awsRequestId'] = '';

  const response: any = createDynamicMetadata(_event, _context).correlationId;

  // @ts-ignore
  t.deepEqual(response, expected);
});

test.serial('It should set region', (t) => {
  process.env.AWS_REGION = 'eu-north-1';

  const expected = process.env.AWS_REGION;
  const response = createDynamicMetadata(event, context).region;

  t.is(response, expected);
  process.env.AWS_REGION = '';
});

test.serial('It should set runtime', (t) => {
  process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs16';

  const expected = process.env.AWS_EXECUTION_ENV;
  const response = createDynamicMetadata(event, context).runtime;

  t.is(response, expected);
  process.env.AWS_EXECUTION_ENV = '';
});

test.serial('It should set function name ', (t) => {
  process.env.AWS_LAMBDA_FUNCTION_NAME = 'somestack-FunctionName';

  const expected = process.env.AWS_LAMBDA_FUNCTION_NAME;
  const response = createDynamicMetadata(event, context).functionName;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_NAME = '';
});

test.serial('It should set function memory size', (t) => {
  process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '1024';

  const expected = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE;
  const response = createDynamicMetadata(event, context).functionMemorySize;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '';
});

test.serial('It should set function version', (t) => {
  process.env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST';

  const expected = process.env.AWS_LAMBDA_FUNCTION_VERSION;
  const response = createDynamicMetadata(event, context).functionVersion;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_VERSION = '';
});

test.serial('It should set resource (or detail type) if given event detail-type', (t) => {
  const _event: any = JSON.parse(JSON.stringify(event));
  _event['path'] = '';
  _event['detail-type'] = 'SomeDetail';

  const expected = 'SomeDetail';
  const response = createDynamicMetadata(_event, context).resource;

  t.is(response, expected);
});

test.serial('It should set resource (or detail type) if given event path', (t) => {
  const expected = '/functionName';
  const response = createDynamicMetadata(event, context).resource;

  t.is(response, expected);
});

test.serial('It should set resource as an empty string if no match is found', (t) => {
  const expected = '';
  // @ts-ignore
  const response = createDynamicMetadata().resource;

  t.is(response, expected);
});

test.serial('It should not set user if given no event or context', (t) => {
  const _event: any = JSON.parse(JSON.stringify(event));
  delete _event.requestContext.identity.user;

  const expected = '';
  const response = createDynamicMetadata(_event, context).user;

  // @ts-ignore
  t.is(response, expected);
});

test.serial('It should set user if it is given in requestContext', (t) => {
  const expected = 'some user';
  const response = createDynamicMetadata(event, context).user;

  t.is(response, expected);
});

test.serial('It should set stage', (t) => {
  const expected = 'shared';
  const response = createDynamicMetadata(event, context).stage;

  t.is(response, expected);
});

test.serial('It should set viewer country', (t) => {
  const expected = 'SE';
  const response = createDynamicMetadata(event, context).viewerCountry;

  t.is(response, expected);
});

test.serial('It should set account ID (from Lambda event)', (t) => {
  const expected = '123412341234';
  const response = createDynamicMetadata(event, context).accountId;

  t.is(response, expected);
});

test.serial('It should set account ID (from EventBridge object)', (t) => {
  const expected = '123412341234';

  const _event = JSON.parse(JSON.stringify(event));
  _event['requestContext']['accountId'] = '';
  _event['account'] = expected;
  const response = createDynamicMetadata(_event, context).accountId;

  t.is(response, expected);
});

test.serial('It should set the timestamp from the incoming request', (t) => {
  const response = createDynamicMetadata(event, context).timestampRequest;

  const isTimestampCorrectLength = response.length === 13;

  t.is(isTimestampCorrectLength, true);
});
