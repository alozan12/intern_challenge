'use client'

interface EmptyProps {
  message: string
}

export function Empty({ message }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20 12H4" 
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Nothing here</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}