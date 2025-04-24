from flask import Flask, render_template
from livereload import Server

app = Flask(__name__)
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    
    server.watch("templates/")
    server.watch("static/css/")
    server.watch("static/js/")
    server.watch("static/data/events.json")
    
    server.serve(port=5500, host="127.0.0.1", debug=True)