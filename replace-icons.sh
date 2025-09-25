#!/bin/bash

# Script para substituir HeroIcons por Material Symbols no AutoFlow
echo "🔄 Iniciando substituição de HeroIcons por Material Symbols..."

# Lista de arquivos para processar
files=(
    "apps/frontend/src/components/integrations/IntegrationsAlerts.tsx"
    "apps/frontend/src/components/integrations/IntegrationsDashboard.tsx"
    "apps/frontend/src/components/integrations/IntegrationCard.tsx"
    "apps/frontend/src/components/integrations/IntegrationsStats.tsx"
    "apps/frontend/src/components/integrations/IntegrationsOperations.tsx"
    "apps/frontend/src/components/ai/ChatInterface.tsx"
    "apps/frontend/src/components/ai/ConversationHistory.tsx"
    "apps/frontend/src/components/ai/MessageBubble.tsx"
    "apps/frontend/src/components/ai/SuggestionsPanel.tsx"
    "apps/frontend/src/components/workflow/nodes/ConditionNodes.tsx"
    "apps/frontend/src/components/workflow/nodes/BaseNode.tsx"
    "apps/frontend/src/components/workflow/nodes/TriggerNodes.tsx"
    "apps/frontend/src/components/workflow/nodes/ActionNodes.tsx"
    "apps/frontend/src/components/workflow/nodes/UtilityNodes.tsx"
    "apps/frontend/src/components/workflow/NodeLibrary.tsx"
    "apps/frontend/src/components/workflow/CustomNodes.tsx"
    "apps/frontend/src/components/workflow/ExecutionMonitor.tsx"
    "apps/frontend/src/components/workflow/ExecutionPanel.tsx"
    "apps/frontend/src/components/workflow/NodeInspector.tsx"
    "apps/frontend/src/components/workflow/WorkflowToolbar.tsx"
    "apps/frontend/src/components/workflow/WorkflowVersioning.tsx"
    "apps/frontend/src/components/workflow/WorkflowStatus.tsx"
)

for file in "${files[@]}"; do
    echo "📝 Processando: $file"
    
    if [ -f "$file" ]; then
        # Backup do arquivo original
        cp "$file" "$file.backup"
        
        # Substituir imports HeroIcons por MaterialIcon
        sed -i '' 's/import.*from "@heroicons\/react\/24\/outline";/import { MaterialIcon } from "..\/ui\/MaterialIcon";/g' "$file"
        
        # Função para determinar o caminho correto do MaterialIcon baseado na estrutura do arquivo
        if [[ "$file" == *"/nodes/"* ]]; then
            sed -i '' 's/import { MaterialIcon } from "..\/ui\/MaterialIcon";/import { MaterialIcon } from "..\/..\/ui\/MaterialIcon";/g' "$file"
        elif [[ "$file" == *"/workflow/"* ]] || [[ "$file" == *"/ai/"* ]] || [[ "$file" == *"/integrations/"* ]]; then
            sed -i '' 's/import { MaterialIcon } from "..\/ui\/MaterialIcon";/import { MaterialIcon } from "..\/ui\/MaterialIcon";/g' "$file"
        fi
        
        # Substituições de ícones comuns
        sed -i '' 's/<SparklesIcon className="[^"]*"/<MaterialIcon icon="auto_awesome" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<XMarkIcon className="[^"]*"/<MaterialIcon icon="close" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<CheckCircleIcon className="[^"]*"/<MaterialIcon icon="check_circle" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<ExclamationCircleIcon className="[^"]*"/<MaterialIcon icon="error" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<Cog6ToothIcon className="[^"]*"/<MaterialIcon icon="settings" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<QuestionMarkCircleIcon className="[^"]*"/<MaterialIcon icon="help" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<FunnelIcon className="[^"]*"/<MaterialIcon icon="filter_list" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<PlusIcon className="[^"]*"/<MaterialIcon icon="add" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<TrashIcon className="[^"]*"/<MaterialIcon icon="delete" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<PlayIcon className="[^"]*"/<MaterialIcon icon="play_arrow" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<PauseIcon className="[^"]*"/<MaterialIcon icon="pause" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<StopIcon className="[^"]*"/<MaterialIcon icon="stop" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<ArrowRightIcon className="[^"]*"/<MaterialIcon icon="arrow_forward" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<ChevronDownIcon className="[^"]*"/<MaterialIcon icon="expand_more" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<ChevronUpIcon className="[^"]*"/<MaterialIcon icon="expand_less" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<EyeIcon className="[^"]*"/<MaterialIcon icon="visibility" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<DocumentTextIcon className="[^"]*"/<MaterialIcon icon="description" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<ClockIcon className="[^"]*"/<MaterialIcon icon="schedule" className="text-current" size={20}/g' "$file"
        sed -i '' 's/<BoltIcon className="[^"]*"/<MaterialIcon icon="bolt" className="text-current" size={20}/g' "$file"
        
        # Fechar tags adequadamente
        sed -i '' 's/ \/>/\/>/g' "$file"
        
        echo "✅ Concluído: $file"
    else
        echo "❌ Arquivo não encontrado: $file"
    fi
done

echo "🎉 Substituição concluída! Backups criados com extensão .backup"
echo "💡 Execute os testes para verificar se tudo está funcionando corretamente."