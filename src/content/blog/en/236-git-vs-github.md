---
title: "Use Git for History and GitHub for Collaboration"
description: "Distinguishing local version control from remote hosting through a community directory scenario."
pubDate: 2026-10-08T20:48:00.000Z
translationKey: 236-git-vs-github
seriesOrder: 53
locale: en
tags: ["deployment-devops","learning-series"]
draft: false
---

## Distributed Version Control vs. Centralized Hosting

A common misconception is that Git and GitHub are the same tool. Git is a distributed version control system (DVCS) that runs locally on your machine. It tracks changes to files, allows you to jump back to previous states, and manages different lines of development (branches). GitHub is a cloud-based hosting service that stores Git repositories.

You can develop entirely without GitHub. Because Git is distributed, every contributor has a full copy of the project history on their hard drive. This allows for offline operation: you can commit changes, create branches, and view logs while on a plane or in a remote area without internet access. GitHub simply acts as a common synchronization point (a remote) where contributors push their local history to share it with others.

## Why History is Not a Backup

While Git stores every version of every file, it is not a replacement for a backup strategy. A Git repository tracks the evolution of the source code, but it does not protect against hardware failure of the local disk or accidental deletion of the entire `.git` directory. Furthermore, Git is designed for text-based source files; storing large binary blobs in Git history bloats the repository size for every single person who clones it, as they must download the entire history.

## Worked Scenario: The Community Directory

Two volunteers, Alice and Bob, are maintaining a `directory.txt` file containing community contact info.

### 1. Local Initialization and First Commit
Alice starts the project locally. She creates the file and initializes the repository.

```bash
# Illustrative: Alice's local setup
git init -b main community-dir
cd community-dir
echo "Alice: 555-0101" > directory.txt
git add directory.txt
git commit -m "Initial directory setup"
```

### 2. Branching for New Features
Bob wants to add a category for "Local Businesses" but doesn't want to break the main list until it is verified. He creates a feature branch.

```bash
# Illustrative: Bob creates a separate line of work
git checkout -b add-businesses
echo "Bakery: 555-0202" >> directory.txt
git add directory.txt
git commit -m "Add bakery contact"
```

### 3. Reviewing the Diff
Before merging, Bob reviews exactly what changed. The `diff` command shows the precise lines added or removed.

```bash
# Illustrative: Checking changes against the main branch
git diff main add-businesses
```
**Output Meaning:** The output shows a `+` sign next to "Bakery: 555-0202", indicating this line exists in the feature branch but not in the main branch.

### 4. Remote Synchronization
To share the work, they use a GitHub repository as the remote. Alice pushes the main branch, and Bob pushes his feature branch for review.

```bash
# Illustrative: Connecting local to remote
git remote add origin https://github.com/user/community-dir.git
git push -u origin main
# Bob pushes his branch
git push origin add-businesses
```

## Consequences of the Workflow

By using branches, Bob avoided "breaking" the main directory. If he had committed directly to `main` and made a mistake, he would have to navigate the history to revert. By pushing to a remote, Alice can now `git fetch` Bob's changes, review them, and merge them into `main` only after verification.

## Exercise

Distinguish two situations. To discard an uncommitted working-tree edit, git restore config.json normally restores from the index; inspect git diff and git diff --cached first because staged content may differ from HEAD. To explicitly restore the committed version into the working tree, use git restore --source=HEAD -- config.json after confirming you want to discard that edit.

If the mistaken change was already committed and shared, git revert <commit> creates a new inverse commit and preserves history. For only one file from an earlier version, restore from a chosen known commit, review the diff and commit the correction. A restore does not itself undo an existing commit.

Bob needs a clone or an agreed shared local checkout before the branch steps; the example omits that setup. Git records committed snapshots, not every untracked or ignored file. Shallow and partial clones may not include all history. Branches help isolate changes but do not prove correctness without review.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
