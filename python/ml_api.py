from pathlib import Path
from typing import Literal, Optional, Dict, Any
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.base import ClassifierMixin

ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "datasets" / "balanced_quality_dataset.csv"
HERE = Path(__file__).resolve().parent

FEATURES = ["drcPercentage", "moistureContent", "impurities", "colorScore"]

class FeatureVector(BaseModel):
    drcPercentage: float = Field(..., ge=0, le=100)
    moistureContent: float = Field(..., ge=0, le=100)
    impurities: float = Field(..., ge=0, le=100)
    colorScore: float = Field(..., ge=0, le=100)

class PredictRequest(BaseModel):
    features: FeatureVector
    model: Literal["knn", "tree", "naive_bayes", "svm", "mlp"] = "knn"

def _load_model(path: Path) -> ClassifierMixin:
    if not path.exists():
        raise FileNotFoundError(str(path))
    return joblib.load(path)

def load_all_models() -> Dict[str, Any]:
    models = {}
    scaler_path = HERE / "scaler.joblib"
    models["scaler"] = joblib.load(scaler_path) if scaler_path.exists() else None
    for name, fname in [
        ("knn", "knn_model.joblib"),
        ("tree", "tree_model.joblib"),
        ("naive_bayes", "naive_bayes_model.joblib"),
        ("svm", "svm_model.joblib"),
        ("mlp", "mlp_model.joblib"),
    ]:
        f = HERE / fname
        if f.exists():
            models[name] = _load_model(f)
    return models

app = FastAPI(title="Polymer Quality Classifiers API", version="1.0.0")

MODELS: Dict[str, Any] = {}

@app.on_event("startup")
def _startup() -> None:
    global MODELS
    MODELS = load_all_models()
    if not MODELS:
        raise RuntimeError("No models found. Run python train_all_models.py first.")

@app.get("/models")
def list_models() -> Dict[str, Any]:
    available = sorted([k for k in MODELS.keys() if k != "scaler"])
    return {"models": available, "features": FEATURES}

@app.post("/predict")
def predict(req: PredictRequest) -> Dict[str, Any]:
    if req.model not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model '{req.model}' not loaded")
    model = MODELS[req.model]
    x = [[req.features.drcPercentage, req.features.moistureContent, req.features.impurities, req.features.colorScore]]

    # Scale for models that were trained with scaling
    if req.model in {"knn", "svm", "mlp"} and MODELS.get("scaler") is not None:
        x_proc = MODELS["scaler"].transform(x)
    else:
        x_proc = x

    pred = model.predict(x_proc)[0]
    proba: Optional[Dict[str, float]] = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(x_proc)[0]
        classes = [str(c) for c in getattr(model, "classes_", [])]
        proba = {cls: float(p) for cls, p in zip(classes, probs)}

    return {"model": req.model, "prediction": str(pred), "proba": proba}

@app.get("/sample-stream")
def sample_stream(n: int = 10) -> Dict[str, Any]:
    """Return n sequential predictions over the dataset to simulate a stream."""
    if not CSV.exists():
        raise HTTPException(status_code=500, detail="Dataset not found")
    df = pd.read_csv(CSV)
    df = df[FEATURES].head(max(1, min(n, len(df))))
    rows = df.to_dict(orient="records")
    outputs = []
    for r in rows:
        x = [[r[f] for f in FEATURES]]
        pred = {}
        for name, model in MODELS.items():
            if name == "scaler":
                continue
            if name in {"knn", "svm", "mlp"} and MODELS.get("scaler") is not None:
                x_proc = MODELS["scaler"].transform(x)
            else:
                x_proc = x
            pred[name] = str(model.predict(x_proc)[0])
        outputs.append({"features": r, "pred": pred})
    return {"items": outputs}

# --- Serve metrics for all models ---
import json
@app.get("/metrics")
def get_metrics():
    metrics_path = HERE / "model_metrics.json"
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="Metrics not found")
    return json.loads(metrics_path.read_text())


