# Sourced by case scaffolds. Builds a colocated jj repo with one base commit and isolated identity (HOME is the workspace).
export JJ_USER="Eval" JJ_EMAIL="eval@example.com"
export GIT_AUTHOR_NAME="$JJ_USER" GIT_AUTHOR_EMAIL="$JJ_EMAIL" GIT_COMMITTER_NAME="$JJ_USER" GIT_COMMITTER_EMAIL="$JJ_EMAIL"
jj git init --colocate . >/dev/null
printf 'def greet(name):\n    return "hello " + name\n' > greet.py
printf '# demo\n' > README.md
JJ_EDITOR=false jj commit -m "initial" >/dev/null
