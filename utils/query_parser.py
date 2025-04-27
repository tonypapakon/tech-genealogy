import spacy

nlp = spacy.load("en_core_web_sm")

def parse_query_to_filter(query: str):
    doc = nlp(query)
    # Prefer multi-word noun chunks
    noun_chunks = [chunk.text.lower() for chunk in doc.noun_chunks if not any(token.is_stop for token in chunk)]
    # Fallback to single nouns/proper nouns
    keywords = [token.text.lower() for token in doc if token.pos_ in {"NOUN", "PROPN"} and not token.is_stop]
    # Use noun chunks if available, else keywords
    topics = noun_chunks if noun_chunks else keywords
    if not topics:
        topics = [word.lower() for word in query.strip().split() if word.lower() not in nlp.Defaults.stop_words]
    filter_dict = {"topics": topics}
    print("Filter dict:", filter_dict)
    return filter_dict