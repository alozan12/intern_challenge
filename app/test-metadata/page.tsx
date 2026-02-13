'use client'

import { useState } from 'react'

export default function TestMetadataPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('document')
  const [materialId, setMaterialId] = useState('')
  const [courseId, setCourseId] = useState('')
  
  const searchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/createai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          material_ids: materialId ? [materialId] : [],
          course_ids: courseId ? [courseId] : [],
          include_metadata: true,
          limit: 20
        })
      })
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ error: error instanceof Error ? error.message : 'Search failed' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CreateAI Metadata Inspector</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Parameters</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter search query"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Material ID (optional)</label>
              <input
                type="text"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., 1005"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Course ID (optional)</label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., 445567"
              />
            </div>
          </div>
          
          <button
            onClick={searchDocuments}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Documents'}
          </button>
        </div>
      </div>
      
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Search Results</h2>
          
          {results.error ? (
            <div className="text-red-600">Error: {results.error}</div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p><strong>Total Results:</strong> {results.total_results || 0}</p>
                <p><strong>Filters Applied:</strong> {results.filters}</p>
                <p><strong>Unique Source Names:</strong> {results.unique_source_names?.join(', ') || 'None'}</p>
                <p><strong>Unique Filenames:</strong> {results.unique_filenames?.join(', ') || 'None'}</p>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.results?.map((result: any, index: number) => (
                  <div key={index} className="border rounded p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Source Name:</strong> {result.source_name || 'N/A'}</p>
                      <p><strong>Filename:</strong> {result.filename || 'N/A'}</p>
                      <p><strong>Material ID:</strong> {result.material_id || 'N/A'}</p>
                      <p><strong>Course ID:</strong> {result.course_id || 'N/A'}</p>
                      <p><strong>Title:</strong> {result.title || 'N/A'}</p>
                      <p><strong>Page:</strong> {result.page_number || 'N/A'}</p>
                      <p><strong>Score:</strong> {result.score || 'N/A'}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Content Preview:</strong> {result.content?.substring(0, 200)}...
                      </p>
                    </div>
                    {result.all_metadata && Object.keys(result.all_metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600">View All Metadata</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.all_metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}