// Comprehensive test suite with metrics for document filtering strategy
// Run with: node test-comprehensive-metrics.js

const fetch = require('node-fetch');

// Test result tracking
const metrics = {
  totalTests: 0,
  successfulTests: 0,
  partialSuccessTests: 0,
  failedTests: 0,
  byCategory: {
    singleDocument: { total: 0, success: 0, partial: 0, failed: 0 },
    multipleDocuments: { total: 0, success: 0, partial: 0, failed: 0 },
    edgeCases: { total: 0, success: 0, partial: 0, failed: 0 },
    queryTypes: { total: 0, success: 0, partial: 0, failed: 0 }
  },
  documentAccuracy: {
    correctDocumentMentions: 0,
    incorrectDocumentMentions: 0,
    totalMentions: 0
  }
};

// Document mapping
const documents = {
  '1005': '1-er_model.pptx',
  '1006': '5-dimensional_modeling.pptx',
  '1007': '4-normalization.pptx',
  '1008': '2-sql_basics.pptx',
  '1009': '3-data_warehouse.pptx'
};

// Helper to analyze response
function analyzeResponse(response, expectedDocs, unexpectedDocs) {
  const responseLower = response.toLowerCase();
  
  // Check for expected documents
  const expectedFound = expectedDocs.map(doc => {
    const docLower = doc.toLowerCase();
    const found = responseLower.includes(docLower) || 
                  responseLower.includes(docLower.replace('.pptx', '')) ||
                  responseLower.includes(docLower.replace('_', ' '));
    return { doc, found };
  });
  
  // Check for unexpected documents
  const unexpectedFound = unexpectedDocs.map(doc => {
    const docLower = doc.toLowerCase();
    const found = responseLower.includes(docLower) || 
                  responseLower.includes(docLower.replace('.pptx', '')) ||
                  responseLower.includes(docLower.replace('_', ' '));
    return { doc, found };
  });
  
  // Calculate accuracy
  const correctMentions = expectedFound.filter(e => e.found).length;
  const incorrectMentions = unexpectedFound.filter(u => u.found).length;
  
  // Update document accuracy metrics
  metrics.documentAccuracy.correctDocumentMentions += correctMentions;
  metrics.documentAccuracy.incorrectDocumentMentions += incorrectMentions;
  metrics.documentAccuracy.totalMentions += correctMentions + incorrectMentions;
  
  // Determine success level
  let successLevel = 'failed';
  if (correctMentions === expectedDocs.length && incorrectMentions === 0) {
    successLevel = 'success';
  } else if (correctMentions > 0 && incorrectMentions <= 1) {
    successLevel = 'partial';
  }
  
  return {
    successLevel,
    expectedFound,
    unexpectedFound,
    accuracy: {
      expectedAccuracy: (correctMentions / expectedDocs.length) * 100,
      contaminationRate: (incorrectMentions / unexpectedDocs.length) * 100
    }
  };
}

async function runTest(testName, category, query, materialIds, sourceNames) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`Category: ${category}`);
  console.log(`Query: "${query}"`);
  console.log(`Documents: ${sourceNames.join(', ')}`);
  console.log('='.repeat(60));
  
  metrics.totalTests++;
  metrics.byCategory[category].total++;
  
  const payload = {
    query,
    material_ids: materialIds,
    course_ids: ["445567"],
    session_id: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    source_names: sourceNames,
    override_params: {
      temperature: 0.1,
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
      // Determine expected and unexpected documents
      const allDocs = Object.values(documents);
      const expectedDocs = sourceNames;
      const unexpectedDocs = allDocs.filter(doc => !sourceNames.includes(doc));
      
      // Analyze the response
      const analysis = analyzeResponse(data.response, expectedDocs, unexpectedDocs);
      
      // Update metrics
      if (analysis.successLevel === 'success') {
        metrics.successfulTests++;
        metrics.byCategory[category].success++;
      } else if (analysis.successLevel === 'partial') {
        metrics.partialSuccessTests++;
        metrics.byCategory[category].partial++;
      } else {
        metrics.failedTests++;
        metrics.byCategory[category].failed++;
      }
      
      // Display results
      console.log(`\nResult: ${analysis.successLevel.toUpperCase()}`);
      console.log(`Expected Document Accuracy: ${analysis.accuracy.expectedAccuracy.toFixed(1)}%`);
      console.log(`Contamination Rate: ${analysis.accuracy.contaminationRate.toFixed(1)}%`);
      
      console.log('\nExpected documents:');
      analysis.expectedFound.forEach(({ doc, found }) => {
        console.log(`  ${found ? '✅' : '❌'} ${doc}`);
      });
      
      if (analysis.unexpectedFound.some(u => u.found)) {
        console.log('\nUnexpected documents found:');
        analysis.unexpectedFound.filter(u => u.found).forEach(({ doc }) => {
          console.log(`  ❌ ${doc}`);
        });
      }
      
      // Show response excerpt
      console.log('\nResponse excerpt:');
      console.log(data.response.substring(0, 300) + '...');
      
      return analysis.successLevel;
    } else {
      console.log('API Error:', data.error);
      metrics.failedTests++;
      metrics.byCategory[category].failed++;
      return 'failed';
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    metrics.failedTests++;
    metrics.byCategory[category].failed++;
    return 'failed';
  }
}

