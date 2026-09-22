// Shown instantly while a customer page renders on the server, so a tap never feels ignored.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Ачаалж байна" className="loading">
      <div className="skel" style={{ height: 30, width: "55%", margin: "22px 20px 18px" }} />
      <div className="skel mx" style={{ height: 180, borderRadius: 24 }} />
      <div className="skel mx" style={{ height: 76, marginTop: 14 }} />
      <div className="skel mx" style={{ height: 76, marginTop: 10 }} />
      <div className="skel mx" style={{ height: 54, marginTop: 10 }} />
    </div>
  );
}
