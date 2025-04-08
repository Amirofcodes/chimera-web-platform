# ChimeraStack Web Platform

A web platform for discovering and downloading pre-configured Docker-based development environment templates.

## Features

- **Template Library**: Browse and search development environment templates
- **Template Downloads**: Download ready-to-use environments after signing in
- **Download History**: Track your previously downloaded templates
- **CLI Integration**: Download the ChimeraStack CLI tool

## Available Templates

- **PHP/Nginx/MySQL**: PHP development with Nginx web server and MySQL database
- **PHP/Nginx/PostgreSQL**: PHP development with Nginx web server and PostgreSQL database
- **PHP/Nginx/MariaDB**: PHP development with Nginx web server and MariaDB database
- **Fullstack React/PHP/MySQL**: Complete stack with React frontend, PHP backend, and MySQL database

## Getting Started

### 1. Create an Account

Sign up for a free account to access template downloads and download history tracking.

### 2. Browse Templates

Explore available templates from the templates page. Each template includes:
- Detailed description and component list
- Service configuration details
- Download statistics

### 3. Download Templates

Click the "Download Template" button on any template detail page. Templates are provided as ZIP files containing all necessary configuration files.

### 4. Run Your Environment

After downloading a template:
1. Extract the ZIP file
2. Navigate to the extracted directory
3. Start the environment with Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. Access your development environment through the allocated ports

## Using the CLI

For advanced users, we recommend the ChimeraStack CLI for direct template management from your terminal:

```bash
# Install via pip
pip install chimera-stack-cli

# Or download the binary from the Download CLI page
```

## Related Projects

- [ChimeraStack CLI](https://github.com/Amirofcodes/ChimeraStack_CLI): Command-line tool for template management
