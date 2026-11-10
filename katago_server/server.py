"""
KataGo Human-SL Daemon & Sparring Server
Provides REST API for full-blood KataGo humanSL play over LAN,
as well as serving the frontend SPA static files for tablet / local play.
Zero third-party dependencies (pure standard library).
"""

import os
import sys
import json
import time
import socket
import logging
import threading
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("KataGoServer")

DIR_PATH = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(DIR_PATH)
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")

GTP_COLS = "ABCDEFGHJKLMNOPQRST"

def point_to_gtp(x: int, y: int, size: int) -> str:
    if 0 <= x < len(GTP_COLS) and 0 <= y < size:
        col = GTP_COLS[x]
        row = size - y
        return f"{col}{row}"
    return "pass"

def gtp_to_point(gtp_str: str, size: int):
    cleaned = gtp_str.strip().upper()
    if not cleaned or cleaned == "PASS" or cleaned == "RESIGN":
        return None
    try:
        col_char = cleaned[0]
        row_num = int(cleaned[1:])
        x = GTP_COLS.index(col_char)
        y = size - row_num
        if 0 <= x < size and 0 <= y < size:
            return {"x": x, "y": y}
    except Exception as e:
        logger.warning(f"Failed to parse GTP coordinate '{gtp_str}': {e}")
    return None

def get_lan_ip():
    try:
        # Check local network interfaces for 192.168.* or 10.*
        addrs = socket.getaddrinfo(socket.gethostname(), None)
        for item in addrs:
            ip = item[4][0]
            if ip.startswith("192.168.") or ip.startswith("10."):
                return ip
    except Exception:
        pass
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class KataGoProcess:
    def __init__(self):
        self.lock = threading.Lock()
        self.proc = None
        self.current_profile = None
        self.current_visits = None
        self.current_temp = None
        self.current_board_size = None
        self.current_moves = []
        self.start_process()

    def start_process(self):
        katago_exe = os.path.join(DIR_PATH, "katago.exe")
        cfg_path = os.path.join(DIR_PATH, "gtp_server.cfg")
        model_path = os.path.join(DIR_PATH, "kata1-b18c384nbt.bin.gz")
        human_model_path = os.path.join(DIR_PATH, "b18c384nbt-humanv0.bin.gz")

        if not os.path.exists(katago_exe):
            raise FileNotFoundError(f"KataGo executable not found: {katago_exe}")

        cmd = [
            katago_exe,
            "gtp",
            "-config", cfg_path,
            "-model", model_path,
            "-human-model", human_model_path
        ]
        logger.info(f"Starting KataGo process: {' '.join(cmd)}")
        self.proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            cwd=DIR_PATH
        )

        # Handshake with KataGo using 'name' command
        self.proc.stdin.write("name\n")
        self.proc.stdin.flush()
        while True:
            line = self.proc.stdout.readline()
            if not line:
                break
            if line.startswith("="):
                logger.info(f"KataGo GTP engine initialized and ready: {line.strip()}")
                break
        # Consume any trailing newline
        self.proc.stdout.readline()

    def send_command(self, cmd: str) -> str:
        if self.proc.poll() is not None:
            logger.warning("KataGo process died, restarting...")
            self.start_process()

        self.proc.stdin.write(cmd + "\n")
        self.proc.stdin.flush()

        response_lines = []
        while True:
            line = self.proc.stdout.readline()
            if not line:
                break
            stripped = line.strip()
            if stripped == "" and response_lines:
                # GTP empty line marks end of response
                break
            if stripped:
                response_lines.append(stripped)

        raw = "\n".join(response_lines)
        if raw.startswith("="):
            return raw[1:].strip()
        elif raw.startswith("?"):
            logger.error(f"GTP Error for command '{cmd}': {raw}")
            raise RuntimeError(f"GTP Error: {raw}")
        return raw.strip()

    def generate_move(self, board_size: int, move_history: list, turn: str, level: str, komi: float = 7.5):
        with self.lock:
            t0 = time.time()
            # Map level to Human-SL profile, visits & temperature
            lvl = (level or "").lower()
            if lvl in ["18k", "novice", "beginner"]:
                profile = "rank_20k"
                visits = 1
                temp = 1.30
            elif lvl in ["17k", "intermediate", "club"]:
                profile = "rank_20k"
                visits = 1
                temp = 1.10
            elif lvl in ["16k", "master", "advanced"]:
                profile = "rank_18k"
                visits = 1
                temp = 0.95
            else:  # 15k, grandmaster, default
                profile = "rank_15k"
                visits = 1
                temp = 0.75

            # Update parameters on the fly if changed
            if self.current_profile != profile:
                self.send_command(f"kata-set-param humanSLProfile {profile}")
                self.current_profile = profile
            if self.current_visits != visits:
                self.send_command(f"kata-set-param maxVisits {visits}")
                self.current_visits = visits
            if self.current_temp != temp:
                self.send_command(f"kata-set-param chosenMoveTemperature {temp}")
                self.send_command(f"kata-set-param chosenMoveTemperatureEarly {temp}")
                self.send_command("kata-set-param chosenMoveTemperatureOnlyBelowProb 1.0")
                self.current_temp = temp

            # Check if current board in KataGo matches move_history prefix (incremental sync)
            is_incremental = (
                self.current_board_size == board_size and
                len(move_history) >= len(self.current_moves) and
                all(
                    m1.get("x") == m2.get("x") and
                    m1.get("y") == m2.get("y") and
                    m1.get("color") == m2.get("color")
                    for m1, m2 in zip(self.current_moves, move_history[:len(self.current_moves)])
                )
            )

            if not is_incremental:
                # Reset board and replay full history
                self.send_command(f"boardsize {board_size}")
                self.send_command("clear_board")
                self.send_command(f"komi {komi}")
                self.current_board_size = board_size
                self.current_moves = []
                new_moves = move_history
            else:
                # Only play delta moves since last turn
                new_moves = move_history[len(self.current_moves):]

            for m in new_moves:
                m_color = "B" if m.get("color") == "black" else "W"
                gtp_pos = point_to_gtp(m.get("x", -1), m.get("y", -1), board_size)
                self.send_command(f"play {m_color} {gtp_pos}")
                self.current_moves.append(m)

            # Request move
            ai_color = "B" if turn == "black" else "W"
            res = self.send_command(f"genmove {ai_color}")
            duration_ms = int((time.time() - t0) * 1000)

            pt = gtp_to_point(res, board_size)
            if pt:
                self.current_moves.append({"x": pt["x"], "y": pt["y"], "color": turn})

            logger.info(f"[{profile}|t={temp}|{visits}v|{len(self.current_moves)}m] Move generated: {res} -> {pt} in {duration_ms}ms (incremental={is_incremental})")

            return {
                "move": pt,
                "gtpMove": res,
                "profile": profile,
                "visits": visits,
                "temperature": temp,
                "durationMs": duration_ms
            }


