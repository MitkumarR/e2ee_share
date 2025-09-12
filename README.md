# e2ee share: End-to-End Encrypted File Sharing Service

**e2ee share** is a secure file-sharing application that ensures your files are encrypted from end-to-end, meaning only you and the intended recipient can access the content. The service is built with a microservices architecture to ensure scalability and maintainability.

## Key Features

  * **End-to-End Encryption**: Files are encrypted in the browser before being uploaded, and can only be decrypted by the recipient with a unique link. The server never has access to the unencrypted file content.
  * **Secure User Authentication**: A robust authentication system with OTP verification and JWT-based sessions.
  * **One-Time Download Links**: Shared links are valid for a single use, enhancing security by preventing unauthorized access after the intended download.
  * **Microservices Architecture**: The backend is split into three distinct services:
      * **Auth Service**: Manages user registration, login, and authentication.
      * **File Service**: Handles the storage and retrieval of encrypted files.
      * **Access Control Service**: Manages the creation and verification of secure, one-time download links.
  * **Client-Side Encryption**: All encryption and decryption operations happen in the user's browser, powered by the Web Crypto API.

## Swift Object Storage (Private Encrypted Storage)

We use **OpenStack Swift** to store encrypted files — providing our own private object storage service instead of relying on third-party providers.

* [What is OpenStack?](https://www.openstack.org/software/)
* [What is Swift?](https://www.openstack.org/software/releases/dalmatian/components/swift)

For this project, we deployed **Swift All-In-One (SAIO)** with its three core services:

* **Account**
* **Container**
* **Object**

This minimal setup is sufficient for our requirements — there’s no need to run the full OpenStack cloud environment.

### References

* Official SAIO documentation: [Swift All-In-One Guide](https://docs.openstack.org/swift/2025.1/development_saio.html)
* Simplified setup guide for this project: [Project Wiki – SAIO Setup](https://github.com/MitkumarR/e2ee_share/wiki/1.-Setup-SAIO-%28Swift-All-in-One%29-in-Ubuntu-VM)


## Workflow

![A screenshot of the application](https://github.com/MitkumarR/e2ee_share/blob/main/diagram-workflow.png)


## Technology Stack

### Frontend

  * **React**: A popular JavaScript library for building user interfaces.
  * **Material-UI**: A comprehensive suite of UI tools to implement Google's Material Design.
  * **Axios**: A promise-based HTTP client for the browser and Node.js.
  * **Vite**: A fast build tool that provides a leaner and faster development experience for modern web projects.

### Backend

  * **Flask**: A lightweight WSGI web application framework in Python.
  * **PostgreSQL**: A powerful, open-source object-relational database system.
  * **Openstack Swift Service**: SAIO environment by openstack(devstack) for object storage service. (To store encrypted files)
  * **Redis**: An in-memory data structure store, used for caching and managing one-time links.
  * **Docker**: For containerizing each service, ensuring a consistent and isolated environment.
  * **Gunicorn**: A Python WSGI HTTP Server for UNIX.
  

## Project Structure

The project is organized into a `client` directory for the frontend application and a `server` directory containing the backend microservices.

```
e2ee_share/
├── client/         # React Frontend
├── server/
│   ├── access_service/
│   ├── auth_service/
│   └── file_service/
└── docker-compose.yml
```

## Setup and Installation

### Prerequisites
 
  * Docker and Docker Compose
  * Node.js and npm (for local client development)
  * Python and pip (for local backend development)

### Running with Docker

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mitkumarr/e2ee_share.git
    cd e2ee_share
    ```
2.  **Create a `.env` file:**
      
    ```bash
    SECRET_KEY='your-secret-key'
    JWT_SECRET_KEY='yout-jwt-secret-key'

    # PostgreSQL Database Credentials
    POSTGRES_USER='postgres'
    POSTGRES_PASSWORD='password'
    POSTGRES_HOST='localhost' # or the IP address of your DB server
    POSTGRES_PORT='5432'
    POSTGRES_DB='db_name'

    # Email Configuration
    MAIL_SERVER='smtp.gmail.com'
    MAIL_PORT=587
    MAIL_USE_TLS=true
    MAIL_USERNAME='example@gmail.com'
    MAIL_PASSWORD='password'

    REDIS_URL='redis://localhost:6379/0'
    ```
    * Fill in the required environment variables, such as secret keys and database credentials.
3.  **Build and run the services:**
    ```bash
    docker-compose up --build
    ```
    This will start all the services, and the application will be accessible at `http://localhost:5173`.