const RefParser = require('@apidevtools/json-schema-ref-parser');
const fs = require('fs');
const path = require('path');

const COMPOSE_URL = 'https://raw.githubusercontent.com/compose-spec/compose-spec/main/schema/compose-spec.json';
const K8S_VERSIONS = ['v1.28.0', 'v1.29.0', 'v1.30.0'];
const K8S_BASE_URL = 'https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'schemas');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function fetchOne(url, outPath) {
  console.log('Fetching ' + url + '...');
  try {
    const schema = await RefParser.dereference(url);
    fs.writeFileSync(outPath, JSON.stringify(schema, null, 2));
    return true;
  } catch (e) {
    console.error('Failed: ' + e.message);
    return false;
  }
}

async function main() {
  // Docker Compose
  await ensureDir(path.join(OUTPUT_DIR, 'compose'));
  await fetchOne(COMPOSE_URL, path.join(OUTPUT_DIR, 'compose', 'spec.json'));

  // Kubernetes ???
  const resources = [
    { kind: 'pod', file: 'pod-v1.json' },
    { kind: 'service', file: 'service-v1.json' },
    { kind: 'deployment', file: 'deployment-apps-v1.json' },
    { kind: 'ingress', file: 'ingress-networking-v1.json' },
    { kind: 'configmap', file: 'configmap-v1.json' },
    { kind: 'secret', file: 'secret-v1.json' },
    { kind: 'pvc', file: 'persistentvolumeclaim-v1.json' },
    { kind: 'namespace', file: 'namespace-v1.json' },
    { kind: 'job', file: 'job-batch-v1.json' },
    { kind: 'cronjob', file: 'cronjob-batch-v1.json' }
  ];

  for (const ver of K8S_VERSIONS) {
    const verDir = path.join(OUTPUT_DIR, 'k8s', ver);
    await ensureDir(verDir);
    const baseUrl = K8S_BASE_URL + ver + '-standalone-strict/';
    
    for (const r of resources) {
      await fetchOne(baseUrl + r.file, path.join(verDir, r.kind + '.json'));
    }
  }
  console.log('Finished Multi-version Phase.');
}

main();
