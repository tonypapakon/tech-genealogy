import ollama

def summarize_text(text):
    prompt = f"Summarize this Wikipedia article in 3-4 sentences for a general audience:\n\n{text}"
    response = ollama.chat(
        model='phi', 
        messages=[{'role': 'user', 'content': prompt}]
    )
    return response['message']['content']