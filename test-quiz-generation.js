// Test script for quiz generation API
const fetch = require('node-fetch');

async function testQuizGeneration() {
  try {
    console.log('Testing quiz generation API...\n');
    
    const response = await fetch('http://localhost:3000/api/study/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'Binary Search Trees',
        courseId: '112233',
        courseName: 'Data Structures',
        courseCode: 'CSE 110',
        questionCount: 10,
        difficulty: 'intermediate',
        generationType: 'learning_gaps',
        studentId: '987654'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error response:', response.status, data);
      return;
    }
    
    console.log('Quiz generated successfully!');
    console.log('Quiz ID:', data.quiz?.id);
    console.log('Quiz Title:', data.quiz?.title);
    console.log('Number of questions:', data.quiz?.content?.questions?.length || 0);
    
    if (data.quiz?.content?.questions?.length > 0) {
      console.log('\nFirst question:');
      const firstQuestion = data.quiz.content.questions[0];
      console.log('Q:', firstQuestion.question);
      console.log('Options:');
      firstQuestion.options.forEach((opt, idx) => {
        console.log(`  ${String.fromCharCode(65 + idx)}) ${opt}`);
      });
      console.log('Correct Answer:', String.fromCharCode(65 + firstQuestion.correctAnswer));
      console.log('Explanation:', firstQuestion.explanation);
    }
    
  } catch (error) {
    console.error('Error testing quiz API:', error);
  }
}

// Run the test
testQuizGeneration();