const fs = require('fs');
const path = require('path');

const COMPONENT_PATH = path.join(__dirname, '../src/components/ui/infinite-slider.tsx');
const PUBLIC_DIR = path.join(__dirname, '../public');
const REGISTRY_PATH = path.join(PUBLIC_DIR, 'registry.json');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  console.log('Created missing /public directory');
}

try {
  const code = fs.readFileSync(COMPONENT_PATH, 'utf8');

  const registry = {
    "name": "infinite-slider",
    "type": "registry:ui",
    "dependencies": ["clsx", "tailwind-merge"],
    "files": [
      {
        "path": "ui/infinite-slider.tsx",
        "type": "registry:ui",
        "content": code
      }
    ]
  };

  // 3. Write the formatted JSON
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log('registry.json has been synchronized successfully.');
} catch (error) {
  console.error('Failed to sync registry:', error.message);
  process.exit(1);
}