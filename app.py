from flask import Flask, render_template, request, jsonify
from livereload import Server
import json
import os

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

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    
    server.watch("templates/")
    server.watch("static/css/")
    server.watch("static/js/")
    server.watch("static/data/events.json")
    server.watch("static/data/prediction_results.json")
    
    server.serve(port=5500, host="0.0.0.0", debug=True)
