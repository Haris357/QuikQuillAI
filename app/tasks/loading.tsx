import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-3" />
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    </div>
  );
}
