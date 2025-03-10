# .gitignore

```
# Dependencies
node_modules/
vendor/

# Environment
.env
.env.local
.env.*.local

# Build artifacts
build/
dist/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE/Editor
.idea/
.vscode/
*.swp
*.swo

# Docker
.docker/
docker-compose.override.yml

# System
.DS_Store
Thumbs.db
```

# backend/docker-entrypoint.sh

```sh
#!/bin/sh
set -e

# Create required directories and set permissions
mkdir -p /var/log/nginx
mkdir -p /var/log/php
touch /var/log/php/fpm-error.log
chown -R www-data:www-data /var/log/nginx
chown -R www-data:www-data /var/log/php
chmod 755 /var/log/nginx
chmod 755 /var/log/php

# Start PHP-FPM
php-fpm -D

# Wait a moment for PHP-FPM to be ready
sleep 2

# Start Nginx in foreground
nginx -g "daemon off;"

```

# backend/Dockerfile

```
FROM php:8.1-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure PHP and PHP-FPM
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# Create necessary directories for logs
RUN mkdir -p /var/log/nginx \
    && mkdir -p /var/log/php \
    && touch /var/log/nginx/error.log \
    && touch /var/log/nginx/access.log \
    && touch /var/log/php/fpm-error.log \
    && chown -R www-data:www-data /var/log/nginx \
    && chown -R www-data:www-data /var/log/php \
    && chmod 755 /var/log/nginx \
    && chmod 755 /var/log/php

WORKDIR /var/www/html

# Copy configuration files
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY php/custom.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy source code
COPY src/ /var/www/html/

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]

```

# backend/logs/nginx/access.log

```log

```

# backend/logs/nginx/error.log

```log

```

# backend/logs/php/fpm-error.log

```log

```

# backend/nginx/default.conf

```conf
server {
    listen 80;
    server_name localhost;
    root /var/www/html;
    index index.php;

    location /api {
        # CORS headers - use actual frontend port, not variable
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' '*' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        try_files $uri $uri/ /api.php?$args;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    error_log /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
}
```

# backend/php/custom.ini

```ini
[PHP]
; Development settings
display_errors = On
display_startup_errors = On
error_reporting = E_ALL
log_errors = On
error_log = /var/log/php/errors.log

; Performance settings
memory_limit = 256M
max_execution_time = 30
max_input_time = 60
post_max_size = 8M
upload_max_filesize = 2M

; Security settings
expose_php = Off
session.cookie_httponly = 1
session.use_only_cookies = 1
session.cookie_secure = 1

```

# backend/php/www.conf

```conf
[www]
user = www-data
group = www-data
listen = 127.0.0.1:9000
pm = dynamic
pm.max_children = 5
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
catch_workers_output = yes
php_admin_value[error_log] = /var/log/php/fpm-error.log
php_admin_flag[log_errors] = on

```

# backend/src/api.php

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Get the request path
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Remove /api prefix
$path = str_replace('/api/', '', $path);

switch ($path) {
    case 'db-status':
        checkDatabaseStatus();
        break;
    default:
        echo json_encode(['message' => 'Welcome to the API!']);
        break;
}

function checkDatabaseStatus()
{
    try {
        $host = getenv('MYSQL_HOST');
        $port = getenv('MYSQL_PORT');
        $db   = getenv('MYSQL_DB');
        $user = getenv('MYSQL_USER');
        $pass = getenv('MYSQL_PASSWORD');

        $dsn = "mysql:host=$host;port=$port;dbname=$db";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Get MySQL version
        $stmt = $pdo->query("SELECT VERSION() AS version");
        $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];

        echo json_encode([
            'success' => true,
            'version' => $version,
            'message' => 'Database connection successful',
            'config' => [
                'host' => $host,
                'port' => $port,
                'database' => $db,
                'user' => $user
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'config' => [
                'host' => $host,
                'port' => $port,
                'database' => $db,
                'user' => $user
            ]
        ]);
    }
}

```

# backend/src/index.php

```php
<?php
echo "Welcome to the backend!";

```

# config/development.yaml

```yaml
project:
  environment: development
  framework: react-php
  language: fullstack
  name: chimera-web-platform
