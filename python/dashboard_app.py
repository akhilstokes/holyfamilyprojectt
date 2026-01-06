import time
from typing import Dict, Any
import requests
import pandas as pd
import streamlit as st
from pathlib import Path

API_URL = st.secrets.get("API_URL", "http://127.0.0.1:8000")
ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "datasets" / "balanced_quality_dataset.csv"
FEATURES = ["drcPercentage", "moistureContent", "impurities", "colorScore"]

st.set_page_config(page_title="Polymer Quality - Realtime Dashboard", layout="wide")
st.title("Polymer Quality - Realtime Dashboard")
st.caption("KNN • Naive Bayes • Decision Tree • SVM • MLP (Backprop)")

@st.cache_data(show_spinner=False)
def load_data() -> pd.DataFrame:
    return pd.read_csv(CSV)

def predict_one(model: str, row: Dict[str, Any]) -> str:
    payload = {"model": model, "features": row}
    r = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
    r.raise_for_status()
    return r.json()["prediction"]

df = load_data()
left, right = st.columns([1, 2])

with left:
    st.subheader("Controls")
    models = requests.get(f"{API_URL}/models", timeout=5).json()["models"]
    model = st.selectbox("Model", options=models, index=0)
    delay = st.slider("Interval (seconds)", 0.2, 2.0, 0.6, 0.1)
    max_rows = st.slider("Rows to stream", 10, int(min(500, len(df))), 100, 10)
    start_btn = st.button("Start Streaming", type="primary")
    stop_btn = st.button("Stop")

    if "running" not in st.session_state:
        st.session_state.running = False
        st.session_state.idx = 0
        st.session_state.stats = {}

    if start_btn:
        st.session_state.running = True
    if stop_btn:
        st.session_state.running = False

with right:
    st.subheader("Live Predictions")
    chart_placeholder = st.empty()
    table_placeholder = st.empty()

if st.session_state.running:
    stats = st.session_state.stats
    rows = []
    for _ in range(max_rows):
        i = st.session_state.idx % len(df)
        row = df.iloc[i][FEATURES].to_dict()
        y_pred = predict_one(model, row)
        stats[y_pred] = stats.get(y_pred, 0) + 1
        row_out = {**row, "prediction": y_pred}
        rows.append(row_out)
        st.session_state.idx += 1
        chart_df = pd.DataFrame({"count": stats}).T
        chart_df.columns = ["count"]
        chart_placeholder.bar_chart(chart_df)
        table_placeholder.dataframe(pd.DataFrame(rows).tail(15), use_container_width=True, hide_index=True)
        time.sleep(delay)
else:
    if st.session_state.get("stats"):
        chart_df = pd.DataFrame({"count": st.session_state.stats}).T
        chart_df.columns = ["count"]
        chart_placeholder.bar_chart(chart_df)





