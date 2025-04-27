from flask import Flask, render_template, request, jsonify
from livereload import Server
import json
import os
import requests

from utils.query_parser import parse_query_to_filter
from utils.data_filter import load_and_filter_events

app = Flask(__name__)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query_nodes():
    user_query = request.json.get('query', '')
    filter_dict = parse_query_to_filter(user_query)
    print("DEBUG: filter_dict =", filter_dict)  # print the filter_dict for debugging
    json_path = os.path.join('static', 'data', 'events.json')
    matching_ids = []
    if os.path.exists(json_path):
        matching_ids = load_and_filter_events(json_path, filter_dict)
    return jsonify({'node_ids': matching_ids})

@app.route('/wiki_summary', methods=['POST'])
def wiki_summary():
    data = request.json
    wiki_url = data.get('wiki_link')
    if not wiki_url:
        return jsonify({'summary': 'No Wikipedia link provided.'}), 400

    # Extract the article title from the URL
    try:
        title = wiki_url.split('/wiki/')[-1]
        # Get summary from Wikipedia API
        resp = requests.get(f'https://en.wikipedia.org/api/rest_v1/page/summary/{title}')
        if resp.status_code != 200:
            return jsonify({'summary': 'Could not fetch Wikipedia summary.'}), 500
        summary = resp.json().get('extract', '')

        # Summarize with LLM
        from utils.llm import summarize_text
        llm_summary = summarize_text(summary)

        return jsonify({'summary': llm_summary, 'full_url': wiki_url})
    except Exception as e:
        return jsonify({'summary': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    
    server.watch("templates/")
    server.watch("static/css/")
    server.watch("static/js/")
    server.watch("static/data/events.json")
    server.watch("static/data/prediction_results.json")
    
    server.serve(port=5500, host="0.0.0.0", debug=True)
