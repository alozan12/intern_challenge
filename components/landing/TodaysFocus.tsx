'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  text: string
  completed: boolean
}

export function TodaysFocus() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Review lecture notes for CSE 110', completed: false },
    { id: '2', text: 'Complete practice problems for MAT 265', completed: true },
    { id: '3', text: 'Start research for ENG 101 essay', completed: false },
  ])
  const [newTask, setNewTask] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks, 
        { 
          id: Date.now().toString(), 
          text: newTask.trim(), 
          completed: false 
        }
      ])
      setNewTask('')
      setIsAdding(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Focus</h2>
      
      <div className="space-y-3 mb-4">
        {tasks.map(task => (
          <div key={task.id} className="flex items-start gap-3 group">
            <button 
              onClick={() => handleToggleComplete(task.id)}
              className="mt-0.5 flex-shrink-0"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </button>
            
            <span 
              className={cn(
                "flex-1 text-sm",
                task.completed ? "text-gray-500 line-through" : "text-gray-900"
              )}
            >
              {task.text}
            </span>
            
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      {isAdding ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a task..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-asu-maroon/50 focus:border-asu-maroon"
              autoFocus
            />
          </div>
          <button
            onClick={handleAddTask}
            className="px-3 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-sm text-asu-maroon hover:text-asu-maroon/80"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      )}
    </div>
  )
}