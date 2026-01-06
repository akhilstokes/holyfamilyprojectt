import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
import joblib
import json

# Resolve CSV relative to repo root
ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "datasets" / "balanced_quality_dataset.csv"
OUT_DIR = Path(__file__).resolve().parent

print("\n🎓 TRAINING FIVE CLASSIFIERS (Python)")
print(f"Dataset: {CSV}")

# 1) Load data
df = pd.read_csv(CSV)

# 2) Features/labels
FEATURES = ["drcPercentage", "moistureContent", "impurities", "colorScore"]
X = df[FEATURES].values
y = df["qualityGrade"].values

# 3) Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 4) Scaler for models that need it
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

results = {}

# KNN
knn = KNeighborsClassifier(n_neighbors=5, metric="euclidean")
knn.fit(X_train_scaled, y_train)
y_pred = knn.predict(X_test_scaled)
results["knn"] = accuracy_score(y_test, y_pred)

# Decision Tree
tree = DecisionTreeClassifier(criterion="gini", max_depth=6, random_state=42)
tree.fit(X_train, y_train)
y_pred = tree.predict(X_test)
results["tree"] = accuracy_score(y_test, y_pred)

# Naive Bayes (Gaussian)
nb = GaussianNB()
nb.fit(X_train, y_train)
y_pred = nb.predict(X_test)
results["naive_bayes"] = accuracy_score(y_test, y_pred)

# SVM (with scaling)
svm = SVC(kernel="rbf", C=2.0, gamma="scale", probability=True, random_state=42)
svm.fit(X_train_scaled, y_train)
y_pred = svm.predict(X_test_scaled)
results["svm"] = accuracy_score(y_test, y_pred)

# MLP (simple backprop classifier)
mlp = MLPClassifier(hidden_layer_sizes=(32, 16), activation="relu", solver="adam", max_iter=500, random_state=42)
mlp.fit(X_train_scaled, y_train)
y_pred = mlp.predict(X_test_scaled)
results["mlp"] = accuracy_score(y_test, y_pred)

print("\n=== ACCURACY ===")
for name, acc in results.items():
    print(f"{name:12s}: {acc:.3f}")

print("\n=== DETAILED REPORT (MLP) ===")
print(classification_report(y_test, y_pred))

print("\n=== TREE RULES ===")
print(export_text(tree, feature_names=FEATURES))

# Persist models and scaler
joblib.dump(scaler, OUT_DIR / "scaler.joblib")
joblib.dump(knn, OUT_DIR / "knn_model.joblib")
joblib.dump(tree, OUT_DIR / "tree_model.joblib")
joblib.dump(nb, OUT_DIR / "naive_bayes_model.joblib")
joblib.dump(svm, OUT_DIR / "svm_model.joblib")
joblib.dump(mlp, OUT_DIR / "mlp_model.joblib")

# --- new: save metrics ---
# for each model, calculate and store metrics
all_metrics = {}
for name, (model, x_eval, y_eval, scaled) in {
    "knn": (knn, X_test_scaled, y_test, True),
    "tree": (tree, X_test, y_test, False),
    "naive_bayes": (nb, X_test, y_test, False),
    "svm": (svm, X_test_scaled, y_test, True),
    "mlp": (mlp, X_test_scaled, y_test, True)
}.items():
    y_pred = model.predict(x_eval)
    all_metrics[name] = {
        "accuracy": accuracy_score(y_eval, y_pred),
        "precision": precision_score(y_eval, y_pred, average="macro", zero_division=0),
        "recall": recall_score(y_eval, y_pred, average="macro", zero_division=0),
        "f1_score": f1_score(y_eval, y_pred, average="macro", zero_division=0)
    }
with open(OUT_DIR / "model_metrics.json", "w") as f:
    json.dump(all_metrics, f, indent=2)

print("\nSaved models to:")
for f in [
    "scaler.joblib",
    "knn_model.joblib",
    "tree_model.joblib",
    "naive_bayes_model.joblib",
    "svm_model.joblib",
    "mlp_model.joblib",
]:
    print("-", OUT_DIR / f)

sample = [[65.5, 0.5, 0.3, 9.0]]
print("\nSample:", sample[0])
print("KNN →", knn.predict(scaler.transform(sample))[0])
print("Tree →", tree.predict(sample)[0])
print("NB   →", nb.predict(sample)[0])
print("SVM  →", svm.predict(scaler.transform(sample))[0])
print("MLP  →", mlp.predict(scaler.transform(sample))[0])


