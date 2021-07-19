import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as DemoEcsGithubRunnerSpot from '../lib/demo-ecs-github-runner-spot-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DemoEcsGithubRunnerSpot.DemoEcsGithubRunnerSpotStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
