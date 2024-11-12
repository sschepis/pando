#!/bin/bash

# Update imports from '../AIAssistant' to '../ai/AIAssistant'
sed -i '' 's/from '\''\.\.\/AIAssistant'\''/from '\''\.\.\/ai\/AIAssistant'\''/' src/extension/commands.ts
sed -i '' 's/from '\''\.\.\/AIAssistant'\''/from '\''\.\.\/ai\/AIAssistant'\''/' src/extension/activation.ts
sed -i '' 's/from '\''\.\.\/AIAssistant'\''/from '\''\.\.\/ai\/AIAssistant'\''/' src/extension/providers.ts
sed -i '' 's/from '\''\.\/AIAssistant'\''/from '\''\.\/ai\/AIAssistant'\''/' src/pandoVSCodeBridge.ts
sed -i '' 's/from '\''\.\.\/AIAssistant'\''/from '\''\.\.\/ai\/AIAssistant'\''/' src/pandoExecutionEngine/engine.ts
sed -i '' 's/from '\''\.\.\/AIAssistant'\''/from '\''\.\.\/ai\/AIAssistant'\''/' src/__tests__/promptRunner.test.ts
sed -i '' 's/from '\''\.\.\/\.\.\/AIAssistant'\''/from '\''\.\.\/\.\.\/ai\/AIAssistant'\''/' src/__tests__/integration/aiAssistant.test.ts
sed -i '' 's/from '\''\.\.\/\.\.\/AIAssistant'\''/from '\''\.\.\/\.\.\/ai\/AIAssistant'\''/' src/__tests__/e2e/pandoWorkflow.test.ts
sed -i '' 's/from '\''\.\/AIAssistant'\''/from '\''\.\/ai\/AIAssistant'\''/' src/debugAdapter.ts

# Update import for logger in src/ai/config/Process.ts
sed -i '' 's/from "\.\.\/AIAssistant"/from "\.\.\/logger"/' src/ai/config/Process.ts

# Update export in src/ai/index.ts
sed -i '' 's/from '\''\.\/ai\/AIAssistant'\''/from '\''\.\/AIAssistant'\''/' src/ai/index.ts

echo "Import statements updated successfully."
