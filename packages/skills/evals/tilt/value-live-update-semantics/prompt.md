---
name: value-live-update-semantics
description: Value case. Three live_update rules. A context change that matches no sync step rebuilds the image, run steps execute from / and not the image WORKDIR, and fall_back_on must come before sync; the bare model tends to say the unmatched file is ignored and the command runs in WORKDIR.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our api image is built from the repo root. The Dockerfile has `WORKDIR /app`, copies everything into `/app` and there is no .dockerignore. The Tiltfile has:

```python
docker_build('api', '.', live_update=[
    sync('./src', '/app/src'),
    sync('./requirements.txt', '/app/requirements.txt'),
    run('pip install -r requirements.txt', trigger='./requirements.txt'),
])
k8s_yaml('k8s/api.yaml')
```

Three questions about how Tilt behaves with exactly this file while `tilt up` is running and the api pod is healthy:

- Q1: I fix a typo in `docs/notes.md` at the repo root level (`./docs/notes.md`). What does Tilt do for the api resource: NOTHING (the change is ignored), SYNC (the file is copied into the container), or REBUILD (full image build and redeploy)?
- Q2: I edit `requirements.txt`, so the `run` step fires. From which directory inside the container is `pip install -r requirements.txt` executed? Give the absolute path.
- Q3: To force a rebuild when the Dockerfile changes, a colleague appends `fall_back_on('./Dockerfile')` as a fourth element, after the `run` step. Is the resulting list accepted by Tilt (OK) or rejected when the Tiltfile loads (ERROR)?

End your reply with exactly three lines in this form, nothing after them:

Q1: NOTHING or SYNC or REBUILD
Q2: <absolute path>
Q3: OK or ERROR
