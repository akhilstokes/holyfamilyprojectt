# Python ML Service (KNN, Naive Bayes, Decision Tree, SVM, MLP)

## Setup

```bash
cd "G:\holy-family-polymers (2)\holy-family-polymers\python"
python -m venv .venv
.venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt
```

## Train models (all 5)

```bash
python train_all_models.py
```

This trains and saves: `scaler.joblib`, `knn_model.joblib`, `tree_model.joblib`, `naive_bayes_model.joblib`, `svm_model.joblib`, `mlp_model.joblib`.

## Run API (predictions)

```bash
uvicorn ml_api:app --reload --host 127.0.0.1 --port 8000
```

- List models: GET `http://127.0.0.1:8000/models`
- Predict: POST `http://127.0.0.1:8000/predict`

Example body:

```json
{
  "model": "knn",
  "features": {"drcPercentage": 65.5, "moistureContent": 0.5, "impurities": 0.3, "colorScore": 9.0}
}
```

## Run realtime dashboard

In a second terminal (after the API is running):

```bash
streamlit run dashboard_app.py
```

Use the controls to start streaming predictions from `datasets/balanced_quality_dataset.csv` and see live charts and a rolling table.
