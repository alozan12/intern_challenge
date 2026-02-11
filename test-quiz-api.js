// Test script for the quiz generation API endpoint

async function testQuizAPI() {
  const baseUrl = 'http://localhost:3000/api/study/quiz';
  
  // Test cases
  const testCases = [
    {
      name: 'Basic quiz with general content',
      data: {
        topic: 'Binary Search Trees',
        courseId: '112233',
        difficulty: 'intermediate',
        generationType: 'general_content'
      }
    },
    {
      name: 'Learning gaps focused quiz',
      data: {
        topic: 'Trees and Tree Balancing',
        courseId: '112233',
        difficulty: 'intermediate',
        generationType: 'learning_gaps',
        studentId: '987654'
      }
    },
    {
      name: 'Advanced difficulty quiz',
      data: {
        topic: 'Graph Algorithms',
        courseId: '112233',
        difficulty: 'advanced',
        generationType: 'general_content'
      }
    }
  ];
  
  console.log('Testing Quiz Generation API...\n');
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log('Request:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Success!');
        console.log(`Quiz ID: ${result.quiz.id}`);
        console.log(`Title: ${result.quiz.title}`);
        console.log(`Questions: ${result.quiz.content.questions.length}`);
        
        // Show first question as sample
        if (result.quiz.content.questions.length > 0) {
          const firstQ = result.quiz.content.questions[0];
          console.log('\nSample Question:');
          console.log(`Q: ${firstQ.question}`);
          console.log('Options:');
          firstQ.options.forEach((opt, idx) => {
            console.log(`  ${String.fromCharCode(65 + idx)}) ${opt}`);
          });
          console.log(`Correct Answer: ${String.fromCharCode(65 + firstQ.correctAnswer)}`);
          console.log(`Explanation: ${firstQ.explanation.substring(0, 100)}...`);
        }
      } else {
        console.log('❌ Error:', result.error);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
}

// Run the test
testQuizAPI().catch(console.error);