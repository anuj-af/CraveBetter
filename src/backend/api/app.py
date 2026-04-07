import json
import logging
import os
from typing import Any, Dict, List

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LLM_API_URL = os.getenv("LLM_API_URL", "http://127.0.0.1:1234/v1/chat/completions")
LLM_MODEL = os.getenv("LLM_MODEL", "phi-3.1-mini-128k-instruct")
USE_MOCK_LLM = os.getenv("USE_MOCK_LLM", "true").lower() == "true"

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
        }
    },
)


def _heuristic_response(food: str, goal: str, time_of_day: str) -> Dict[str, Any]:
    text = f"{food} {goal} {time_of_day}".lower()

    unhealthy_tokens = {
        "fried": 2,
        "soda": 2,
        "sugary": 2,
        "chips": 2,
        "pizza": 1,
        "burger": 2,
        "pastry": 2,
        "ice cream": 2,
        "late night": 1,
    }
    healthy_tokens = {
        "salad": 2,
        "grilled": 2,
        "fruit": 2,
        "yogurt": 1,
        "oats": 2,
        "vegetable": 2,
        "lean": 1,
        "protein": 1,
        "whole grain": 2,
    }

    issues: List[str] = []
    score = 6

    for token, penalty in unhealthy_tokens.items():
        if token in text:
            score -= penalty
    for token, bonus in healthy_tokens.items():
        if token in text:
            score += bonus

    if "late" in time_of_day.lower() and any(x in text for x in ["fried", "pizza", "burger", "ice cream"]):
        score -= 1
        issues.append("Heavy meal late in the day may affect sleep and recovery.")

    if any(x in text for x in ["soda", "sugary", "pastry", "ice cream"]):
        issues.append("High sugar load can cause energy spikes and crashes.")
    if any(x in text for x in ["fried", "burger", "chips"]):
        issues.append("High saturated fat and low fiber balance.")
    if not issues:
        issues.append("No major red flags, but portion and balance still matter.")

    score = max(1, min(10, score))
    tag = "healthy" if score >= 6 else "unhealthy"

    improvement = "Keep the same meal but reduce portion by 20% and add a fiber side like salad or fruit."
    alternative = "Try a grilled wrap or rice bowl with similar flavors but less oil and sugar."

    if "pizza" in text:
        alternative = "Try thin-crust veggie pizza with extra protein and a side salad."
    if "burger" in text:
        alternative = "Try a grilled chicken burger or bean burger with baked wedges."
    if "ice cream" in text:
        alternative = "Try Greek yogurt with fruit and dark chocolate chips for the same sweet craving."

    explanation = (
        f"For your goal ({goal}) and timing ({time_of_day}), this choice scores {score}/10. "
        "Improve by changing preparation style and adding fiber/protein instead of removing foods you enjoy."
    )

    feeling = "Likely satisfied short-term, but may feel sluggish later if this becomes frequent."
    if score >= 8:
        feeling = "Likely energized and steady for the next few hours."

    return {
        "score": score,
        "issues": issues,
        "improvement": improvement,
        "alternative": alternative,
        "explanation": explanation,
        "feeling": feeling,
        "tag": tag,
    }


def _llm_analyze(food: str, goal: str, time_of_day: str) -> Dict[str, Any]:
    system_prompt = (
        "You are the AI engine behind CraveBetter, helping users make practical and realistic food "
        "decisions while building sustainable habits. Avoid extreme or unrealistic advice."
    )
    user_prompt = f"""
Food: {food}
Goal: {goal}
Time: {time_of_day}

TASK:
1. Break down food
2. Evaluate healthiness
3. Score (1-10)
4. Identify issues
5. Suggest:
   - One small improvement
   - One better alternative (same craving)
6. Explain briefly
7. Predict how user may feel
8. (Optional) Tag meal as healthy/unhealthy for tracking

OUTPUT (STRICT JSON):
{{
  "score": number,
  "issues": [string],
  "improvement": string,
  "alternative": string,
  "explanation": string,
  "feeling": string,
  "tag": "healthy" | "unhealthy"
}}
""".strip()

    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 350,
    }

    response = requests.post(LLM_API_URL, json=payload, timeout=8)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    parsed = json.loads(content)

    required_keys = {"score", "issues", "improvement", "alternative", "explanation", "feeling", "tag"}
    if not required_keys.issubset(set(parsed.keys())):
        raise ValueError("LLM response missing required fields")

    parsed["score"] = max(1, min(10, int(parsed["score"])))
    parsed["issues"] = parsed["issues"] if isinstance(parsed["issues"], list) else [str(parsed["issues"])]
    parsed["tag"] = "healthy" if str(parsed["tag"]).lower() == "healthy" else "unhealthy"
    return parsed


@app.get("/api/health")
def health() -> Any:
    return jsonify({"status": "ok", "service": "cravebetter-api", "mockMode": USE_MOCK_LLM})


@app.post("/api/analyze")
def analyze_food() -> Any:
    payload = request.get_json(silent=True) or {}
    food = str(payload.get("food", "")).strip()
    goal = str(payload.get("goal", "General health")).strip() or "General health"
    time_of_day = str(payload.get("time", "Anytime")).strip() or "Anytime"

    if not food:
        return jsonify({"error": "food is required"}), 400

    if USE_MOCK_LLM:
        result = _heuristic_response(food=food, goal=goal, time_of_day=time_of_day)
        result["source"] = "heuristic"
        return jsonify(result)

    try:
        result = _llm_analyze(food=food, goal=goal, time_of_day=time_of_day)
        result["source"] = "llm"
        return jsonify(result)
    except Exception as exc:
        logger.warning("LLM analyze failed, using heuristic fallback: %s", exc)
        result = _heuristic_response(food=food, goal=goal, time_of_day=time_of_day)
        result["source"] = "heuristic"
        return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
