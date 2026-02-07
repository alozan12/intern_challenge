'use client'

import { useState } from 'react'
import { Download, X, Maximize2, Minimize2, FileText, Clock, Target, BookOpen } from 'lucide-react'
import { StudyMaterial } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface StudyOutlineProps {
  outline: StudyMaterial
  onClose?: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

interface OutlineSection {
  id: string
  title: string
  subsections: OutlineSubsection[]
  estimatedTime: number
  priority: 'high' | 'medium' | 'low'
}

interface OutlineSubsection {
  id: string
  title: string
  items: string[]
  tips?: string[]
}

// Mock study outline data - this would normally come from an LLM API
const mockOutlineData = {
  title: 'Introduction to Psychology - Study Plan',
  course: 'PSY 101',
  totalEstimatedTime: 240, // minutes
  createdDate: new Date(),
  objectives: [
    'Master key psychological theories and concepts',
    'Understand major research methods in psychology',
    'Apply psychological principles to real-world scenarios',
    'Prepare for upcoming midterm examination'
  ],
  sections: [
    {
      id: '1',
      title: '1. Foundations of Psychology',
      priority: 'high' as const,
      estimatedTime: 45,
      subsections: [
        {
          id: '1.1',
          title: 'History and Key Figures',
          items: [
            'Wilhelm Wundt and the first psychology lab (1879)',
            'William James and functionalism',
            'Sigmund Freud and psychoanalysis',
            'John B. Watson and behaviorism',
            'Timeline of major psychological movements'
          ],
          tips: [
            'Create a timeline to visualize the progression of psychology',
            'Focus on how each approach influenced modern psychology'
          ]
        },
        {
          id: '1.2',
          title: 'Major Psychological Perspectives',
          items: [
            'Biological perspective: brain structure and neurotransmitters',
            'Cognitive perspective: mental processes and information processing',
            'Behavioral perspective: learning and conditioning',
            'Humanistic perspective: self-actualization and personal growth',
            'Psychodynamic perspective: unconscious drives and conflicts'
          ],
          tips: [
            'Compare and contrast each perspective\'s approach to explaining behavior',
            'Use real-world examples to illustrate each perspective'
          ]
        }
      ]
    },
    {
      id: '2',
      title: '2. Research Methods and Statistics',
      priority: 'high' as const,
      estimatedTime: 60,
      subsections: [
        {
          id: '2.1',
          title: 'Research Design Types',
          items: [
            'Experimental design: independent and dependent variables',
            'Correlational studies: relationship between variables',
            'Case studies: in-depth analysis of individuals',
            'Observational studies: naturalistic and laboratory observation',
            'Cross-sectional vs. longitudinal studies'
          ],
          tips: [
            'Practice identifying research designs in published studies',
            'Understand when each method is most appropriate'
          ]
        },
        {
          id: '2.2',
          title: 'Statistical Concepts',
          items: [
            'Descriptive statistics: mean, median, mode, standard deviation',
            'Normal distribution and bell curve properties',
            'Correlation coefficients and their interpretation',
            'Statistical significance and p-values',
            'Common statistical tests: t-tests, ANOVA, chi-square'
          ],
          tips: [
            'Work through practice problems for each statistical concept',
            'Focus on interpreting results rather than just calculating'
          ]
        }
      ]
    },
    {
      id: '3',
      title: '3. Biological Bases of Behavior',
      priority: 'medium' as const,
      estimatedTime: 50,
      subsections: [
        {
          id: '3.1',
          title: 'Nervous System Structure',
          items: [
            'Central nervous system: brain and spinal cord',
            'Peripheral nervous system: somatic and autonomic divisions',
            'Neuron structure: dendrites, cell body, axon, synapses',
            'Types of neurons: sensory, motor, interneurons',
            'Glial cells and their supportive functions'
          ],
          tips: [
            'Draw and label neuron diagrams from memory',
            'Use mnemonics to remember brain region functions'
          ]
        },
        {
          id: '3.2',
          title: 'Brain Regions and Functions',
          items: [
            'Hindbrain: medulla, pons, cerebellum',
            'Midbrain: reticular formation, substantia nigra',
            'Forebrain: thalamus, hypothalamus, limbic system, cerebral cortex',
            'Cerebral cortex lobes: frontal, parietal, temporal, occipital',
            'Specialized areas: Broca\'s area, Wernicke\'s area, motor cortex'
          ]
        }
      ]
    },
    {
      id: '4',
      title: '4. Learning and Memory',
      priority: 'high' as const,
      estimatedTime: 55,
      subsections: [
        {
          id: '4.1',
          title: 'Classical Conditioning',
          items: [
            'Pavlov\'s experiments with dogs',
            'Key terms: UCS, UCR, CS, CR, extinction, spontaneous recovery',
            'Higher-order conditioning and stimulus generalization',
            'Applications: phobias, advertising, therapy',
            'Biological constraints on learning'
          ],
          tips: [
            'Practice identifying components in conditioning examples',
            'Think of personal examples of classical conditioning'
          ]
        },
        {
          id: '4.2',
          title: 'Memory Systems',
          items: [
            'Sensory memory: iconic and echoic memory',
            'Short-term memory: capacity and duration limitations',
            'Long-term memory: semantic, episodic, procedural',
            'Memory processes: encoding, storage, retrieval',
            'Forgetting: interference theory, decay theory, motivated forgetting'
          ],
          tips: [
            'Use the method of loci to practice memory techniques',
            'Apply encoding strategies while studying this material'
          ]
        }
      ]
    },
    {
      id: '5',
      title: '5. Review and Practice',
      priority: 'medium' as const,
      estimatedTime: 30,
      subsections: [
        {
          id: '5.1',
          title: 'Integration and Application',
          items: [
            'Connect concepts across different psychology areas',
            'Practice applying theories to case study scenarios',
            'Review key terms and definitions',
            'Complete practice quizzes and self-assessments',
            'Identify areas needing additional study'
          ],
          tips: [
            'Teach concepts to someone else to test understanding',
            'Create concept maps to show relationships between topics',
            'Focus extra time on areas where you scored lowest'
          ]
        }
      ]
    }
  ]
}

export function StudyOutline({ outline, onClose, isFullscreen = false, onToggleFullscreen }: StudyOutlineProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadDocx = async () => {
    setIsDownloading(true)
    
    try {
      // Dynamic import to avoid SSR issues
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } = await import('docx')
      const { saveAs } = await import('file-saver')

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: mockOutlineData.title,
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Course and Date
            new Paragraph({
              children: [
                new TextRun({
                  text: `Course: ${mockOutlineData.course} | Created: ${format(mockOutlineData.createdDate, 'MMMM d, yyyy')}`,
                  italics: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),

            // Learning Objectives
            new Paragraph({
              children: [
                new TextRun({
                  text: "Learning Objectives",
                  bold: true,
                  size: 24,
                  underline: { type: UnderlineType.SINGLE },
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            // Objectives list
            ...mockOutlineData.objectives.map(objective => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${objective}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
                indent: { left: 300 },
              })
            ),

            // Estimated Study Time
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total Estimated Study Time: ${Math.floor(mockOutlineData.totalEstimatedTime / 60)}h ${mockOutlineData.totalEstimatedTime % 60}m`,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 400, after: 600 },
            }),

            // Study Plan Sections
            new Paragraph({
              children: [
                new TextRun({
                  text: "Study Plan",
                  bold: true,
                  size: 26,
                  underline: { type: UnderlineType.SINGLE },
                }),
              ],
              spacing: { before: 400, after: 300 },
            }),

            // Generate sections
            ...mockOutlineData.sections.flatMap(section => [
              // Section title
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.title,
                    bold: true,
                    size: 22,
                  }),
                  new TextRun({
                    text: ` (${section.estimatedTime} minutes)`,
                    italics: true,
                    size: 18,
                  }),
                ],
                spacing: { before: 300, after: 200 },
              }),

              // Subsections
              ...section.subsections.flatMap(subsection => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: subsection.title,
                      bold: true,
                      size: 20,
                    }),
                  ],
                  spacing: { before: 200, after: 100 },
                  indent: { left: 300 },
                }),

                // Items
                ...subsection.items.map(item =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `○ ${item}`,
                        size: 18,
                      }),
                    ],
                    spacing: { after: 80 },
                    indent: { left: 600 },
                  })
                ),

                // Tips (if any)
                ...(subsection.tips ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Study Tips:",
                        bold: true,
                        italics: true,
                        size: 18,
                      }),
                    ],
                    spacing: { before: 150, after: 80 },
                    indent: { left: 600 },
                  }),
                  ...subsection.tips.map(tip =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `▪ ${tip}`,
                          size: 16,
                          italics: true,
                        }),
                      ],
                      spacing: { after: 60 },
                      indent: { left: 800 },
                    })
                  )
                ] : [])
              ])
            ]),

            // Footer note
            new Paragraph({
              children: [
                new TextRun({
                  text: "Generated by ASU Study Coach - Personalized AI Study Assistant",
                  size: 16,
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 800 },
            }),
          ],
        }],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${mockOutlineData.course}_Study_Outline_${format(new Date(), 'yyyy-MM-dd')}.docx`)
    } catch (error) {
      console.error('Error generating DOCX:', error)
      alert('Error generating document. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={cn(
      "flex flex-col bg-white",
      isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-full"
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{mockOutlineData.title}</h2>
            <p className="text-sm text-gray-600">{mockOutlineData.course} • {format(mockOutlineData.createdDate, 'MMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDownloading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              )}
              title={isDownloading ? "Generating document..." : "Download as DOCX"}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Overview Section */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-900">Learning Objectives</h3>
              </div>
              <ul className="space-y-2">
                {mockOutlineData.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-800">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Study Time Overview */}
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">
                  Total Estimated Study Time: {Math.floor(mockOutlineData.totalEstimatedTime / 60)}h {mockOutlineData.totalEstimatedTime % 60}m
                </span>
              </div>
            </div>
          </div>

          {/* Study Plan Sections */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-asu-maroon" />
              <h3 className="text-2xl font-bold text-gray-900">Study Plan</h3>
            </div>

            {mockOutlineData.sections.map((section, sectionIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Section Header */}
                <div className={cn(
                  "px-6 py-4 border-b border-gray-200",
                  section.priority === 'high' ? "bg-red-50" :
                  section.priority === 'medium' ? "bg-yellow-50" :
                  "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold text-gray-900">{section.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        section.priority === 'high' ? "bg-red-100 text-red-800" :
                        section.priority === 'medium' ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {section.priority.toUpperCase()} PRIORITY
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{section.estimatedTime} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {section.subsections.map((subsection, subsectionIndex) => (
                      <div key={subsection.id}>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">{subsection.title}</h5>
                        
                        {/* Items */}
                        <ul className="space-y-2 mb-4">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-gray-700">
                              <span className="text-asu-maroon mt-1.5 text-xs">○</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Tips */}
                        {subsection.tips && subsection.tips.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h6 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              💡 Study Tips
                            </h6>
                            <ul className="space-y-1">
                              {subsection.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2 text-gray-600 text-sm">
                                  <span className="text-gray-400 mt-1">▪</span>
                                  <span className="italic">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Generated by ASU Study Coach</span>
              </div>
              <p className="text-xs text-gray-400">
                Personalized AI Study Assistant • {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}