async function runAllTests() {
  console.log('Running comprehensive test suite for document filtering...\n');
  console.log('Test Configuration:');
  console.log('- Using enhanced query strategy (document names in query)');
  console.log('- Testing various scenarios and edge cases');
  console.log('- Measuring accuracy and contamination rates\n');
  
  // Single Document Tests
  console.log('\n' + '='.repeat(80));
  console.log('CATEGORY: SINGLE DOCUMENT TESTS');
  console.log('='.repeat(80));
  
  await runTest(
    'ER Model Only - Basic Query',
    'singleDocument',
    "Using ONLY the document '1-er_model.pptx', what concepts are covered?",
    ['1005'],
    ['1-er_model.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Dimensional Modeling Only - Specific Question',
    'singleDocument',
    "Using ONLY the document '5-dimensional_modeling.pptx', explain star schemas",
    ['1006'],
    ['5-dimensional_modeling.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Normalization Only - Complex Query',
    'singleDocument',
    "Using ONLY the document '4-normalization.pptx', what are the normal forms and why are they important?",
    ['1007'],
    ['4-normalization.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'SQL Basics Only - Tutorial Request',
    'singleDocument',
    "Using ONLY the document '2-sql_basics.pptx', show me how to write SELECT queries",
    ['1008'],
    ['2-sql_basics.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Multiple Document Tests
  console.log('\n' + '='.repeat(80));
  console.log('CATEGORY: MULTIPLE DOCUMENT TESTS');
  console.log('='.repeat(80));
  
  await runTest(
    'Two Documents - ER and Dimensional',
    'multipleDocuments',
    "Using ONLY these documents: 1-er_model.pptx, 5-dimensional_modeling.pptx, compare these modeling approaches",
    ['1005', '1006'],
    ['1-er_model.pptx', '5-dimensional_modeling.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Three Documents - Mixed Topics',
    'multipleDocuments',
    "Using ONLY these documents: 2-sql_basics.pptx, 4-normalization.pptx, 3-data_warehouse.pptx, what database concepts are covered?",
    ['1008', '1007', '1009'],
    ['2-sql_basics.pptx', '4-normalization.pptx', '3-data_warehouse.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'All Documents - Comprehensive',
    'multipleDocuments',
    "Using ONLY these documents: 1-er_model.pptx, 2-sql_basics.pptx, 3-data_warehouse.pptx, 4-normalization.pptx, 5-dimensional_modeling.pptx, provide an overview",
    ['1005', '1008', '1009', '1007', '1006'],
    ['1-er_model.pptx', '2-sql_basics.pptx', '3-data_warehouse.pptx', '4-normalization.pptx', '5-dimensional_modeling.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Edge Cases
  console.log('\n' + '='.repeat(80));
  console.log('CATEGORY: EDGE CASES');
  console.log('='.repeat(80));
  
  await runTest(
    'Very Long Query with Document Mention',
    'edgeCases',
    "Using ONLY the document '1-er_model.pptx', I need a detailed explanation of entity-relationship modeling including all the components like entities, attributes, relationships, cardinalities, and how they work together in database design",
    ['1005'],
    ['1-er_model.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Document Name at End of Query',
    'edgeCases',
    "Explain database concepts using ONLY the document '2-sql_basics.pptx'",
    ['1008'],
    ['2-sql_basics.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Case Variation in Document Name',
    'edgeCases',
    "Using ONLY the document '1-ER_MODEL.PPTX', what topics are covered?",
    ['1005'],
    ['1-er_model.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Different Query Types
  console.log('\n' + '='.repeat(80));
  console.log('CATEGORY: QUERY TYPES');
  console.log('='.repeat(80));
  
  await runTest(
    'Definition Query',
    'queryTypes',
    "Using ONLY the document '4-normalization.pptx', define third normal form",
    ['1007'],
    ['4-normalization.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Example Request',
    'queryTypes',
    "Using ONLY the document '1-er_model.pptx', give me an example of an ER diagram",
    ['1005'],
    ['1-er_model.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Comparison Query',
    'queryTypes',
    "Using ONLY these documents: 1-er_model.pptx, 5-dimensional_modeling.pptx, what's the difference between these approaches?",
    ['1005', '1006'],
    ['1-er_model.pptx', '5-dimensional_modeling.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  await runTest(
    'Practice Problem Request',
    'queryTypes',
    "Using ONLY the document '2-sql_basics.pptx', create a practice problem for JOIN queries",
    ['1008'],
    ['2-sql_basics.pptx']
  );
  await new Promise(r => setTimeout(r, 1000));
  
  // Display comprehensive metrics
  console.log('\n\n' + '='.repeat(80));
  console.log('COMPREHENSIVE TEST METRICS');
  console.log('='.repeat(80));
  
  const overallSuccessRate = (metrics.successfulTests / metrics.totalTests * 100).toFixed(1);
  const partialSuccessRate = (metrics.partialSuccessTests / metrics.totalTests * 100).toFixed(1);
  const failureRate = (metrics.failedTests / metrics.totalTests * 100).toFixed(1);
  
  console.log('\nOVERALL RESULTS:');
  console.log(`Total Tests: ${metrics.totalTests}`);
  console.log(`✅ Successful: ${metrics.successfulTests} (${overallSuccessRate}%)`);
  console.log(`⚠️  Partial Success: ${metrics.partialSuccessTests} (${partialSuccessRate}%)`);
  console.log(`❌ Failed: ${metrics.failedTests} (${failureRate}%)`);
  
  console.log('\nCATEGORY BREAKDOWN:');
  Object.entries(metrics.byCategory).forEach(([category, stats]) => {
    if (stats.total > 0) {
      const successRate = (stats.success / stats.total * 100).toFixed(1);
      console.log(`\n${category}:`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  Success: ${stats.success} (${successRate}%)`);
      console.log(`  Partial: ${stats.partial}`);
      console.log(`  Failed: ${stats.failed}`);
    }
  });
  
  console.log('\nDOCUMENT ACCURACY METRICS:');
  const correctRate = (metrics.documentAccuracy.correctDocumentMentions / 
                      (metrics.documentAccuracy.correctDocumentMentions + metrics.documentAccuracy.incorrectDocumentMentions) * 100).toFixed(1);
  console.log(`Correct Document Mentions: ${metrics.documentAccuracy.correctDocumentMentions}`);
  console.log(`Incorrect Document Mentions: ${metrics.documentAccuracy.incorrectDocumentMentions}`);
  console.log(`Document Mention Accuracy: ${correctRate}%`);
  
  console.log('\nKEY FINDINGS:');
  if (overallSuccessRate >= 80) {
    console.log('✅ The enhanced query strategy is HIGHLY EFFECTIVE');
  } else if (overallSuccessRate >= 60) {
    console.log('⚠️  The enhanced query strategy is MODERATELY EFFECTIVE');
  } else {
    console.log('❌ The enhanced query strategy needs improvement');
  }
  
  // Specific insights
  const singleDocSuccess = (metrics.byCategory.singleDocument.success / metrics.byCategory.singleDocument.total * 100).toFixed(1);
  const multiDocSuccess = (metrics.byCategory.multipleDocuments.success / metrics.byCategory.multipleDocuments.total * 100).toFixed(1);
  
  console.log(`\nSingle document filtering: ${singleDocSuccess}% success rate`);
  console.log(`Multiple document filtering: ${multiDocSuccess}% success rate`);
  
  if (singleDocSuccess > multiDocSuccess) {
    console.log('📊 Single document queries perform better than multiple document queries');
  }
  
  console.log('\nRECOMMENDATIONS:');
  if (metrics.documentAccuracy.incorrectDocumentMentions > metrics.totalTests * 0.2) {
    console.log('- Consider adding stronger prompt engineering');
    console.log('- Implement post-processing to filter out unwanted document references');
  }
  if (multiDocSuccess < 50) {
    console.log('- Multiple document selection needs improvement');
    console.log('- Consider limiting to 2-3 documents at a time');
  }
  console.log('- Continue using the enhanced query strategy as the primary solution');
}

// Run the comprehensive test suite
runAllTests().catch(console.error);