services:
  backend:
    build:
      context: ./backend
    environment:
      MYSQL_DB: ${MYSQL_DB}
      MYSQL_HOST: ${MYSQL_HOST}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_USER: ${MYSQL_USER}
    ports:
    - 8000:80
  frontend:
    build:
      context: ./frontend
    environment:
      REACT_APP_API_URL: http://localhost:8000
    ports:
    - 3000:3000
  mysql:
    environment:
      MYSQL_DATABASE: ${MYSQL_DB}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${MYSQL_USER}
    ports:
    - 3300:3306
  phpmyadmin:
    environment:
      PMA_HOST: ${MYSQL_HOST}
      PMA_PASSWORD: ${MYSQL_PASSWORD}
      PMA_USER: ${MYSQL_USER}
    ports:
    - 8081:80

```

# database/init/init.sql

```sql
-- Create developer user
CREATE USER IF NOT EXISTS 'developer'@'%' IDENTIFIED BY 'devpassword';
GRANT ALL PRIVILEGES ON exampledb.* TO 'developer'@'%';
FLUSH PRIVILEGES;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');

```

# docker-compose.yml

```yml
networks:
  app_network:
    driver: bridge
    name: chimera-web-platform_network
services:
  backend:
    build:
      context: ./backend
    container_name: chimera-web-platform-backend
    depends_on:
    - mysql
    environment:
    - MYSQL_HOST=mysql
    - MYSQL_PORT=3306
    - MYSQL_USER=${MYSQL_USER}
    - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    - MYSQL_DB=${MYSQL_DB}
    networks:
    - app_network
    ports:
    - 8000:80
    volumes:
    - ./backend/src:/var/www/html
    - ./backend/logs:/var/log
  frontend:
    build:
      context: ./frontend
    container_name: chimera-web-platform-frontend
    depends_on:
    - backend
    environment:
    - REACT_APP_PORT=3000
    - REACT_APP_BACKEND_PORT=8000
    - REACT_APP_MYSQL_PORT=3300
    - REACT_APP_PHPMYADMIN_PORT=8081
    - REACT_APP_API_URL=http://localhost:8000
    - WDS_SOCKET_HOST=0.0.0.0
    - WDS_SOCKET_PORT=3000
    - CHOKIDAR_USEPOLLING=true
    - WATCHPACK_POLLING=true
    networks:
    - app_network
    ports:
    - 3000:3000
    volumes:
    - ./frontend:/app
    - /app/node_modules
  mysql:
    container_name: chimera-web-platform-mysql
    environment:
      MYSQL_DATABASE: ${MYSQL_DB}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${MYSQL_USER}
    image: mysql:8.0
    networks:
    - app_network
    ports:
    - 3300:3306
    volumes:
    - mysql_data:/var/lib/mysql
    - ./database/init:/docker-entrypoint-initdb.d
  phpmyadmin:
    container_name: chimera-web-platform-phpmyadmin
    depends_on:
    - mysql
    environment:
      PMA_HOST: mysql
      PMA_PASSWORD: ${MYSQL_PASSWORD}
      PMA_USER: ${MYSQL_USER}
    image: phpmyadmin/phpmyadmin
    networks:
    - app_network
    ports:
    - 8081:80
volumes:
  mysql_data:
    driver: local

```

# frontend/.dockerignore

```
node_modules
build
.git
*.log
.env
.env.local
.DS_Store

```

# frontend/Dockerfile

```
FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Environment variables
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV WDS_SOCKET_PORT=0

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start", "--", "--host", "0.0.0.0"]

```

# frontend/package.json

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/node": "^16.18.68",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "@types/jest": "^27.5.2"
  }
}

```

# frontend/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

```

# frontend/src/App.tsx

```tsx
import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL;
const FRONTEND_PORT = process.env.REACT_APP_PORT;
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;
const PHPMYADMIN_PORT = process.env.REACT_APP_PHPMYADMIN_PORT;
const MYSQL_PORT = process.env.REACT_APP_MYSQL_PORT;

