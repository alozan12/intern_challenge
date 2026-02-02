'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Save, User, Book, Bell, MessageSquare, ExternalLink, CheckCircle, AlertCircle, Lock, School } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@asu.edu',
  studentId: '1234567890',
  program: 'Computer Science',
  academicYear: 'Junior',
  profileImage: null
}

// Canvas connection status
const canvasConnected = true

// Course enrollment mock data
const mockCourses = [
  { id: '1', name: 'Introduction to Computer Science', code: 'CSE 110', isActive: true },
  { id: '2', name: 'Calculus I', code: 'MAT 265', isActive: true },
  { id: '3', name: 'English Composition', code: 'ENG 101', isActive: true },
  { id: '4', name: 'General Chemistry', code: 'CHM 113', isActive: true },
  { id: '5', name: 'Introduction to Psychology', code: 'PSY 101', isActive: true },
  { id: '6', name: 'Principles of Biology', code: 'BIO 181', isActive: false },
  { id: '7', name: 'Physics I', code: 'PHY 121', isActive: false },
]

// Notification settings mock data
const defaultNotifications = {
  deadlineReminders: true,
  studyReminders: true,
  feedbackNotifications: true,
  emailNotifications: true,
  pushNotifications: false,
  notifyDays: 2
}

interface SettingsSectionProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}

function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-white">
      <div className="flex items-start mb-4">
        <div className="p-2 bg-asu-light-gray rounded-md mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}

interface ToggleProps {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  label?: string
}

