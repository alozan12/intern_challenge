'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, BookOpen, PenLine } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ChatMessage, KnowledgeBaseItem, StudyMaterial } from '@/types'

// Mock data for a specific deadline (for demo)
const mockCourse = {
  id: '1',
  name: 'Introduction to Computer Science',
  code: 'CSE 110',
  color: '#8C1D40'
}

const mockDeadline = {
  id: '1',
  title: 'Project 3: Binary Search Trees',
  type: 'assignment',
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  courseId: '1'
}

// Mock knowledge base items
const mockKnowledgeItems: KnowledgeBaseItem[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Lecture: Introduction to Binary Search Trees',
    type: 'lecture',
    content: 'Binary search trees (BST) are data structures that store "items" (such as numbers, names, etc.) in memory...',
    lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isSelected: true
  },
  {
    id: '2',
    courseId: '1',
    title: 'Reading: Chapter 7 - Tree Structures',
    type: 'reading',
    content: 'Tree structures are hierarchical data structures that simulate a hierarchical tree structure...',
    lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isSelected: false
  },
  {
    id: '3',
    courseId: '1',
    title: 'Assignment: Binary Tree Implementation',
    type: 'assignment',
    content: 'In this assignment, you will implement a binary search tree with the following operations...',
    lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isSelected: false
  }
]

// Mock chat history
const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Can you explain what a binary search tree is?',
    timestamp: new Date(Date.now() - 20 * 60 * 1000)
  },
  {
    id: '2',
    role: 'assistant',
    content: 'A Binary Search Tree (BST) is a type of binary tree where nodes are organized in a specific order. For each node:\n\n- All nodes in the left subtree have values less than the node\'s value\n- All nodes in the right subtree have values greater than the node\'s value\n\nThis organization makes searching, insertion, and deletion operations efficient, typically O(log n) in balanced trees.\n\nWould you like me to explain how these operations work?',
    timestamp: new Date(Date.now() - 19 * 60 * 1000)
  },
  {
    id: '3',
    role: 'user',
    content: 'Yes, please explain insertion and deletion',
    timestamp: new Date(Date.now() - 18 * 60 * 1000)
  },
  {
    id: '4',
    role: 'assistant',
    content: 'Sure, let me explain insertion and deletion in a Binary Search Tree:\n\n**Insertion:**\n1. Start at the root\n2. Compare the value to insert with the current node\n3. If smaller, go to the left child\n4. If larger, go to the right child\n5. Repeat until you reach a null position\n6. Insert the new node at that position\n\n**Deletion:**\nThere are three cases:\n1. **Node with no children:** Simply remove it\n2. **Node with one child:** Replace it with its child\n3. **Node with two children:**\n   - Find the inorder successor (smallest in right subtree)\n   - Replace the node\'s value with the successor\'s value\n   - Delete the successor\n\nWould you like to see an example?',
    timestamp: new Date(Date.now() - 17 * 60 * 1000)
  }
]

