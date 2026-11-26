# Conflicts

jj records a conflict inside the commit and keeps going. Find them, fix them in the files, and check again.

1. **Find:** `jj st` lists conflicted paths in the working copy; `jj log -r 'conflicts() & ::@'` lists conflicted commits in your stack; `jj resolve --list` lists paths in `@`.
2. **Go to the conflicted change:** if it is not `@`, `jj new <conflicted-rev>` (or `jj edit <rev>`). The files now contain conflict markers.
3. **Edit the files** to the intended result and remove every marker. jj's markers look like:

```
<<<<<<< conflict 1 of 1
%%%%%%% diff from: base
\\\\\\\ to: side #1
 unchanged line
-old line
+new line
+++++++ side #2
other side's content
>>>>>>> conflict 1 of 1 ends
```

The `%%%%%%%` section is a diff to apply onto the `+++++++` snapshot. The result is that snapshot with that diff applied, not a pick of one side.
4. **Check:** `jj st` should no longer list the path as conflicted (jj re-snapshots on the next command). If you used `jj new`, fold the fix back with `jj squash`.
5. **Do not use `jj resolve` without a non-interactive merge tool;** it opens a TUI. `jj resolve --tool :ours` or `:theirs` takes a whole side and needs no terminal.

Descendants of a fixed change are rebased automatically and often become conflict-free; re-run the `conflicts()` query afterwards.
