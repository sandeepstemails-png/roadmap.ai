the plan is to make a roadmap website. जहाँ पे मुझको एक ऐसी website चाहिए जिसमें front end है, back end है, database है, और front end के लिए हम लोग Next.js use कर रहे हैं। Back end के लिए भी Next.js use हो सकता है। Database local में अगर मैं चला रहा हूँ, तो SQLite use करूँगा, but वहीं पे अगर मैं इसको productionize करना चाहता हूँ, तो Turso use करने वाला हूँ। मेरा जो deployment होगा, वो होगा Vercel पे। मेरी जो CI/CD pipelines होंगी, वो GitHub Actions के through होंगी। ये initial plan है। चलो, इसको initial plan के heading पे लिख दो।                        

The tech stack list would be:
- Frontend: Next.js
- SQLite
- Vercel deployment
- Sub-agents for linting and test cases
These sub-agents will be built with Claude. That's the plan. That's it. 

This project will be done in two phases:
 1. Deployment using GitHub Actions to Vercel via my GitHub repository. यहाँ पे मेरा जो भी application होगा, वो पूरा का पूरा Claude पे develop होगा, so मुझको एक Claude का proper prompt चाहिए होगा, proper skills चाहिए होंगी और sub-agents चाहिए होंगे।
 2. इसी project के Docker containers बनेंगे, और उसको Terraform के through AWS पे एक EC2 instance बना के Docker compose के through मैं deploy करने वाला हूँ।
 This is my phase two.

## Plan update: Claude Code skills installed

To make Claude Code act as a proper software/DevOps engineer on this project, the following skills were found via `npx skills find` (skills.sh) and installed globally (`-g`), so they're available in every Claude Code session on this machine:

**Frontend (Next.js)**
- `wshobson/agents@nextjs-app-router-patterns` — App Router, Server Components, streaming, parallel routes
- `giuseppe-trisciuoglio/developer-kit@nextjs-deployment` — Docker/CI/CD/env var patterns for shipping Next.js to production (flagged Med Risk / 1 alert by Snyk in the install scan — reviewed as safe for this use, but worth re-checking if used for anything sensitive)

**DevOps (CI/CD, Docker, Terraform, AWS — covers Phase 1 Vercel/GitHub Actions and Phase 2 Docker/Terraform/EC2)**
- `jeffallan/claude-skills@devops-engineer` — Dockerfiles, CI/CD pipelines, Terraform/Pulumi IaC, GitOps
- `github/awesome-copilot@multi-stage-dockerfile` — optimized multi-stage Dockerfiles (Phase 2)
- `bagelhole/devops-security-agent-skills@terraform-aws` — Terraform modules/state for AWS (Phase 2)
- `bagelhole/devops-security-agent-skills@aws-ec2` — EC2 instances, security groups, AMIs (Phase 2)

**UI/UX**
- `nextlevelbuilder/ui-ux-pro-max-skill@design-system` — design tokens, component specs
- `github/awesome-copilot@penpot-uiux-design` — UI/UX design workflow, accessibility, platform guidelines

**Database (SQLite local / Turso production)**
- `martinholovsky/claude-skills-generator@SQLite Database Expert` — SQLite schema/query/perf guidance for local dev
- `oakoss/agent-skills@turso` — libSQL/Turso embedded replicas, platform API, Drizzle integration for production DB

These sit alongside the built-in `frontend-design` skill (Anthropic) already available for visual/aesthetic direction.
