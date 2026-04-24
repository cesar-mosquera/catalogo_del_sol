#!/usr/bin/env python3
"""
Servidor HTTP multihilo para Catálogo Pinchos y Chuletas Del Sol
Soporta múltiples conexiones simultáneas desde diferentes dispositivos
"""

import http.server
import socketserver
from http.server import SimpleHTTPRequestHandler
import os
import sys

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Cambiar a directorio actual
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Puerto
PORT = 8000

# ThreadingTCPServer permite múltiples conexiones simultáneas
class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        """Agregar headers para evitar caching y CORS"""
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Log mejorado para ver conexiones"""
        print(f"[{self.client_address[0]}:{self.client_address[1]}] {format % args}")

if __name__ == "__main__":
    handler = MyHTTPRequestHandler
    
    with ThreadingHTTPServer(("", PORT), handler) as httpd:
        print(f"🔥 Servidor activado en: http://192.168.18.37:{PORT}")
        print(f"📱 O accede desde esta PC: http://localhost:{PORT}")
        print(f"✅ Soporta múltiples conexiones simultáneas (2+)")
        print(f"🛑 Presiona CTRL+C para detener\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n❌ Servidor detenido")