KATAGO_ENGINE = None

class AppRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR if os.path.exists(DIST_DIR) else DIR_PATH, **kwargs)

    def end_headers(self):
        # Enable permissive CORS for mobile / LAN access
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/status" or parsed.path == "/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            data = {
                "ok": True,
                "engine": "KataGo v1.15.3 Human-SL",
                "model": "kata1-b18c384nbt + b18c384nbt-humanv0",
                "lanIp": get_lan_ip(),
                "port": 8765,
                "currentProfile": KATAGO_ENGINE.current_profile or "rank_15k"
            }
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        if parsed.path == "/api/last_game":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            data = {
                "ok": True,
                "boardSize": KATAGO_ENGINE.current_board_size,
                "moves": KATAGO_ENGINE.current_moves,
                "totalMoves": len(KATAGO_ENGINE.current_moves)
            }
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        # SPA Fallback: if requesting a route that doesn't exist on disk, serve index.html
        local_path = self.translate_path(self.path)
        if not os.path.exists(local_path) and os.path.exists(os.path.join(DIST_DIR, "index.html")):
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/record":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(body)

                records_file = os.path.join(DIR_PATH, "game_records.json")
                existing = []
                if os.path.exists(records_file):
                    try:
                        with open(records_file, "r", encoding="utf-8") as rf:
                            existing = json.load(rf)
                    except Exception:
                        existing = []

                incoming = payload.get("records") if isinstance(payload, dict) and "records" in payload else [payload]
                for r in incoming:
                    if r and isinstance(r, dict):
                        existing.append(r)

                with open(records_file, "w", encoding="utf-8") as wf:
                    json.dump(existing, wf, ensure_ascii=False, indent=2)
                logger.info(f"Successfully recorded {len(incoming)} game record(s) to local file")

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "saved": len(incoming)}).encode("utf-8"))
            except Exception as e:
                logger.error(f"Error handling /api/record: {e}", exc_info=True)
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode("utf-8"))
            return
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(body)

                board_size = int(payload.get("boardSize", 19))
                move_history = payload.get("moveHistory", [])
                turn = payload.get("turn", "white")
                level = payload.get("sparringLevel", "15k")
                komi = float(payload.get("komi", 7.5))

                result = KATAGO_ENGINE.generate_move(board_size, move_history, turn, level, komi)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, **result}).encode("utf-8"))
            except Exception as e:
                logger.error(f"Error handling /api/move: {e}", exc_info=True)
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()


def run():
    global KATAGO_ENGINE
    logger.info("Initializing KataGo Human-SL background engine...")
    KATAGO_ENGINE = KataGoProcess()

    port = 8765
    server_address = ("0.0.0.0", port)
    lan_ip = get_lan_ip()

    httpd = HTTPServer(server_address, AppRequestHandler)
    print("=" * 65)
    print("KataGo Human-SL Daemon running successfully!")
    print(f"LAN API & Web Portal: http://{lan_ip}:{port}")
    print(f"Localhost:           http://localhost:{port}")
    print("Ready to serve tablet & web sparring moves!")
    print("=" * 65)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down KataGo server...")
        if KATAGO_ENGINE and KATAGO_ENGINE.proc:
            KATAGO_ENGINE.proc.terminate()
        httpd.server_close()

if __name__ == "__main__":
    run()
