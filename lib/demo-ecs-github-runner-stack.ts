import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ssm from '@aws-cdk/aws-ssm';
import * as iam from '@aws-cdk/aws-iam';
import { CfnParameter } from '@aws-cdk/core';

export class DemoEcsGithubRunnerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'actionsRunnerVpc', {
      maxAzs: 1,
    });
    const cluster = new ecs.Cluster(this, 'actionsRunnerCluster', {
      vpc,
      clusterName: 'gitHub-actions-runner-cluster',
    });

    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, 'actionsRunnerAutoScalingGroup', {
      vpc,
      minCapacity: 1,
      maxCapacity: 1,
      instanceType: new ec2.InstanceType('t3.xlarge'),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
    });

    const cp = new ecs.AsgCapacityProvider(this, 'actionsRunnerCapacityProvider', {
      autoScalingGroup,
      enableManagedTerminationProtection: false,
      spotInstanceDraining: true,
    });

    cluster.addAsgCapacityProvider(cp);

    const taskRole = new iam.Role(this, 'actionsRunnerRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPowerUser')],
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'ec2TaskDefinitionWith', {
      taskRole,
    });

    taskDefinition.addVolume({
      name: 'docker_sock',
      host: {
        sourcePath: '/var/run/docker.sock',
      },
    });

    const containerDefinition = taskDefinition.addContainer('actionsRunnerContainer', {
      environment: {
        RUNNER_NAME_PREFIX: `ecsRunner`,
      },
      image: ecs.ContainerImage.fromRegistry('myoung34/github-runner'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'actionRunner' }),
      memoryLimitMiB: 5000,
      secrets: {
        ACCESS_TOKEN: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'gitHubAccessToken', {
            parameterName: 'GITHUB_ACCESS_TOKEN',
            version: 0,
          }),
        ),
        REPO_URL: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'gitHubContext', {
            parameterName: 'GITHUB_ACTIONS_RUNNER_CONTEXT',
            version: 0,
          }),
        ),
      },
    });

    containerDefinition.addMountPoints({
      containerPath: '/var/run/docker.sock',
      sourceVolume: 'docker_sock',
      readOnly: true,
    });

    const ecsTaskDesiredCount = new CfnParameter(this, 'ecsTaskDesiredCount', {
      type: 'Number',
      default: 2,
      description: 'The name of ecs task count.',
    });

    new ecs.Ec2Service(this, 'actionsRunnerService', {
      cluster,
      taskDefinition,
      desiredCount: ecsTaskDesiredCount.valueAsNumber,
    });
  }
}
