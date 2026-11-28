---
name: trigger-interop-implicit-load-failure
description: "Implicit trigger: a native library that fails to load in a container, described by its symptom only. No P/Invoke, DllImport or interop wording."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our thumbnailer works on my mac and on the windows build box, but in the alpine container it dies on the first image with

System.DllNotFoundException: Unable to load shared library 'vipswrap' or one of its dependencies

libvipswrap.so is definitely in the image, right next to the app dll. net10.0. what do I check?
