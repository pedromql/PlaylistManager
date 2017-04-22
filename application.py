from api import application
import logging
import os

if __name__ == "__main__":
    os.makedirs('static/Music', exist_ok=True)
    application.debug = False

    application.run(host="0.0.0.0", port=8080, processes=4)