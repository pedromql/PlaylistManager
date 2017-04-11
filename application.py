from api import application
import logging

if __name__ == "__main__":

    application.debug = False

    application.run(host="0.0.0.0", port=8080, processes=4)