#!/usr/bin/env python3
"""
Test script to check CreateAI API filtering by source_name.
This script tests different methods of filtering to determine why filtering by source_name might not be working.

Usage:
1. Make sure you have the CREATE_AI_API_TOKEN environment variable set
2. Run: python test-api-filtering.py
"""

import os
import json
import requests

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Successfully loaded environment variables from .env file")
except ImportError:
    print("Warning: python-dotenv package not installed.")
    print("Environment variables must be set manually.")
    print("You can install it with: pip install python-dotenv")
    # Continue without dotenv

# Get API token from environment variables
API_TOKEN = os.getenv('CREATE_AI_API_TOKEN')
# API endpoints
API_ENDPOINT = "https://api-main-poc.aiml.asu.edu/query"
PROJECT_ENDPOINT = "https://api-main-poc.aiml.asu.edu/project"
SEARCH_ENDPOINT = "https://api-main-poc.aiml.asu.edu/search"

# Check if API token is available
if not API_TOKEN:
    print("ERROR: CREATE_AI_API_TOKEN environment variable not set.")
    print("Please set it in your .env file or export it directly.")
    exit(1)

def test_document_id_filtering():
    """Test filtering by document ID without student_id constraint."""
    
    print("\n\n===== TESTING DOCUMENT ID FILTERING WITHOUT STUDENT_ID =====")
    
    # The document ID to filter on
    target_document_id = "1005"
    target_course_id = "445567"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test using document ID filtering with expr
    payload = {
        "action": "query",
        "query": "What is this document about?",
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_docid",
        "model_params": {
            "temperature": 0.7,
            "system_prompt": "You are analyzing content from course materials. Please provide detailed information about this document.",
            "enable_search": True,
            "search_params": {
                "top_k": 10,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "material_id", "score"],
                # Use material_id instead of source_name for filtering
                "expr": f"material_id == '{target_document_id}' && course_id == '{target_course_id}'"
                # Explicitly NOT including student_id in the filter
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with document ID filter (material_id: {target_document_id})...")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Material ID: {item.get('material_id', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
            
            # Show full response
            print("\nFull response:")
            print(result.get("response", "No response"))
            
            # Analyze if response mentions ER modeling
            if "response" in result:
                response_text = result["response"]
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"\nFound ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("\nNo specific ER modeling terms found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


def test_material_id_only():
    """Test filtering with just material_id and no other constraints."""
    
    print("\n\n===== TESTING MATERIAL ID ONLY FILTERING =====")
    
    # The document ID to filter on - try different IDs
    document_ids = ["1005", "1004", "1006"]
    target_document_id = document_ids[0]
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test with only material_id in expr and direct query about ER model
    payload = {
        "action": "query",
        "query": "Tell me specifically about entity relationship modeling in this document. Focus only on ER modeling concepts.",
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_materialid_only",
        "model_params": {
            "temperature": 0.3,  # Lower temperature for more focused response
            "system_prompt": "You are analyzing course materials about database concepts. Please focus ONLY on Entity Relationship modeling content in the document. If there is no ER modeling content, clearly state that.",
            "enable_search": True,
            "search_params": {
                "top_k": 10,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "material_id", "score"],
                # Only use material_id in the filter expression
                "expr": f"material_id == '{target_document_id}'"
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with ONLY material_id filter ({target_document_id})...")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Material ID: {item.get('material_id', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
            
            # Show full response
            print("\nFull response:")
            print(result.get("response", "No response"))
            
            # Analyze if response mentions ER modeling
            if "response" in result:
                response_text = result["response"]
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"\nFound ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("\nNo specific ER modeling terms found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


def test_combined_filtering():
    """Test with both document ID and source_name without student_id."""
    
    print("\n\n===== TESTING COMBINED DOCUMENT ID AND SOURCE_NAME FILTERING =====")
    
    # The document details to filter on
    target_document_id = "1005"
    target_source_name = "1-er_model.pptx"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test using combined filtering approach
    payload = {
        "action": "query",
        "query": "What is this document about?",
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_combined",
        "model_params": {
            "temperature": 0.7,
            "system_prompt": "You are analyzing content from course materials. Please provide detailed information about this document.",
            "enable_search": True,
            "search_params": {
                "top_k": 10,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "material_id", "score"],
                # Use both material_id and source_name for filtering, but NO student_id
                "expr": f"material_id == '{target_document_id}' && source_name == '{target_source_name}'",
                "source_name": [target_source_name]
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with combined filtering (material_id: {target_document_id}, source_name: {target_source_name})...")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Material ID: {item.get('material_id', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
            
            # Show full response
            print("\nFull response:")
            print(result.get("response", "No response"))
            
            # Analyze if response mentions ER modeling
            if "response" in result:
                response_text = result["response"]
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"\nFound ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("\nNo specific ER modeling terms found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


def test_api_filtering():
    """Test different methods of filtering by source_name."""
    
    print("Testing CreateAI API with different filtering methods...")
    
    # The source name and document ID to test with
    target_source_name = "1-er_model.pptx"
    target_document_id = "1005" # Using document ID instead of relying on source_name
    
    print(f"\nFocusing tests on source name: '{target_source_name}'")
    print(f"and document ID: '{target_document_id}'\n")
    
    # Test with specific document-related queries
    test_queries = [
        "What is this document about?",                 # Generic query
        "Explain the ER model shown in this document",  # Specific to content
        "What does the 1-er_model.pptx contain?",      # Direct document reference
        "Describe entity relationship modeling"         # Topic related query
    ]
    
    # We'll use the first query for all test cases to maintain consistency
    query = test_queries[0]
    
    # Common headers and base payload parts
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test Case 1: Using source_name array in search_params with CONTAINS operator
    print("\n\n===== TEST CASE 1: Using source_name array with exact match =====")
    payload1 = {
        "action": "query",
        "query": query,
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_1",
        "model_params": {
            "temperature": 0.7,
            "system_prompt": "You are analyzing content from course materials. Explain what you find in the document.",
            "enable_search": True,
            "search_params": {
                "top_k": 5,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "score"],
                "source_name": [target_source_name]  # Direct source_name filter
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with payload: {json.dumps(payload1, indent=2)}")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload1)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
                    
            # Analyze if the response actually mentions the target document
            if "response" in result:
                response_text = result["response"]
                print("\nDocument Mention Analysis:")
                if target_source_name.lower() in response_text.lower():
                    print(f"✓ Response explicitly mentions '{target_source_name}'")
                elif "er_model" in response_text.lower() or "er model" in response_text.lower():
                    print(f"~ Response mentions 'ER model' but not specifically '{target_source_name}'")
                else:
                    print(f"✗ Response does not mention the target document or ER models")
                    
                # Look for content about ER modeling in the response
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"Found ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("No specific ER modeling terms found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
    
    # Test Case 2: Using expr filter with CONTAINS for partial matching
    print("\n\n===== TEST CASE 2: Using expr filter with CONTAINS =====")
    payload2 = {
        "action": "query",
        "query": query,
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_2",
        "model_params": {
            "temperature": 0.7,
            "system_prompt": "You are analyzing content from course materials. Explain what you find in the document.",
            "enable_search": True,
            "search_params": {
                "top_k": 5,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "score"],
                "expr": f"source_name  == '{target_source_name}'"  # Using CONTAINS for more flexible matching
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with payload: {json.dumps(payload2, indent=2)}")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload2)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
                    
            # Analyze if the response actually mentions the target document
            if "response" in result:
                response_text = result["response"]
                print("\nDocument Mention Analysis:")
                if target_source_name.lower() in response_text.lower():
                    print(f"✓ Response explicitly mentions '{target_source_name}'")
                elif "er_model" in response_text.lower() or "er model" in response_text.lower():
                    print(f"~ Response mentions 'ER model' but not specifically '{target_source_name}'")
                else:
                    print(f"✗ Response does not mention the target document or ER models")
                    
                # Look for content about ER modeling in the response
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"Found ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("No specific ER modeling terms found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
    
    # Test Case 3: Using multiple conditions in expr filter
    print("\n\n===== TEST CASE 3: Using multiple conditions in expr filter =====")
    payload3 = {
        "action": "query",
        "query": query,
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_3",
        "model_params": {
            "temperature": 0.7,
            "system_prompt": "You are analyzing content from course materials. Explain what you find in the document.",
            "enable_search": True,
            "search_params": {
                "top_k": 5,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "score"],
                "expr": f"(source_name == '{target_source_name}' || source_name CONTAINS 'er_model' || source_name CONTAINS 'ER_MODEL')",
                # Try both approaches together
                "source_filters": {
                    "source_names": [target_source_name, "er_model", "ER_MODEL"]
                }
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with payload: {json.dumps(payload3, indent=2)}")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload3)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
                    
            # Analyze if the response actually mentions the target document
            if "response" in result:
                response_text = result["response"]
                print("\nDocument Mention Analysis:")
                if target_source_name.lower() in response_text.lower():
                    print(f"✓ Response explicitly mentions '{target_source_name}'")
                elif "er_model" in response_text.lower() or "er model" in response_text.lower():
                    print(f"~ Response mentions 'ER model' but not specifically '{target_source_name}'")
                else:
                    print(f"✗ Response does not mention the target document or ER models")
                    
                # Look for content about ER modeling in the response
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"Found ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("No specific ER modeling terms found in response")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

    # Test Case 4: Direct file name mention in system prompt
    print("\n\n===== TEST CASE 4: Direct file name mention in system prompt =====")
    payload4 = {
        "action": "query",
        "query": f"Explain the content of the file named {target_source_name}",
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_4",
        "model_params": {
            "temperature": 0.7,
            "system_prompt": f"You are analyzing content from course materials. Focus ONLY on the document named '{target_source_name}' and ignore all other documents. The user wants information specifically about this document.",
            "enable_search": True,
            "search_params": {
                "top_k": 5,
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "score"],
                "source_name": [target_source_name]
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with payload: {json.dumps(payload4, indent=2)}")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload4)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
                    
            # Analyze if the response actually mentions the target document
            if "response" in result:
                response_text = result["response"]
                print("\nDocument Mention Analysis:")
                if target_source_name.lower() in response_text.lower():
                    print(f"✓ Response explicitly mentions '{target_source_name}'")
                elif "er_model" in response_text.lower() or "er model" in response_text.lower():
                    print(f"~ Response mentions 'ER model' but not specifically '{target_source_name}'")
                else:
                    print(f"✗ Response does not mention the target document or ER models")
                    
                # Look for content about ER modeling in the response
                er_terms = ["entity relationship", "er model", "entity", "relationship", "attribute", "primary key"]
                found_terms = [term for term in er_terms if term in response_text.lower()]
                if found_terms:
                    print(f"Found ER modeling terms: {', '.join(found_terms)}")
                else:
                    print("No specific ER modeling terms found in response")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


def test_direct_search():
    """Test direct search endpoint to verify if document exists."""
    
    print("\n\n===== TESTING DIRECT SEARCH ENDPOINT =====")
    target_source_name = "1-er_model.pptx"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test if the document exists in the collection
    payload = {
        "action": "search",
        "query": "model",  # Very general query to catch anything
        "collection": "main",
        "expr": f"source_name == '{target_source_name}'",
        "top_k": 10,
        "output_fields": ["content", "source_name", "metadata"]
    }
    
    try:
        print(f"Checking if document '{target_source_name}' exists in the collection...")
        response = requests.post(SEARCH_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Found {len(result.get('results', []))} results")
            
            # Print all source names found
            all_sources = set()
            for item in result.get('results', []):
                source = item.get('source_name', 'Unknown')
                all_sources.add(source)
            
            print("\nAll source names in collection:")
            for source in sorted(all_sources):
                print(f"- {source}")
                
            # If our target source exists, print a sample of its content
            target_found = False
            for item in result.get('results', []):
                if item.get('source_name') == target_source_name:
                    target_found = True
                    print(f"\nFound target document '{target_source_name}'")
                    content = item.get('content', '')
                    print(f"Sample content: {content[:200]}..." if len(content) > 200 else content)
                    break
            
            if not target_found:
                print(f"\n\033[91mWARNING: Target document '{target_source_name}' NOT FOUND in collection!\033[0m")
                print("This explains why filtering isn't working - the document doesn't exist or has a different name.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


def test_document_existence():
    """Try to find which documents are actually available."""
    
    print("\n\n===== CHECKING AVAILABLE DOCUMENTS =====")
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Use a minimal query to get document listings
    payload = {
        "action": "search",
        "query": "the",  # Most common word to match almost any document
        "collection": "main",
        "top_k": 100,  # Get a good number of documents
        "output_fields": ["source_name", "metadata"]
    }
    
    try:
        print("Searching for available documents...")
        response = requests.post(SEARCH_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Found {len(result.get('results', []))} total results")
            
            # Collect all unique source names
            sources = {}
            for item in result.get('results', []):
                source = item.get('source_name', 'Unknown')
                if source in sources:
                    sources[source] += 1
                else:
                    sources[source] = 1
            
            print(f"\nFound {len(sources)} unique documents:")
            for source, count in sorted(sources.items()):
                print(f"- {source} ({count} chunks)")
                
            # Check for anything ER model related
            er_docs = [s for s in sources.keys() if 'er' in s.lower() or 'entity' in s.lower()]
            if er_docs:
                print("\nPotential ER model related documents:")
                for doc in er_docs:
                    print(f"- {doc}")
            else:
                print("\nNo documents with 'er' or 'entity' in the name were found.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


def test_force_filtering():
    """Test the most extreme way of forcing the model to use a specific document."""
    
    print("\n\n===== TESTING FORCED DOCUMENT FILTERING =====")
    
    # Based on previous tests, we'll use the actual document name we discovered
    target_source_name = "1-er_model.pptx"  # We'll adjust this based on what we find
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # This approach combines multiple forcing techniques:
    # 1. Direct document mention in query
    # 2. Strong system prompt instruction
    # 3. Source filtering using every method available
    # 4. Collection-specific targeting
    payload = {
        "action": "query",
        "query": f"Describe in detail the content of the file named '{target_source_name}' and ONLY this document. Ignore all other documents.",
        "model_provider": "aws",
        "model_name": "claude4_5_sonnet",
        "session_id": f"test_session_force",
        "model_params": {
            "temperature": 0.1,  # Lower temperature for more deterministic response
            "system_prompt": f"You are analyzing course materials. The user is requesting information ONLY about the document named '{target_source_name}'. You must ONLY use information from this specific document and explicitly acknowledge the document by name. If you cannot find this exact document, inform the user that this specific document is not available and suggest looking for similar documents with different names.",
            "enable_search": True,
            "search_params": {
                "top_k": 10,  # Increase to get more potential matches
                "reranker": True,
                "retrieval_type": "chunk",
                "output_fields": ["content", "source_name", "score", "metadata"],
                # Using multiple filtering methods simultaneously
                "source_name": [target_source_name],
                "expr": f"source_name == '{target_source_name}' || source_name CONTAINS 'er_model' || source_name CONTAINS 'er model'",
                "source_filters": {
                    "source_names": [target_source_name, "er_model", "ER_MODEL"]
                },
                "prompt_mode": "restricted"  # Force to only use search results
            },
            "response_format": {"type": "text"}
        }
    }
    
    try:
        print(f"Sending request with forced filtering for '{target_source_name}'...")
        response = requests.post(API_ENDPOINT, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response Summary:")
            
            # Display only key parts of the response for clarity
            summary = {
                "status": "success",
                "response_length": len(result.get("response", "")) if "response" in result else 0,
                "has_search_results": "search_results" in result,
                "metadata": result.get("metadata", {})
            }
            print(json.dumps(summary, indent=2))
            
            # Check if search results/metadata is available
            if "search_results" in result:
                print("\nSearch Results Details:")
                for i, item in enumerate(result["search_results"]):
                    print(f"\n[Result {i+1}]")
                    print(f"Source: {item.get('source_name', 'Unknown')}")
                    print(f"Score: {item.get('score', 'N/A')}")
                    content = item.get('content', '')
                    print(f"Content snippet: {content[:100]}..." if len(content) > 100 else content)
            
            # Show full response for analysis
            print("\nFull response:")
            print(result.get("response", "No response"))
            
            # Analyze document mentions
            if "response" in result:
                response_text = result["response"]
                print("\nDocument Mention Analysis:")
                if target_source_name.lower() in response_text.lower():
                    print(f"✓ Response explicitly mentions '{target_source_name}'")
                elif "er_model" in response_text.lower() or "er model" in response_text.lower():
                    print(f"~ Response mentions 'ER model' but not specifically '{target_source_name}'")
                else:
                    print(f"✗ Response does not mention the target document or ER models")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception occurred: {str(e)}")


if __name__ == "__main__":
    # Test with just material_id filtering
    test_material_id_only()
    
    # Other tests available but commented out
    # test_document_id_filtering()
    # test_combined_filtering()
    # test_document_existence()
    # test_direct_search()
    # test_force_filtering()
    # test_api_filtering()