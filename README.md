<h1 align="center">
  <img src="static/icons/logo_tech-genealogy.png" alt="Logo" width="200" style="margin-bottom:20px;">
  <br>
  Technology Genealogy
</h1>

A web application that visualizes the genealogy of technology using D3.js and Flask. The project displays a timeline of technological events in an interactive tree format with clickable nodes for more information.

## Features

- **Interactive Tree Visualization:** Visualize events in technology history laid out in a tree structure.
- **Natural Language Search (LLM-powered):** Use natural language queries to find and highlight technologies. Powered by a local Large Language Model (LLM) via [Ollama](https://ollama.com/) (e.g., `phi`, `llama2`, or `mistral`).
- **Clickable Nodes:** Click on a node to open its related Wikipedia page.
- **Zoom and Pan:** Use mouse scroll and drag to zoom in/out and pan across the visualization.
- **Responsive & Mobile-Friendly:** The visualization scales to fill the browser window and supports horizontal scrolling on mobile.

## Project Structure

```
tech-genealogy/
├── app.py              # Flask application
├── templates/
│   └── index.html      # Main HTML file
├── static/
│   ├── css/
│   │   └── styles.css  # CSS styling for the project
│   ├── js/
│   │   └── tree.js     # D3.js script for rendering the tree visualization
│   └── data/
│       └── events.json # JSON data for technology events
│   └── icons/
│       └── logo_tech-genealogy.png # App logo/favicon
└── README.md           # Project documentation (this file)
```

## Requirements

- Python 3.x
- Flask
- livereload
- D3.js (loaded via CDN in the HTML)
- [Ollama](https://ollama.com/) (for local LLM-powered search, e.g., `phi`, `llama2`, or `mistral`)

## Setup and Running the Project

1. **Install Python dependencies:**  
   ```bash
   pip install Flask livereload
   ```

2. **Install Ollama and Pull a Model:**  
   - [Install Ollama](https://ollama.com/download)
   - Pull a model (e.g., `phi`):  
     ```bash
     ollama pull phi
     ```
   - You can also use `llama2` or `mistral` for better results.

3. **Run the Application:**  
   ```bash
   python app.py
   ```
   The server will start and serve the app at [http://127.0.0.1:5500](http://127.0.0.1:5500).

4. **View in Browser:**  
   Open your browser and go to [http://127.0.0.1:5500](http://127.0.0.1:5500).

5. **View on Mobile:**  
   - Make sure your phone and computer are on the same Wi-Fi.
   - Find your computer’s local IP (e.g., `192.168.x.x`).
   - Open `http://192.168.x.x:5500` in your mobile browser.

## Customization

- **Data:**  
  Update `static/data/events.json` to modify or add new technology event nodes.

- **Styling:**  
  Adjust the styles in `static/css/styles.css` to customize the look and feel of the visualization.

- **Visualization:**  
  The tree layout is rendered by `static/js/tree.js`. Tweak the D3.js code (e.g., spacing, zoom settings) to customize the visualization.

## License

This project is open source.

## Acknowledgments

- [D3.js](https://d3js.org/) for the visualization library.
- [Flask](https://flask.palletsprojects.com/) for the web framework.
- [Ollama](https://ollama.com/) for local LLM inference.
- Wikimedia and Wikipedia for technology event data inspiration.

