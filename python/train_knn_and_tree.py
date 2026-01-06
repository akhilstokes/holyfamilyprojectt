import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import classification_report, accuracy_score

# Resolve CSV relative to repo root
ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "datasets" / "balanced_quality_dataset.csv"

print("\n🎓 TRAINING KNN AND DECISION TREE (Python)")
print(f"Dataset: {CSV}")

# 1) Load data
df = pd.read_csv(CSV)

# 2) Features/labels
X = df[["drcPercentage", "moistureContent", "impurities", "colorScore"]].values
y = df["qualityGrade"].values

# 3) Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 4) KNN (with scaling)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=3, metric="euclidean")
knn.fit(X_train_scaled, y_train)
y_pred_knn = knn.predict(X_test_scaled)

print("\n=== KNN ===")
print("Accuracy:", accuracy_score(y_test, y_pred_knn))
print(classification_report(y_test, y_pred_knn))

# 5) Decision Tree (no scaling needed)
tree = DecisionTreeClassifier(criterion="gini", max_depth=4, random_state=42)
tree.fit(X_train, y_train)
y_pred_tree = tree.predict(X_test)

print("\n=== Decision Tree ===")
print("Accuracy:", accuracy_score(y_test, y_pred_tree))
print(classification_report(y_test, y_pred_tree))
print("\nTree rules:\n", export_text(tree, feature_names=["drcPercentage", "moistureContent", "impurities", "colorScore"]))

# 6) Predict same sample with both
sample = [[65.5, 0.5, 0.3, 9.0]]
print("\nSample:", sample[0])
print("KNN →", knn.predict(scaler.transform(sample))[0])
print("Tree →", tree.predict(sample)[0])



