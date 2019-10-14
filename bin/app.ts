#!/usr/bin/env node
import "source-map-support/register";
import cdk = require("@aws-cdk/core");
import { EchoStack } from "../lib/echo-stack";
import { BackendStack } from "../lib/backend-stack";
import { FrontendStack } from "../lib/frontend-stack";

const app = new cdk.App();
const echoStack = new EchoStack(app, "EchoStack");
const backendStack = new BackendStack(app, "BackendStack");
const frontendStack = new FrontendStack(app, "FrontendStack");

const ownerTag = new cdk.Tag("owner", "Max.Mustermann");
[echoStack, backendStack, frontendStack].forEach(stack => ownerTag.visit(stack));
