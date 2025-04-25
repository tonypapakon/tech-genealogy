import ollama
import json
import re

def parse_query_to_filter(query: str):
    prompt = (
        "Extract the main keyword or phrase from the following user query that should be searched for in a technology tree. "
        "Return only a JSON object with a single key 'topic' and the value being the keyword or phrase. "
        "Examples:\n"
        "Query: 'Show me milestones about mobile gaming'\n"
        "Output: {\"topic\": \"mobile gaming\"}\n"
        "Query: 'Where is 5g'\n"
        "Output: {\"topic\": \"5g\"}\n"
        "Query: 'Can you indicate the smartphone on the tree?'\n"
        "Output: {\"topic\": \"smartphone\"}\n"
        f"Query: '{query}'\n"
        "Output:"
    )
    try:
        response = ollama.chat(
            model='mistral',
            messages=[{'role': 'user', 'content': prompt}]
        )
        content = response['message']['content']
        filter_dict = json.loads(content)
        print("DEBUG: Used LLM for topic extraction")
    except Exception:
        print("DEBUG: Used fallback for topic extraction")
        # fallback: extract the last quoted phrase or the last word
        match = re.search(r"'([^']+)'|\"([^\"]+)\"|(\b\w+\b)$", query)
        if match:
            topic = match.group(1) or match.group(2) or match.group(3)
        else:
            topic = query.strip().split()[-1]
        filter_dict = {"topic": topic.lower()}
    return filter_dict