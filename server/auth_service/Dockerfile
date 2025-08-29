# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.10

# Set the working directory in the container
WORKDIR /app
    
# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the src directory and the run.py file into the container at /app
COPY ./src ./src
COPY run.py .

# Make port 5000 available to the world outside this container
# Gunicorn will run on this port
EXPOSE 5000

# Define environment variables
# It's better to pass sensitive variables at runtime
ENV FLASK_APP run.py
ENV FLASK_CONFIG production

# Run the application using Gunicorn
# The command tells Gunicorn to run the 'app' instance from the 'run' module.
# We specify 4 workers. Adjust this number based on your server's CPU cores.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
