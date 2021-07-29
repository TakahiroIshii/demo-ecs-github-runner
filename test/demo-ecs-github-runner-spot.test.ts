import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DemoEcsGithubRunner from '../lib/demo-ecs-github-runner-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new DemoEcsGithubRunner.DemoEcsGithubRunnerStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT,
    ),
  );
});
