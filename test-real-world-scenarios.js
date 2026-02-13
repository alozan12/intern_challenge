// Real-world scenario testing for document filtering
// Run with: node test-real-world-scenarios.js

const fetch = require('node-fetch');

// Tracking results
const results = {
  scenarios: [],
  successByType: {
    homework: { success: 0, total: 0 },
    studySession: { success: 0, total: 0 },
    examPrep: { success: 0, total: 0 },
    conceptClarification: { success: 0, total: 0 }
  }
};

async function testScenario(name, type, userQuery, enhancedQuery, materialIds, sourceNames) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`SCENARIO: ${name}`);
  console.log(`Type: ${type}`);
  console.log(`User asks: "${userQuery}"`);
  console.log(`System sends: "${enhancedQuery}"`);
  console.log(`Selected docs: ${sourceNames.join(', ')}`);
  console.log('='.repeat(70));
  
  results.successByType[type].total++;
  
  const payload = {
    query: enhancedQuery,
    material_ids: materialIds,
    course_ids: ["445567"],
    session_id: `scenario_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    source_names: sourceNames,
    override_params: {
      temperature: 0.3,
      top_k: 5,
      reranker: true
    }
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/createai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      const responseLower = data.response.toLowerCase();
      
      // Check for contamination from other documents
      const knownDocs = ['database_basics', 'er_model', 'sql_basics', 'normalization', 'dimensional_modeling', 'data_warehouse'];
      const expectedDocTerms = sourceNames.map(d => d.toLowerCase().replace('.pptx', '').replace(/-/g, '_'));
      const unexpectedMentions = knownDocs.filter(doc => 
        !expectedDocTerms.some(expected => doc.includes(expected) || expected.includes(doc)) &&
        responseLower.includes(doc)
      );
      
      const success = unexpectedMentions.length === 0;
      
      console.log(`\nResult: ${success ? '✅ SUCCESS' : '❌ CONTAMINATED'}`);
      if (!success) {
        console.log(`Unexpected mentions: ${unexpectedMentions.join(', ')}`);
      }
      
      // Check content relevance
      const relevantTerms = {
        '1-er_model.pptx': ['entity', 'relationship', 'cardinality', 'attribute'],
        '2-sql_basics.pptx': ['select', 'from', 'where', 'join', 'query'],
        '3-data_warehouse.pptx': ['warehouse', 'etl', 'olap', 'dimension'],
        '4-normalization.pptx': ['normal form', '1nf', '2nf', '3nf', 'dependency'],
        '5-dimensional_modeling.pptx': ['star schema', 'fact', 'dimension', 'snowflake']
      };
      
      let relevanceScore = 0;
      sourceNames.forEach(doc => {
        const terms = relevantTerms[doc] || [];
        const foundTerms = terms.filter(term => responseLower.includes(term));
        relevanceScore += foundTerms.length / terms.length;
      });
      relevanceScore = (relevanceScore / sourceNames.length * 100).toFixed(0);
      
      console.log(`Content relevance: ${relevanceScore}%`);
      
      // Show response excerpt
      console.log('\nResponse excerpt:');
      console.log(data.response.substring(0, 350) + '...');
      
      // Record result
      results.scenarios.push({
        name,
        type,
        success,
        relevanceScore,
        contaminated: !success
      });
      
      if (success) {
        results.successByType[type].success++;
      }
      
      return success;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function runRealWorldTests() {
  console.log('Testing Real-World Student Scenarios');
  console.log('====================================\n');
  
  // Homework Help Scenarios
  console.log('\n📚 HOMEWORK HELP SCENARIOS');
  
  await testScenario(
    'Student working on ER diagram homework',
    'homework',
    'How do I draw the relationships between these entities?',
    "Using ONLY the document '1-er_model.pptx', How do I draw the relationships between these entities?",
    ['1005'],
    ['1-er_model.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await testScenario(
    'SQL homework with specific query',
    'homework',
    'I need help with question 3 about JOIN queries',
    "Using ONLY the document '2-sql_basics.pptx', I need help with question 3 about JOIN queries",
    ['1008'],
    ['2-sql_basics.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Study Session Scenarios
  console.log('\n\n📖 STUDY SESSION SCENARIOS');
  
  await testScenario(
    'Reviewing for quiz on normalization',
    'studySession',
    'Can you quiz me on the different normal forms?',
    "Using ONLY the document '4-normalization.pptx', Can you quiz me on the different normal forms?",
    ['1007'],
    ['4-normalization.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await testScenario(
    'Group study comparing concepts',
    'studySession',
    'We need to understand the difference between these two topics',
    "Using ONLY these documents: 1-er_model.pptx, 5-dimensional_modeling.pptx, We need to understand the difference between these two topics",
    ['1005', '1006'],
    ['1-er_model.pptx', '5-dimensional_modeling.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Exam Preparation Scenarios
  console.log('\n\n📝 EXAM PREPARATION SCENARIOS');
  
  await testScenario(
    'Final exam comprehensive review',
    'examPrep',
    'What are the key concepts I should know for the exam?',
    "Using ONLY these documents: 1-er_model.pptx, 2-sql_basics.pptx, 4-normalization.pptx, What are the key concepts I should know for the exam?",
    ['1005', '1008', '1007'],
    ['1-er_model.pptx', '2-sql_basics.pptx', '4-normalization.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await testScenario(
    'Midterm focused on data warehousing',
    'examPrep',
    'Summarize the main points about data warehouses',
    "Using ONLY the document '3-data_warehouse.pptx', Summarize the main points about data warehouses",
    ['1009'],
    ['3-data_warehouse.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Concept Clarification Scenarios
  console.log('\n\n💡 CONCEPT CLARIFICATION SCENARIOS');
  
  await testScenario(
    'Confused about star schemas',
    'conceptClarification',
    "I don't understand star schemas",
    "Using ONLY the document '5-dimensional_modeling.pptx', I don't understand star schemas",
    ['1006'],
    ['5-dimensional_modeling.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await testScenario(
    'Need examples of normalization',
    'conceptClarification',
    'Can you show me an example of converting to 3NF?',
    "Using ONLY the document '4-normalization.pptx', Can you show me an example of converting to 3NF?",
    ['1007'],
    ['4-normalization.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await testScenario(
    'Understanding database fundamentals',
    'conceptClarification',
    'What are the basic SQL commands I need to know?',
    "Using ONLY the document '2-sql_basics.pptx', What are the basic SQL commands I need to know?",
    ['1008'],
    ['2-sql_basics.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Display Results
  console.log('\n\n' + '='.repeat(70));
  console.log('REAL-WORLD SCENARIO RESULTS');
  console.log('='.repeat(70));
  
  const totalScenarios = results.scenarios.length;
  const successfulScenarios = results.scenarios.filter(s => s.success).length;
  const overallSuccess = (successfulScenarios / totalScenarios * 100).toFixed(1);
  
  console.log(`\nOverall Success Rate: ${successfulScenarios}/${totalScenarios} (${overallSuccess}%)`);
  
  console.log('\nSuccess by Scenario Type:');
  Object.entries(results.successByType).forEach(([type, stats]) => {
    const rate = stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : 0;
    console.log(`  ${type}: ${stats.success}/${stats.total} (${rate}%)`);
  });
  
  console.log('\nContent Relevance Scores:');
  const avgRelevance = results.scenarios.reduce((sum, s) => sum + parseInt(s.relevanceScore), 0) / totalScenarios;
  console.log(`  Average: ${avgRelevance.toFixed(0)}%`);
  
  const highRelevance = results.scenarios.filter(s => parseInt(s.relevanceScore) >= 75).length;
  console.log(`  High relevance (≥75%): ${highRelevance}/${totalScenarios}`);
  
  console.log('\nContamination Analysis:');
  const contaminated = results.scenarios.filter(s => s.contaminated).length;
  console.log(`  Clean responses: ${totalScenarios - contaminated}/${totalScenarios}`);
  console.log(`  Contaminated responses: ${contaminated}/${totalScenarios}`);
  
  console.log('\n📊 KEY METRICS SUMMARY:');
  console.log(`  ✅ Document Filtering Success: ${overallSuccess}%`);
  console.log(`  📚 Content Relevance: ${avgRelevance.toFixed(0)}%`);
  console.log(`  🎯 Clean Response Rate: ${((totalScenarios - contaminated) / totalScenarios * 100).toFixed(1)}%`);
  
  if (overallSuccess >= 80 && avgRelevance >= 70) {
    console.log('\n✨ VERDICT: The enhanced query strategy is PRODUCTION READY');
  } else if (overallSuccess >= 60) {
    console.log('\n⚠️  VERDICT: The strategy works but may need refinement for edge cases');
  } else {
    console.log('\n❌ VERDICT: The strategy needs significant improvement');
  }
  
  // Specific recommendations
  console.log('\n💡 RECOMMENDATIONS FOR USERS:');
  console.log('1. The system works best with single document selection');
  console.log('2. For multiple documents, limit to 2-3 at most');
  console.log('3. Be specific in your questions to get better results');
  console.log('4. The AI will explicitly mention which document it\'s using');
}

// Run the tests
runRealWorldTests().catch(console.error);