---
title: "Git vs GitHub"
description: "A clear distinction between the local version control system and the cloud-based hosting platform."
pubDate: 2026-10-16T11:48:00.000Z
translationKey: 236-git-vs-github
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine you are working on a procurement application. You have spent hours writing the logic for a requester to submit a purchase request. Suddenly, you make a change that breaks the entire submission flow, and you realize you cannot remember exactly what the code looked like twenty minutes ago. This is where version control becomes essential, but beginners often confuse the tool that saves the work with the place where the work is stored.

## Understanding Git as the Engine
Git is a local distributed version control system. It is software that you install on your own computer. Git tracks the history of your files, allowing you to create 'snapshots' (commits) of your project. Because it is distributed, every developer has a full copy of the project history on their machine. You do not need an internet connection to commit changes, create branches for new features, or revert to a previous version of your procurement logic.

## Understanding GitHub as the Hub
GitHub is a cloud-based hosting service that manages Git repositories. If Git is like a document editor that tracks changes, GitHub is like Google Drive or Dropbox specifically designed for Git. It provides a graphical interface, user management, and collaboration tools like Pull Requests. While Git handles the technical versioning, GitHub allows a manager to review the code before a buyer's ordering module is merged into the main project.

## A Worked Example: The Procurement Flow
Suppose you are developing the `RequestService.java` class:

1. **Local Action (Git):** You write the code and run `git commit -m "Add request submission logic"`. This saves the state locally.
2. **Remote Action (GitHub):** You run `git push origin main`. This uploads your local commit to the GitHub server so your teammates can see it.
3. **Collaboration (GitHub):** Your lead developer opens a Pull Request on GitHub to review your changes before they are merged.

## Common Mistake: "GitHub is down, I can't commit"
Many beginners think that if they lose internet access or if GitHub is offline, they cannot save their work. This is incorrect. Since Git is local, you can continue to commit, branch, and merge on your machine. You only need GitHub when you want to share your code or back it up remotely.

## Practical Exercise
Which tool would you use to create a new branch called `feature-manager-approval` while offline?

**Answer:** Git. Branching is a local operation handled by the Git software on your machine.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
