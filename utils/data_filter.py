import json

def load_and_filter_events(json_path, filter_dict):
    with open(json_path, 'r') as f:
        events = json.load(f)
    results = []
    topic = filter_dict.get('topic', '').lower()
    for node in events:
        if topic in node.get('name', '').lower() or topic in node.get('annotation', '').lower():
            results.append(node['id'])
    return results