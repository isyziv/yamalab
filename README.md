# YAMLab

Schema 驅動的 Kubernetes & Docker Compose YAML 產生器。

**線上版本：** https://isyziv.github.io/yamalab/

## 功能

- **Kubernetes** — 涵蓋 Workloads、Network、Config、Storage、RBAC、Policy、Cluster 等 20+ 種資源
- **Docker Compose** — services、networks、volumes、configs、secrets
- Schema 驗證（支援 K8s v1.28 / v1.29 / v1.30）
- 即時 YAML 預覽與語法高亮
- YAML ↔ JSON 轉換器
- Schema 瀏覽器

## 本地開發

```bash
npm install
npm run dev
```

## 技術棧

React 18 · Vite 7 · js-yaml