function Toggle({ enabled, setEnabled, label }: ToggleProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={enabled} 
          onChange={() => setEnabled(!enabled)}
        />
        <div className={cn(
          "block w-10 h-6 rounded-full transition-colors",
          enabled ? "bg-asu-maroon" : "bg-gray-300"
        )}></div>
        <div className={cn(
          "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
          enabled ? "transform translate-x-4" : ""
        )}></div>
      </div>
      {label && <span className="ml-3 text-sm text-gray-700">{label}</span>}
    </label>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [user, setUser] = useState(mockUser)
  const [courses, setCourses] = useState(mockCourses)
  const [notificationSettings, setNotificationSettings] = useState(defaultNotifications)
  const [isSaving, setIsSaving] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  
  // Mock save function
  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }
  
  // Toggle course active state
  const toggleCourse = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId ? { ...course, isActive: !course.isActive } : course
    ))
  }
  
  // Toggle notification setting
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    })
  }
  
  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-md">
          <TabsTrigger value="account" className="data-[state=active]:bg-white rounded-md px-4 py-2 data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-white rounded-md px-4 py-2 data-[state=active]:shadow-sm">
            <Book className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white rounded-md px-4 py-2 data-[state=active]:shadow-sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-white rounded-md px-4 py-2 data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback & Support
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="mt-0">
          <SettingsSection
            title="Canvas Integration"
            description="Connect your Canvas account to sync course materials, assignments, and deadlines."
            icon={<ExternalLink className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {canvasConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-gray-900 font-medium">Connected to Canvas</p>
                      <p className="text-sm text-gray-600">Last synced: Today at 10:45 AM</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    <p className="text-gray-900 font-medium">Not connected</p>
                  </>
                )}
              </div>
              <button className={cn(
                "px-4 py-2 rounded text-sm font-medium",
                canvasConnected ? 
                  "text-gray-700 bg-gray-100 hover:bg-gray-200" : 
                  "text-white bg-asu-maroon hover:bg-asu-maroon/90"
              )}>
                {canvasConnected ? "Disconnect" : "Connect to Canvas"}
              </button>
            </div>
            {canvasConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-asu-maroon hover:underline mr-4">
                  Sync Now
                </button>
                <button className="text-sm text-asu-maroon hover:underline">
                  Change Permissions
                </button>
              </div>
            )}
          </SettingsSection>
          
          <SettingsSection
            title="User Profile"
            description="Manage your personal information and account settings."
            icon={<User className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-asu-maroon"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  value={user.email}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email is managed by your institution</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  value={user.studentId}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  value={user.program}
                  disabled
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Change Password
              </button>
              <button 
                className="px-4 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90 flex items-center"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </SettingsSection>
          
          <SettingsSection
            title="Security & Privacy"
            description="Manage your security preferences and data privacy settings."
            icon={<Lock className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <button className="px-3 py-1 text-sm bg-asu-maroon text-white rounded hover:bg-asu-maroon/90">
                  Setup
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-700">Data Usage</p>
                    <p className="text-sm text-gray-600">Control how your study data is used</p>
                  </div>
                  <Toggle 
                    enabled={true} 
                    setEnabled={() => {}} 
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Your study data is used to improve our AI study recommendations. You can opt out any time, but this may impact the quality of your personalized study materials.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="text-sm text-red-600 hover:text-red-800 hover:underline">
                  Download My Data
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Request a download of all your data stored in Study Coach
                </p>
              </div>
            </div>
          </SettingsSection>
        </TabsContent>
        
        {/* Courses Settings */}
        <TabsContent value="courses" className="mt-0">
          <SettingsSection
            title="Course Management"
            description="Manage which courses appear in your Study Coach dashboard."
            icon={<School className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="space-y-2 mt-4">
              {courses.map(course => (
                <div 
                  key={course.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-800">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <Toggle 
                    enabled={course.isActive} 
                    setEnabled={() => toggleCourse(course.id)}
                    label={course.isActive ? "Active" : "Inactive"}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90 flex items-center"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </SettingsSection>
          
          <SettingsSection
            title="Canvas Sync Settings"
            description="Control which course materials are imported from Canvas."
            icon={<ExternalLink className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Assignments</p>
                  <p className="text-sm text-gray-600">Import assignment details and deadlines</p>
                </div>
                <Toggle enabled={true} setEnabled={() => {}} />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Quizzes</p>
                  <p className="text-sm text-gray-600">Import quiz details and deadlines</p>
                </div>
                <Toggle enabled={true} setEnabled={() => {}} />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Lecture Materials</p>
                  <p className="text-sm text-gray-600">Import lecture slides and notes</p>
                </div>
                <Toggle enabled={true} setEnabled={() => {}} />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Discussions</p>
                  <p className="text-sm text-gray-600">Import discussion topics and deadlines</p>
                </div>
                <Toggle enabled={true} setEnabled={() => {}} />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Announcements</p>
                  <p className="text-sm text-gray-600">Import course announcements</p>
                </div>
                <Toggle enabled={true} setEnabled={() => {}} />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Grades</p>
                  <p className="text-sm text-gray-600">Import your grades for performance analysis</p>
                </div>
                <Toggle enabled={true} setEnabled={() => {}} />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button className="text-sm text-asu-maroon hover:underline">
                Sync All Courses Now
              </button>
              <button 
                className="px-4 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90"
                onClick={handleSave}
              >
                Save Preferences
              </button>
            </div>
          </SettingsSection>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-0">
          <SettingsSection
            title="Notification Preferences"
            description="Control when and how you receive notifications from Study Coach."
            icon={<Bell className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Deadline Reminders</p>
                  <p className="text-sm text-gray-600">Get notified about upcoming deadlines</p>
                </div>
                <Toggle 
                  enabled={notificationSettings.deadlineReminders} 
                  setEnabled={() => toggleNotification('deadlineReminders')} 
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Study Reminders</p>
                  <p className="text-sm text-gray-600">Get reminded about scheduled study sessions</p>
                </div>
                <Toggle 
                  enabled={notificationSettings.studyReminders} 
                  setEnabled={() => toggleNotification('studyReminders')} 
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium text-gray-800">Feedback Notifications</p>
                  <p className="text-sm text-gray-600">Get notified about new feedback on your work</p>
                </div>
                <Toggle 
                  enabled={notificationSettings.feedbackNotifications} 
                  setEnabled={() => toggleNotification('feedbackNotifications')} 
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="font-medium text-gray-800 mb-3">Notification Methods</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Toggle 
                      enabled={notificationSettings.emailNotifications} 
                      setEnabled={() => toggleNotification('emailNotifications')}
                      label="Email Notifications"
                    />
                  </div>
                  <div className="flex items-center">
                    <Toggle 
                      enabled={notificationSettings.pushNotifications} 
                      setEnabled={() => toggleNotification('pushNotifications')}
                      label="Push Notifications"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="font-medium text-gray-800 mb-3">Reminder Timing</p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Remind me</label>
                  <select 
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={notificationSettings.notifyDays}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      notifyDays: parseInt(e.target.value)
                    })}
                  >
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">1 week</option>
                  </select>
                  <label className="text-sm text-gray-700">before deadlines</label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90"
                onClick={handleSave}
              >
                Save Preferences
              </button>
            </div>
          </SettingsSection>
        </TabsContent>
        
        {/* Feedback & Support */}
        <TabsContent value="feedback" className="mt-0">
          <SettingsSection
            title="Feedback & Support"
            description="Provide feedback and get help using Study Coach."
            icon={<MessageSquare className="w-5 h-5 text-asu-maroon" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Send Feedback</p>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-asu-maroon h-32"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="px-4 py-2 bg-asu-maroon text-white rounded-md text-sm font-medium hover:bg-asu-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={feedbackText.length < 10}
                  onClick={() => {
                    alert('Feedback submitted! Thank you for helping us improve Study Coach.')
                    setFeedbackText('')
                  }}
                >
                  Submit Feedback
                </button>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <p className="font-medium text-gray-800 mb-3">Support Resources</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href="#" 
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-md mr-3">
                      <Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">User Guide</p>
                      <p className="text-sm text-gray-600">Learn how to use Study Coach</p>
                    </div>
                  </a>
                  
                  <a 
                    href="#" 
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-md mr-3">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Live Chat Support</p>
                      <p className="text-sm text-gray-600">Chat with our support team</p>
                    </div>
                  </a>
                  
                  <a 
                    href="#" 
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 rounded-md mr-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">FAQs</p>
                      <p className="text-sm text-gray-600">Browse frequently asked questions</p>
                    </div>
                  </a>
                  
                  <a 
                    href="#" 
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-md mr-3">
                      <School className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">ASU Technical Support</p>
                      <p className="text-sm text-gray-600">Get help with ASU systems</p>
                    </div>
                  </a>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <p className="font-medium text-gray-800 mb-3">Contact Information</p>
                <p className="text-sm text-gray-600">For urgent assistance, contact the Study Coach support team:</p>
                <p className="text-sm text-gray-600 mt-2">
                  Email: <a href="mailto:studycoach@asu.edu" className="text-asu-maroon hover:underline">studycoach@asu.edu</a>
                </p>
                <p className="text-sm text-gray-600">
                  Phone: (480) 123-4567
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Support hours: Monday–Friday, 8:00 AM – 5:00 PM MST
                </p>
              </div>
            </div>
          </SettingsSection>
        </TabsContent>
      </Tabs>
    </div>
  )
}