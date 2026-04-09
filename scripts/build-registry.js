const fs = require('fs');
const path = require('path');

const COMPONENT_PATH = path.join(__dirname, '../src/components/ui/infinite-slider.tsx');
const REGISTRY_PATH = path.join(__dirname, '../public/registry.json');

// Read the actual component code
const code = fs.readFileSync(COMPONENT_PATH, 'utf8');

const registry = {
  "name": "infinite-slider",
  "type": "registry:ui",
  "dependencies": ["clsx", "tailwind-merge"],
  "files": [
    {
      "path": "ui/infinite-slider.tsx",
      "type": "registry:ui",
      "content": code // The script handles the string conversion!
    }
  ]
};

// Write the formatted JSON to the public folder
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

console.log('✅ registry.json has been synchronized with your component code.');
