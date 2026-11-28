---
name: route-implicit-missing-trx
description: "Routing, implicit. A CI step that passes but leaves no .trx files for MSTest.Sdk projects is a VSTest-option-on-MTP problem and routes to dotnet-testing without the words VSTest, MTP, filter or Microsoft.Testing.Platform."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our pipeline step is `dotnet test Shop.sln --configuration Release --logger "trx;LogFileName=results.trx"`. it goes green and the log shows the tests passing, but the publish-results step right after it finds no .trx files anywhere, so the Tests tab in Azure DevOps is empty. the three test projects all start with `<Project Sdk="MSTest.Sdk">`, we build with the .NET 9 SDK. what is wrong with the command and what should it be?
