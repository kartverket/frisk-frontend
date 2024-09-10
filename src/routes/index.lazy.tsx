import { createLazyFileRoute } from '@tanstack/react-router'
import { FunctionColumnView } from '../components/function-column-view'
import { useState } from 'react';
import { FunctionInfoView } from '../components/function-info-view';

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const [selectedFunctionIds, setSelectedFunctionIds] = useState<number[]>([1]);
  const leafFunctionId = selectedFunctionIds.at(-1) ?? 1;

  return (
    <div className="flex flex-col gap-2">
      <FunctionInfoView functionId={leafFunctionId} />
      <FunctionColumnView selectedFunctionIds={selectedFunctionIds} setSelectedFunctionIds={setSelectedFunctionIds} />
    </div>
  )
}
