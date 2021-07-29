#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DemoEcsGithubRunnerStack } from '../lib/demo-ecs-github-runner-stack';

const app = new cdk.App();
new DemoEcsGithubRunnerStack(app, 'DemoEcsGithubRunnerSpotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
