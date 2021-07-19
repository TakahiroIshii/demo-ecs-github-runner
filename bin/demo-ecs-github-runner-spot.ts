#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DemoEcsGithubRunnerSpotStack } from '../lib/demo-ecs-github-runner-spot-stack';

const app = new cdk.App();
new DemoEcsGithubRunnerSpotStack(app, 'DemoEcsGithubRunnerSpotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