const App = () => {
  const [dbStatus, setDbStatus] = useState("Checking...");
  const [dbVersion, setDbVersion] = useState("");
  const [dbConfig, setDbConfig] = useState(null);

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/db-status`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "omit",
        });

        const data = await response.json();
        if (data.success) {
          setDbStatus("Connected");
          setDbVersion(data.version);
          setDbConfig(data.config);
        } else {
          setDbStatus(`Error: ${data.error}`);
          setDbConfig(data.config);
        }
      } catch (error) {
        console.error("Error:", error);
        setDbStatus("Error connecting to database");
      }
    };

    checkDatabaseStatus();
  }, []);

  return (
    <div className="app-container">
      <h1>ChimeraStack React + PHP Development Environment</h1>

      <section className="stack-overview">
        <h2>Stack Overview</h2>
        <table className="status-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Details</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Frontend</td>
              <td>React</td>
              <td>localhost:{FRONTEND_PORT}</td>
            </tr>
            <tr>
              <td>Backend API</td>
              <td>Nginx + PHP-FPM</td>
              <td>localhost:{BACKEND_PORT}</td>
            </tr>
            <tr>
              <td>Database</td>
              <td>MySQL</td>
              <td>localhost:{MYSQL_PORT}</td>
            </tr>
            <tr>
              <td>Database GUI</td>
              <td>phpMyAdmin</td>
              <td>
                <a
                  href={`http://localhost:${PHPMYADMIN_PORT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  localhost:{PHPMYADMIN_PORT}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="quick-links">
        <h2>Quick Links</h2>
        <ul>
          <li>
            <a
              href={`${API_URL}/api`}
              target="_blank"
              rel="noopener noreferrer"
            >
              API Status
            </a>
          </li>
          <li>
            <a
              href={`http://localhost:${PHPMYADMIN_PORT}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              phpMyAdmin
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>Database Connection Status</h2>
        <div
          className={`status-indicator ${
            dbStatus === "Connected" ? "status-success" : "status-error"
          }`}
        >
          {dbStatus === "Connected" ? (
            <>
              ✓ Connected to MySQL Server {dbVersion}
              <br />
              Database: {dbConfig?.database}
              <br />
              User: {dbConfig?.user}
            </>
          ) : (
            <>
              ✖ {dbStatus}
              {dbConfig && (
                <div className="config-debug">
                  <pre>{JSON.stringify(dbConfig, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
```

# frontend/src/components/layout/Footer.tsx

```tsx
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} ChimeraStack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
```

# frontend/src/components/layout/MainLayout.tsx

```tsx
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
};
```

# frontend/src/components/layout/Navbar.tsx

```tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">ChimeraStack</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/templates" className="text-gray-700 hover:text-blue-600">Templates</Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

# frontend/src/components/shared/Button.tsx

```tsx
// components/shared/Button.tsx
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  // Using our design system colors
  const baseClasses = 'rounded font-medium focus:outline-none focus:ring-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
```

# frontend/src/components/shared/Card.tsx

```tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};
```

# frontend/src/components/shared/Spinner.tsx

```tsx
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`} role="status">
      <div className="animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 h-full w-full"/>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
```

# frontend/src/context/AuthContext.tsx

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (data: any) => {
    // To be implemented with API
    setUser(data);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

# frontend/src/hooks/useWindowSize.ts

```ts
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
```

# frontend/src/index.tsx

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

```

# frontend/src/services/api.ts

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `http://localhost:${process.env.BACKEND_PORT}/api`,
});

export default api;import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

# frontend/src/setupProxy.ts

```ts
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.REACT_APP_BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT}`,
      pathRewrite: {
        "^/api": "/api",
      },
      changeOrigin: true,
    })
  );
};
```

# frontend/src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-900 bg-gray-50;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2;
  }
}
```

# frontend/src/utils/colors.ts

```ts
export const validateContrast = (background: string, foreground: string): boolean => {
    // Basic implementation - to be expanded
    const getLuminance = (color: string) => {
      // Convert hex to rgb and calculate luminance
      return 0.5; // Placeholder
    };
    
    const ratio = (Math.max(getLuminance(background), getLuminance(foreground)) + 0.05) /
                  (Math.min(getLuminance(background), getLuminance(foreground)) + 0.05);
    
    return ratio >= 4.5; // WCAG AA standard
  };
```

# frontend/src/utils/security.ts

```ts
export const sanitizeHTML = (html: string): string => {
    const element = document.createElement('div');
    element.textContent = html;
    return element.innerHTML;
  };
  
  export const isValidToken = (token: string): boolean => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      const payload = JSON.parse(jsonPayload);
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  };
```

# frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}

```

