"""
Trend Analyzer backend service.

Accepts a social video URL (TikTok, Instagram Reels, YouTube Shorts),
downloads it, sends to Gemini for analysis, returns a structured brief.

Run locally:
    cp .env.example .env   # add your GEMINI_API_KEY
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

import json
import os
import tempfile
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from google import genai
except ImportError as e:
    raise SystemExit("Missing dependency: pip install google-genai") from e

try:
    import yt_dlp
except ImportError as e:
    raise SystemExit("Missing dependency: pip install yt-dlp") from e


GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_FILE_SIZE_MB", "100"))

ANALYSIS_PROMPT = """You are a social media content strategist writing briefs for clients who are not technical.

Analyze this video and return a JSON object with the following structure.
Return ONLY valid JSON, no markdown fences, no preamble. Write in plain,
conversational language that anyone can understand.

{
  "summary": "2-3 sentence plain-English summary of the video",
  "category": "e.g. comedy, tutorial, lifestyle, fitness, food, fashion, etc.",
  "hook": "One sentence describing what grabs attention in the first few seconds",
  "format": "e.g. talking head, skit, before/after, POV, GRWM, tutorial, transition",
  "audio": "Describe the sound: trending audio, voiceover, original audio, music, etc.",
  "why_it_works": ["2-4 plain-English reasons why this video performs well"],
  "how_to_recreate": ["Simple step-by-step instructions anyone could follow to make a similar video"],
  "what_you_need": "Equipment and setup needed, e.g. phone, tripod, good lighting",
  "caption_tips": "How to write the caption and what kind of hashtags to use"
}
"""

COMMENTS_ADDENDUM = """

TOP COMMENTS FROM THIS VIDEO:
Use these to understand what viewers liked. Add this to your JSON:
"comment_analysis": {{
  "what_viewers_loved": ["2-3 things commenters reacted to most"],
  "audience_type": "One sentence describing who watches this content",
  "ideas_from_comments": ["Any content ideas or requests viewers suggested"]
}}

COMMENTS:
{comments_text}
"""


app = FastAPI(title="Trend Analyzer")

cors_origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def get_client() -> genai.Client:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise HTTPException(500, "GEMINI_API_KEY not set on the server")
    return genai.Client(api_key=key)


def download_video(url: str, out_dir: Path) -> tuple[Path, dict]:
    ydl_opts = {
        "outtmpl": str(out_dir / "%(id)s.%(ext)s"),
        "format": "mp4/best",
        "merge_output_format": "mp4",
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 30,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        filepath = Path(filename).with_suffix(".mp4")
        if not filepath.exists():
            candidates = list(out_dir.glob(f"{info['id']}.*"))
            if not candidates:
                raise HTTPException(500, f"Download succeeded but file not found for {url}")
            filepath = candidates[0]

        size_mb = filepath.stat().st_size / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            filepath.unlink(missing_ok=True)
            raise HTTPException(413, f"Video is {size_mb:.0f} MB — over {MAX_FILE_SIZE_MB} MB limit")
        return filepath, info


def extract_comments(url: str, max_comments: int = 50) -> list[dict]:
    ydl_opts = {
        "skip_download": True,
        "getcomments": True,
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 30,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            raw = info.get("comments") or []
            raw.sort(key=lambda c: c.get("like_count", 0) or 0, reverse=True)
            return [
                {
                    "text": c.get("text", ""),
                    "likes": c.get("like_count", 0) or 0,
                    "author": c.get("author", "unknown"),
                    "is_pinned": c.get("is_pinned", False),
                }
                for c in raw[:max_comments]
            ]
    except Exception:
        return []


def analyze_video(filepath: Path, client: genai.Client, comments: list[dict]) -> dict:
    uploaded = client.files.upload(file=str(filepath))
    while uploaded.state and uploaded.state.name == "PROCESSING":
        time.sleep(3)
        uploaded = client.files.get(name=uploaded.name)
    if uploaded.state and uploaded.state.name == "FAILED":
        raise HTTPException(502, f"Gemini failed to process the video ({uploaded.state.name})")

    prompt = ANALYSIS_PROMPT
    if comments:
        comments_text = "\n".join(
            f"  - [{c['likes']} likes]{' [PINNED]' if c['is_pinned'] else ''} @{c['author']}: {c['text']}"
            for c in comments
        )
        prompt += COMMENTS_ADDENDUM.format(comments_text=comments_text)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[uploaded, prompt],
    )

    raw_text = (response.text or "").strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[1]
    if raw_text.endswith("```"):
        raw_text = raw_text.rsplit("```", 1)[0]
    raw_text = raw_text.strip()

    try:
        analysis = json.loads(raw_text)
    except json.JSONDecodeError:
        analysis = {"raw_response": raw_text, "parse_error": True}

    try:
        client.files.delete(name=uploaded.name)
    except Exception:
        pass

    return analysis


def detect_platform(url: str) -> str:
    u = url.lower()
    if "tiktok.com" in u:
        return "tiktok"
    if "instagram.com" in u:
        return "instagram"
    if "facebook.com" in u or "fb.watch" in u:
        return "facebook"
    if "youtube.com" in u or "youtu.be" in u:
        return "youtube"
    return "unknown"


class AnalyzeRequest(BaseModel):
    url: str


@app.get("/")
def root():
    return {"service": "trend-analyzer", "model": GEMINI_MODEL, "status": "ok"}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    url = req.url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(400, "url must start with http(s)://")

    client = get_client()
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        try:
            filepath, info = download_video(url, tmp_path)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(502, f"Failed to download video: {e}")

        comments = extract_comments(url)

        try:
            analysis = analyze_video(filepath, client, comments)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(502, f"Gemini analysis failed: {e}")

    metadata = {
        "title": info.get("title") or "",
        "uploader": info.get("uploader") or "",
        "view_count": info.get("view_count"),
        "like_count": info.get("like_count"),
        "comment_count": info.get("comment_count"),
        "duration": info.get("duration"),
        "upload_date": info.get("upload_date"),
        "thumbnail": info.get("thumbnail"),
    }

    return {
        "url": url,
        "platform": detect_platform(url),
        "metadata": metadata,
        "comments_scraped": len(comments),
        "analysis": analysis,
    }
