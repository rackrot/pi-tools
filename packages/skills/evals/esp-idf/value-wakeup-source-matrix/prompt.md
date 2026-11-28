---
name: value-wakeup-source-matrix
description: Value case. Per-chip sleep wakeup rules a bare model gets wrong from memory - classic ESP32 EXT1 has ALL_LOW but no ANY_LOW (W2) and v6.0 removed esp_deep_sleep_enable_gpio_wakeup() (W6); W1, W3, W4, W5 are controls so an all-BROKEN answer does not pass. Read and Skill only, so the no-skill arm cannot grep an ESP-IDF checkout installed on the eval machine.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Skill]
---

reviewing the low-power design notes for four boards, all on ESP-IDF v6.0. For each statement tell me whether it works as written.

- W1: ESP32-C3 board. Wake from deep sleep with `esp_sleep_enable_ext0_wakeup()` on GPIO4.
- W2: classic ESP32 (WROOM-32E) board. Two active-low buttons on GPIO32 and GPIO33 with external pull-ups. Wake from deep sleep through EXT1 as soon as either button alone is pressed (the other pin stays high).
- W3: ESP32-S3 board. Same two-button circuit on GPIO4 and GPIO5, same requirement, through EXT1.
- W4: ESP32-C6 board. Wake from deep sleep through EXT1 on GPIO10.
- W5: ESP32-C3 board. Wake from light sleep (peripherals stay powered) on GPIO18 with `gpio_wakeup_enable()` plus `esp_sleep_enable_gpio_wakeup()`.
- W6: ESP32-C3 board. Wake from deep sleep by calling `esp_deep_sleep_enable_gpio_wakeup()` on GPIO3.

end your reply with exactly one line per statement in the form `W1: WORKS` or `W1: BROKEN`, W1 to W6 in order.
