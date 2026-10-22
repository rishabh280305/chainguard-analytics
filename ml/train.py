"""Fit an Isolation Forest only on exported real ChainGuard observations."""
import argparse,json
from pathlib import Path
import joblib,pandas as pd
from sklearn.ensemble import IsolationForest
FEATURES=["value_eth","gas_used","input_bytes","log_count","contract_interaction","execution_reverted"]
def main():
 p=argparse.ArgumentParser();p.add_argument("csv");p.add_argument("--out",default="artifacts");p.add_argument("--contamination",type=float,default=.05);a=p.parse_args();data=pd.read_csv(a.csv);clean=data.dropna(subset=FEATURES).copy()
 if len(clean)<32:raise ValueError("At least 32 complete, genuine indexed transactions are required")
 model=IsolationForest(n_estimators=300,contamination=a.contamination,random_state=42);model.fit(clean[FEATURES]);clean["anomaly_score"]=-model.score_samples(clean[FEATURES]);clean["model_label"]=model.predict(clean[FEATURES]);out=Path(a.out);out.mkdir(parents=True,exist_ok=True);joblib.dump(model,out/"isolation_forest.joblib");clean[["hash","anomaly_score","model_label"]].to_csv(out/"scores.csv",index=False);(out/"metrics.json").write_text(json.dumps({"rows":len(clean),"features":FEATURES,"contamination":a.contamination,"score_min":float(clean.anomaly_score.min()),"score_max":float(clean.anomaly_score.max()),"limitation":"Unsupervised outlier labels are not fraud labels."},indent=2))
if __name__=="__main__":main()
