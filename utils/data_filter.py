import re
import json

def normalize(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())

def load_and_filter_events(json_path, filter_dict):
    with open(json_path) as f:
        events = json.load(f)
    topics = filter_dict.get("topics", [])
    def matches(event):
        name = normalize(event.get("name", ""))
        category = normalize(event.get("category", ""))
        return any(normalize(topic) in name or normalize(topic) in category for topic in topics)
    matching_ids = [event["id"] for event in events if matches(event)]
    return matching_ids