// Mock study materials
const mockStudyMaterials: StudyMaterial[] = [
  {
    id: '1',
    type: 'flashcards',
    title: 'BST Key Concepts',
    content: {
      cards: [
        { id: '1', front: 'What is a Binary Search Tree?', back: 'A binary tree where for each node, all left subtree nodes are less than the node\'s value and all right subtree nodes are greater.' },
        { id: '2', front: 'What is the time complexity for search in a balanced BST?', back: 'O(log n)' }
      ]
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'summary',
    title: 'BST Implementation Summary',
    content: {
      text: 'Binary Search Trees provide efficient data organization with O(log n) operations when balanced. Key operations include insert, delete, and search.',
      keyPoints: [
        'Node structure: value, left child, right child',
        'Left subtree values < node value',
        'Right subtree values > node value',
        'Self-balancing variants: AVL Trees, Red-Black Trees'
      ]
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
]

interface TabButtonProps {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}

function TabButton({ children, active, onClick }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 font-medium text-sm rounded-md ${
        active
          ? 'bg-asu-maroon text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function PreparationDetailPage() {
  const params = useParams()
  // In a real app, would use these params to fetch data
  // const courseId = params.courseId as string
  // const deadlineId = params.deadlineId as string
  
  const [activeTab, setActiveTab] = useState<'history' | 'knowledge'>('knowledge')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBaseItem[]>(mockKnowledgeItems)
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(mockStudyMaterials)
  
  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    // Add user message
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }
    
    setChatMessages([...chatMessages, newUserMessage])
    setChatInput('')
    
    // Simulate AI response after delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'I\'m the Study Coach AI assistant. This is a placeholder response. In the real app, I would provide a helpful answer to your question about this specific assignment.',
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, aiResponse])
    }, 1000)
  }
  
  const toggleKnowledgeItem = (itemId: string) => {
    setKnowledgeItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, isSelected: !item.isSelected } 
          : item
      )
    )
  }
  
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-6">
        <Link
          href="/preparation"
          className="inline-flex items-center text-sm text-asu-maroon hover:underline mb-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Preparation Center
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{mockDeadline.title}</h1>
            <p className="text-sm text-gray-600">
              {mockCourse.code} - {mockCourse.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              <span suppressHydrationWarning>Due {format(mockDeadline.dueDate, 'MMM d, yyyy')} at {format(mockDeadline.dueDate, 'h:mm a')}</span>
            </div>
            <div className="mt-1">
              <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium",
                mockDeadline.type === 'assignment' && "bg-blue-100 text-blue-800",
                mockDeadline.type === 'quiz' && "bg-green-100 text-green-800",
                mockDeadline.type === 'exam' && "bg-red-100 text-red-800",
                mockDeadline.type === 'discussion' && "bg-purple-100 text-purple-800"
              )}>
                {mockDeadline.type.charAt(0).toUpperCase() + mockDeadline.type.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-1/4 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <TabButton 
                active={activeTab === 'history'} 
                onClick={() => setActiveTab('history')}
              >
                Session History
              </TabButton>
              <TabButton 
                active={activeTab === 'knowledge'} 
                onClick={() => setActiveTab('knowledge')}
              >
                Knowledge Base
              </TabButton>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'history' ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Previous Study Sessions</h3>
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">BST Practice Problems</p>
                      <p className="text-xs text-gray-500">Yesterday, 3:25 PM</p>
                    </div>
                    <button className="text-xs text-asu-maroon hover:underline">Open</button>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Tree Traversal Methods</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                    <button className="text-xs text-asu-maroon hover:underline">Open</button>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-6">
                  End of history
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Course Materials</h3>
                  <button className="text-xs text-asu-maroon hover:underline">
                    Toggle All
                  </button>
                </div>
                
                {knowledgeItems.map(item => (
                  <div 
                    key={item.id} 
                    className={cn("bg-white border rounded-md p-3",
                      item.isSelected ? 'border-asu-maroon' : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === 'lecture' && <BookOpen className="w-4 h-4 text-asu-maroon" />}
                        {item.type === 'reading' && <BookOpen className="w-4 h-4 text-blue-600" />}
                        {item.type === 'assignment' && <PenLine className="w-4 h-4 text-green-600" />}
                        <p className={cn("font-medium",
                          item.isSelected ? 'text-gray-900' : 'text-gray-700'
                        )}>
                          {item.title}
                        </p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={() => toggleKnowledgeItem(item.id)}
                        className="h-4 w-4 text-asu-maroon rounded border-gray-300 focus:ring-asu-maroon"
                      />
                    </div>
                    {item.lastAccessed && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        <span suppressHydrationWarning>Viewed {format(item.lastAccessed, 'MMM d')}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Middle panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {chatMessages.map(message => (
              <div 
                key={message.id}
                className={cn("mb-4 max-w-[85%]",
                  message.role === 'user' ? 'ml-auto' : 'mr-auto'
                )}
              >
                <div className={cn("rounded-lg p-3",
                  message.role === 'user' 
                    ? 'bg-asu-maroon text-white' 
                    : 'bg-white border border-gray-200'
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className={cn("text-xs mt-1 text-gray-500",
                  message.role === 'user' && "text-right"
                )}>
                  <span suppressHydrationWarning>{format(message.timestamp, 'h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about this assignment..."
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-asu-maroon"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-asu-maroon text-white rounded-md hover:bg-asu-maroon/90 flex-shrink-0"
              >
                Send
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 px-2">
              Ask specific questions about the deadline to get targeted help
            </div>
          </div>
        </div>
        
        {/* Right panel */}
        <div className="w-1/4 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Your Study Materials</h3>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <Plus className="w-4 h-4 text-asu-maroon" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {studyMaterials.map(material => (
                <div key={material.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{material.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span suppressHydrationWarning>Created {format(material.createdAt, 'MMM d, yyyy')}</span>
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                      {material.type === 'flashcards' 
                        ? 'Flashcards' 
                        : material.type === 'summary' 
                        ? 'Summary' 
                        : material.type}
                    </span>
                  </div>
                  
                  <div className="p-3">
                    {material.type === 'flashcards' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          {(material.content as any).cards.length} cards in set
                        </p>
                        <button className="w-full py-1 text-sm text-asu-maroon border border-asu-maroon rounded-md hover:bg-asu-maroon/10">
                          Practice Now
                        </button>
                      </div>
                    )}
                    
                    {material.type === 'summary' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          {(material.content as any).text.substring(0, 80)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {(material.content as any).keyPoints.length} key points
                        </p>
                        <button className="w-full py-1 mt-2 text-sm text-asu-maroon border border-asu-maroon rounded-md hover:bg-asu-maroon/10">
                          View Summary
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-center py-6">
                <button className="px-4 py-2 bg-asu-maroon text-white rounded-md hover:bg-asu-maroon/90 flex items-center mx-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Study Material
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Generate flashcards, quizzes, summaries, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}