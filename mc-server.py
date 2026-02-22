#!/usr/bin/env python3
"""Mission Control server with basic auth."""
import http.server
import os
import base64
import hashlib
import secrets

DIRECTORY = "/Users/knut/.openclaw/workspace"
PORT = 8891
BIND = "0.0.0.0"

# Auth token stored in a file — generated on first run
TOKEN_FILE = os.path.join(DIRECTORY, ".mc-token")

def get_or_create_token():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            return f.read().strip()
    token = secrets.token_urlsafe(24)
    with open(TOKEN_FILE, "w") as f:
        f.write(token)
    os.chmod(TOKEN_FILE, 0o600)
    return token

TOKEN = get_or_create_token()

class AuthHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Check for token in query string or cookie
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        # Check query param ?token=xxx
        if "token" in params and params["token"][0] == TOKEN:
            # Set cookie and redirect to clean URL
            self.send_response(302)
            self.send_header("Set-Cookie", f"mc_auth={TOKEN}; Path=/; Max-Age=31536000; SameSite=Strict")
            clean_path = parsed.path or "/"
            self.send_header("Location", clean_path)
            self.end_headers()
            return

        # Check cookie
        cookie_header = self.headers.get("Cookie", "")
        cookies = dict(c.strip().split("=", 1) for c in cookie_header.split(";") if "=" in c)
        if cookies.get("mc_auth") == TOKEN:
            # Authorized — serve normally with no-cache headers
            return super().do_GET()

        # Check Basic Auth
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Basic "):
            try:
                decoded = base64.b64decode(auth_header[6:]).decode()
                user, pwd = decoded.split(":", 1)
                if pwd == TOKEN:
                    self.send_response(200)
                    self.send_header("Set-Cookie", f"mc_auth={TOKEN}; Path=/; Max-Age=31536000; SameSite=Strict")
                    self.end_headers()
                    return super().do_GET()
            except Exception:
                pass

        # Not authorized — send login page
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(LOGIN_PAGE.encode())

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs

LOGIN_PAGE = """<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mission Control — Login</title>
<style>
  :root { --bg: #0d1117; --surface: #161b22; --border: #30363d; --text: #e6edf3; --accent: #58a6ff; --red: #f85149; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .login { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 40px; width: 360px; text-align: center; }
  .login h1 { font-size: 20px; margin-bottom: 8px; }
  .login h1 span { color: var(--accent); }
  .login p { font-size: 13px; color: #8b949e; margin-bottom: 24px; }
  .login input { width: 100%; padding: 12px 16px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; outline: none; margin-bottom: 16px; text-align: center; letter-spacing: 2px; }
  .login input:focus { border-color: var(--accent); }
  .login button { width: 100%; padding: 12px; background: var(--accent); color: var(--bg); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .login button:hover { opacity: 0.9; }
  .error { color: var(--red); font-size: 12px; margin-bottom: 12px; display: none; }
</style>
</head><body>
<div class="login">
  <h1>⚡ <span>Mission Control</span></h1>
  <p>Enter access token</p>
  <div class="error" id="error">Invalid token</div>
  <input type="password" id="token" placeholder="Token" autofocus>
  <button onclick="login()">Enter</button>
</div>
<script>
function login() {
  const token = document.getElementById('token').value.trim();
  if (token) window.location.href = '?token=' + encodeURIComponent(token);
}
document.getElementById('token').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
// Check if redirected back (bad token)
if (document.cookie.includes('mc_auth=')) { /* already logged in */ }
</script>
</body></html>"""

if __name__ == "__main__":
    print(f"Mission Control on http://{BIND}:{PORT}")
    print(f"Token: {TOKEN}")
    server = http.server.HTTPServer((BIND, PORT), AuthHandler)
    server.serve_forever()
