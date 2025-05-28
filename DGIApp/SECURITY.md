# Security Guidelines for DGI Application

This document outlines security best practices for deploying and maintaining the DGI Application.

## Secure Configuration

1. **Environment Variables**
   - Never hardcode sensitive information in the codebase
   - Copy `.env.example` to `.env` and set secure values
   - Generate a strong JWT secret using: `openssl rand -base64 64`
   - Use different credentials for development, testing, and production

2. **Database Security**
   - Create a dedicated database user with minimal required permissions
   - Use strong, unique passwords
   - Consider using database connection pooling
   - Enable database encryption at rest

3. **CORS Configuration**
   - Restrict CORS to only necessary domains
   - In production, specify exact origins instead of using wildcards

## Authentication & Authorization

1. **JWT Best Practices**
   - Use a short expiration time for tokens (1-24 hours)
   - Consider implementing refresh tokens for prolonged sessions
   - Regularly rotate JWT signing keys

2. **Password Policies**
   - Enforce strong password requirements
   - Implement account lockout after failed attempts
   - Use bcrypt for password hashing (already implemented)

3. **Session Management**
   - The application uses stateless JWT tokens
   - Implement an endpoint for token revocation if needed

## Deployment

1. **HTTPS**
   - Always use HTTPS in production
   - Configure proper SSL/TLS settings
   - Use secure ciphers and protocols
   - Consider using HSTS headers

2. **Server Hardening**
   - Keep all software updated
   - Use a firewall
   - Apply principle of least privilege
   - Consider using a reverse proxy like Nginx

3. **Docker Security**
   - Use specific version tags instead of `latest`
   - Run containers as non-root users when possible
   - Set resource limits
   - Scan container images for vulnerabilities

## Monitoring & Response

1. **Logging**
   - Review logs regularly
   - Set appropriate log levels
   - Don't log sensitive information
   - Consider using centralized logging solution

2. **Incident Response**
   - Have a plan for security breaches
   - Document steps to take when vulnerabilities are discovered
   - Regular security testing and reviews

## Regular Maintenance

1. **Dependency Updates**
   - Regularly update all dependencies
   - Check for security vulnerabilities in dependencies
   - Use tools like npm audit, OWASP Dependency Check, or Snyk

2. **Security Testing**
   - Conduct periodic security reviews
   - Consider penetration testing
   - Use security scanners

## User Data Protection

1. **Data Minimization**
   - Only collect necessary data
   - Implement data retention policies

2. **Input Validation**
   - Validate all user inputs
   - Use parameterized queries (already implemented with JPA)
   - Implement output encoding to prevent XSS

## Security Contacts

For reporting security vulnerabilities, please contact:

- Security Team: security@example.com
- Admin: admin@example.com

## Database Security

1. **PostgreSQL Configuration**
   - Use strong, unique passwords for database users
   - Create a dedicated database user with minimal required permissions
   - Enable SSL for database connections
   - Configure `pg_hba.conf` to restrict IP access
   - Regularly update PostgreSQL to the latest secure version
   - Use encrypted connections with `ssl = on` in postgresql.conf

2. **PostgreSQL Hardening**
   - Disable remote connections if not needed: `listen_addresses = 'localhost'`
   - Implement connection rate limiting
   - Set appropriate resource limits to prevent DoS attacks
   - Configure appropriate authentication methods (prefer SCRAM-SHA-256 over MD5)
   - Remove unused PostgreSQL modules and features
   - Disable superuser login via network connections

3. **Data Protection**
   - Implement row-level security for multi-tenant data
   - Use column-level encryption for sensitive data
   - Consider using pgcrypto for data encryption
   - Implement appropriate backup encryption
   - Apply the principle of least privilege for database users

4. **PostgreSQL Auditing**
   - Enable PostgreSQL logging for security events
   - Configure log_connections and log_disconnections
   - Consider using pgaudit extension for comprehensive audit logging
   - Regularly review database logs
   - Monitor for unusual access patterns

5. **Backup Security**
   - Secure backup files with encryption
   - Store backups in a secure, off-site location
   - Test backup restoration regularly
   - Implement appropriate access controls for backup files
   - Consider using tools like pgBackRest with encryption

## Linux/Unix Server Security

1. **System Hardening**
   - Keep the system updated with security patches
   - Use a firewall (UFW, iptables) to restrict access
   - Disable unused services and ports
   - Use SSH key authentication and disable password login
   - Implement fail2ban to prevent brute-force attacks

2. **User Management**
   - Create dedicated service accounts with limited privileges
   - Apply the principle of least privilege
   - Remove unnecessary users and groups
   - Enforce strong password policies
   - Implement regular password rotation

3. **File System Security**
   - Set appropriate file permissions
   - Use file system encryption for sensitive data
   - Regularly check for unauthorized setuid/setgid files
   - Implement disk quota to prevent DoS attacks
   - Consider using AppArmor or SELinux for additional protection

4. **Docker Security**
   - Keep Docker updated to the latest version
   - Use specific version tags instead of `latest`
   - Run containers as non-root users
   - Limit container resources
   - Use read-only file systems where possible
   - Scan container images for vulnerabilities
   - Implement network segmentation for containers 