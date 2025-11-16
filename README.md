<div align="center">
  
# 👋 Hi, I'm Bukely

### 🤖 AI Engineer | RAG Architect | Open Source Enthusiast

[![GitHub followers](https://img.shields.io/github/followers/BukeLy?style=social)](https://github.com/BukeLy)
[![GitHub stars](https://img.shields.io/github/stars/BukeLy?style=social)](https://github.com/BukeLy)

</div>

---

## 🚀 About Me

```python
class AIEngineer:
    def __init__(self):
        self.name = "Bukely"
        self.role = "AI Automation Developer"
        self.location = "🇲🇾 Kuala Lumpur, Malaysia"
        self.current_focus = ["RAG Systems", "AI Agents", "LLM Applications"]
        
    def current_work(self):
        return {
            "🔭 Building": "Multi-tenant AI SaaS Platform with RAG + Agent",
            "🌱 Learning": "Advanced LLM Optimization & Multi-modal AI",
            "🤝 Contributing": "Open Source AI/ML Projects",
            "💬 Ask me about": "RAG, Agent Workflows, AWS Serverless"
        }
```

---

## 🛠️ Tech Stack

### AI/ML & LLM
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Hugging Face](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)

### Cloud & Infrastructure
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)

### Development Tools
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)

---

## 🎯 Open Source Work

### 🔥 Featured Project

#### [rag-api](https://github.com/bukely/rag-api)
> Multi-tenant RAG core service providing isolated semantic retrieval and memory capabilities for AI Agents

**Why this matters:**
- 🏗️ Solves the critical challenge of tenant isolation in multi-tenant RAG systems
- 🔒 Implements tenant-level namespace locking for true concurrent processing
- ⚡ Enables high-performance semantic search across isolated workspaces
- 🎯 Production-ready architecture for building scalable AI SaaS platforms

**Tech Stack:** Python, LightRAG, Vector Database, Redis

**Recognition:** ⭐ Starred by LightRAG author

---

### 🤝 Open Source Contributions

#### [LightRAG](https://github.com/HKUDS/LightRAG) - Multi-tenant Performance Optimization
**PR [#2353](https://github.com/HKUDS/LightRAG/pull/2353)** ✅ Merged

**Problem Solved:**
- Identified global lock bottleneck causing serialized processing in multi-tenant scenarios
- All tenants were blocked by a single `pipeline_status` global lock

**Solution:**
- Refactored global lock to tenant-level namespace locks (`{workspace}:pipeline`)
- Enabled true concurrent processing across tenants

**Impact:**
- 🚀 **3x performance improvement** in 3-tenant scenarios
- 📈 Theoretical **Nx improvement** for N tenants
- 🔓 Unlocked true multi-tenant scalability

**Technical Details:**
```python
# Before: Global lock (serialized)
lock = redis_client.lock("pipeline_status")

# After: Tenant-namespaced lock (parallelized)  
lock = redis_client.lock(f"{workspace}:pipeline_status")
```

---

#### [MineContext](https://github.com/bytedance/MineContext) - Windows Platform Fix
**PR [#214](https://github.com/bytedance/MineContext/pull/214)** ✅ Merged

**Problem Solved:**
- Application crashed on startup for all Windows users (critical bug)
- Root cause: Missing C extensions (`_ssl`, `_hashlib`) in PyInstaller build

**Solution:**
- Modified `.spec` file to explicitly include Windows-specific C extensions
- Fixed OPENSSL_Applink error through proper hiddenimports configuration

**Impact:**
- 🎯 Fixed critical bug affecting **100% of Windows users**
- 💡 Enabled cross-platform compatibility for 1K+ starred project

---

## 📊 GitHub Stats

<div align="center">
  
![Bukely's GitHub stats](https://github-readme-stats.vercel.app/api?username=BukeLy&show_icons=true&theme=radical&hide_border=true&include_all_commits=true&count_private=true)

![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=BukeLy&layout=compact&theme=radical&hide_border=true&langs_count=8)

![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user=BukeLy&theme=radical&hide_border=true)

</div>

---

## 🏆 Technical Highlights

```diff
+ 🔥 Built production-grade multi-tenant AI SaaS platform
+ ⚡ Optimized LightRAG framework: 3x performance boost in multi-tenant scenarios
+ 🌟 Active contributor to AI/ML open-source ecosystem
+ 🎯 Deep expertise in RAG architecture and Agent workflows
+ 🚀 Proven track record of solving complex distributed systems challenges
```

---

## 💡 Current Focus

```typescript
const currentGoals = {
  learning: [
    "Advanced RAG optimization techniques",
    "Multi-modal AI applications", 
    "LLM fine-tuning & optimization",
    "Agent orchestration frameworks",
    "Transformer architecture deep dive"
  ],
  building: [
    "Scalable multi-tenant RAG systems",
    "Intelligent automation platforms",
    "Open-source AI utilities"
  ],
  contributing: [
    "LightRAG ecosystem enhancements",
    "AI/ML community-driven projects"
  ]
}
```

---

## 📈 Areas of Expertise

- **RAG Systems**: Multi-tenant architecture, vector search optimization, hybrid retrieval
- **AI Agents**: Workflow orchestration, function calling, memory management
- **Cloud Architecture**: AWS Serverless (Lambda, DynamoDB, Amplify)
- **Performance Engineering**: Distributed locking, concurrency optimization
- **Problem Solving**: Root cause analysis, system debugging, cross-platform issues

---

## 📫 Connect With Me

<div align="center">

[![Email](https://img.shields.io/badge/Email-bukely0119@foxmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:bukely0119@foxmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-BukeLy-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BukeLy)
[![Telegram](https://img.shields.io/badge/Telegram-@Bukely-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/bukely)

</div>

---

<div align="center">

### 💬 "Building the future with AI, one commit at a time"

![Profile Views](https://komarev.com/ghpvc/?username=BukeLy&color=blueviolet&style=for-the-badge)

⭐️ From [BukeLy](https://github.com/BukeLy)

</div>
