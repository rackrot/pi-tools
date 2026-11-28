---
name: value-old-line-hotfix-plan
description: "Value case. A plan to hotfix an old line in a HubFlow repo on a new laptop: the skill says there is no package-manager install (clone and install.sh), hotfix start from an older tag still finishes into the latest master, hotfix start pushes on its own, finish resolves conflicts toward the hotfix branch (-Xtheirs), and an open release branch gets the hotfix only by a manual merge. Graded by regex on five fixed final lines; the two lines bare Haiku already gets (FINISH_MERGES_INTO, RELEASE_3_2_0) are weight 1, INSTALL and CONFLICT weight 2."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

legacy repo, the old clone has a [hubflow] section in .git/config and everything was done with `git hf` 1.5.4. I'm on a new mac with nothing installed. master is at tag 3.1.0 and release/3.2.0 is open on origin. a customer still on 2.4.2 needs a one-line fix, and prod (3.1.0) has the same bug, though that file has been reworked a lot on master since 2.4.2. my plan:

1. `brew install hubflow`
2. `git hf hotfix start 2.4.3 2.4.2`   (branch from the old 2.4.2 tag)
3. commit the fix
4. `git hf hotfix finish 2.4.3`

you can't run anything here, there is no repo. check the plan and tell me what each step really does.

End your reply with exactly these five lines, one value each, nothing after them:

INSTALL: <brew or other-package-manager or clone-and-install-script>   (how git hf actually gets installed)
START_PUSHES: <yes or no>   (does step 2 push hotfix/2.4.3 to origin on its own)
FINISH_MERGES_INTO: <latest-master or a-2.4-maintenance-line>   (where step 4 merges the hotfix)
CONFLICT: <stops-for-manual-resolution or hotfix-version-wins or master-version-wins>   (what happens to lines changed both on master since 2.4.2 and on the hotfix branch when step 4 merges)
RELEASE_3_2_0: <gets-fix-automatically or needs-manual-merge>   (how the fix reaches the open release/3.2.0 branch before it ships)
