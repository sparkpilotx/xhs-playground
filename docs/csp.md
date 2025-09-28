# Content Security Policy (CSP) Configuration

This document outlines the consistent approach to configuring Content Security Policy (CSP) within this Electron application.

## Overview

To ensure flexibility during development and strict security in production, CSP is dynamically managed in the Electron main process. This approach avoids redundant CSP declarations and allows for environment-specific policies.

## Configuration Location

The CSP is configured in `src/main/index.ts` within the `createMainWindow` function. It is applied via `mainWindow.webContents.session.webRequest.onHeadersReceived`.

## Policy Details

The CSP directives are set conditionally based on the `app.isPackaged` property:

### Development Environment (`!app.isPackaged`)

In the development environment, a more relaxed CSP is applied to accommodate development tools like Vite, which may inject inline scripts or use `eval`.

**Directives:**
- `default-src 'self'`
- `img-src 'self' https: data:`
- `connect-src 'self' https:`
- `style-src 'self' 'unsafe-inline'` (Allows inline styles for development convenience)
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (Allows inline scripts and `eval` for Vite compatibility)

### Production Environment (`app.isPackaged`)

In the production environment, a stricter CSP is enforced to enhance security by disallowing inline scripts and styles.

**Directives:**
- `default-src 'self'`
- `img-src 'self' https: data:`
- `connect-src 'self' https:`
- `style-src 'self'` (Disallows inline styles)
- `script-src 'self'` (Disallows inline scripts and `eval`)

## HTML Meta Tag Removal

The `Content-Security-Policy` meta tag has been removed from `src/renderer/index.html` to centralize CSP management in the main process and prevent conflicts. All CSP enforcement is now handled programmatically.
