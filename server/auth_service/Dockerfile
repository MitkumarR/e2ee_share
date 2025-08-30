# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Prevent python from writing .pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# Ensure python output is sent straight to the terminal without buffering
ENV PYTHONUNBUFFERED 1

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code into the container
COPY ./src ./src
COPY run.py .

# Expose the port the app runs on (this is for documentation; docker-compose will handle the actual mapping)
# EXPOSE 5001, 5002, or 5003 depending on the service

# The command to run the application using Gunicorn (a production-ready server)
# We bind to 0.0.0.0 to allow traffic from outside the container.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "run:app"]