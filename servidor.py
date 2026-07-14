#!/usr/bin/env python3
"""
Servidor HTTP para Catálogo — Pinchos y Chuletas Del Sol
Accesible desde cualquier dispositivo en la misma red local (WiFi/LAN universitaria).
Uso: python3 servidor.py
"""

import http.server
import socketserver
import socket
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Cambiar al directorio del proyecto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8080  # Puerto 8080 (más libre en redes universitarias que el 8000)
HOST = "0.0.0.0"  # Escuchar en TODAS las interfaces (WiFi, Ethernet, etc.)


def get_local_ip():
    """Obtiene la IP local de la máquina en la red actual."""
    try:
        # Conectar a un destino externo sin enviar datos — solo para obtener la IP saliente
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class CatalogoHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Sin caché para ver cambios al instante desde cualquier dispositivo
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"  [{self.client_address[0]}] {format % args}")


class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    local_ip = get_local_ip()

    with ThreadingHTTPServer((HOST, PORT), CatalogoHandler) as httpd:
        print()
        print("🔥 ══════════════════════════════════════════════════")
        print(f"   CATÁLOGO DEL SOL — Servidor activo")
        print("══════════════════════════════════════════════════")
        print()
        print(f"📱  Desde el celular (misma red WiFi):")
        print(f"    http://{local_ip}:{PORT}")
        print()
        print(f"💻  Desde esta PC:")
        print(f"    http://localhost:{PORT}")
        print()
        print("ℹ️   Asegúrate de estar en la misma red WiFi/LAN")
        print("🛑  Presiona CTRL+C para detener")
        print()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n❌ Servidor detenido")
