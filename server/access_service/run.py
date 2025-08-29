import os
from src import create_app
from dotenv import load_dotenv

load_dotenv()

config_name = os.getenv('FLASK_CONFIG', 'default')
app = create_app(config_name)

if __name__ == '__main__':
    # Running on port 5003
    app.run(debug=True, port=5003)