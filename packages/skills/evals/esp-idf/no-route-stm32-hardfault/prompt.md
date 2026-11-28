---
name: no-route-stm32-hardfault
description: Negative routing. A FreeRTOS crash on an STM32 (HAL, CubeIDE) is embedded work with no Espressif angle and must not open esp-idf.
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My STM32F407 board resets a few seconds after the FreeRTOS scheduler starts. In STM32CubeIDE the debugger stops in HardFault_Handler, CFSR is 0x00008200 and BFAR is 0x00000004. The sensor task uses the HAL I2C driver. What is going on and how do I find the line that faults?
