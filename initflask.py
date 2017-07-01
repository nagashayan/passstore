#!/usr/bin/env python
from __future__ import print_function
from time import sleep
import sys
from flask import Flask, send_file

app = Flask(__name__)
app.config['DEBUG'] = True

@app.route("/")
def index():
    return send_file('index.html')


if __name__ == "__main__":
    print('oh hello')
    #sleep(10)
    sys.stdout.flush()
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.jinja_env.cache = {}

    app.run(debug=True)
    #app.run()
